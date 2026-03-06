import { spawn, type ChildProcess } from "child_process";
import path from "path";
import fs from "fs";
import { storage } from "./storage.js";
import type { Assembly, PipelineRun } from "../shared/schema.js";
import { getStageOrder } from "../Axion/src/core/orchestration/loader.js";

const AXION_ROOT = path.resolve(process.cwd(), "Axion");

const STALL_TIMEOUT_MS = parseInt(process.env.AXION_STALL_TIMEOUT_MS || "") || 5 * 60 * 1000;
const STALL_CHECK_INTERVAL_MS = 30_000;

interface RunningProcess {
  child: ChildProcess;
  pipelineRunId: number;
  startTime: number;
  lastActivityAt: number;
  currentStage: string;
  runId: string;
}

const runningProcesses = new Map<number, RunningProcess>();
let stallCheckTimer: ReturnType<typeof setInterval> | null = null;

function startStallChecker() {
  if (stallCheckTimer) return;
  stallCheckTimer = setInterval(async () => {
    const now = Date.now();
    for (const [assemblyId, proc] of runningProcesses.entries()) {
      const stalledMs = now - proc.lastActivityAt;
      if (stalledMs > STALL_TIMEOUT_MS) {
        const stalledMinutes = Math.round(stalledMs / 60000);
        const stageInfo = proc.currentStage || "unknown stage";
        console.log(`[stall-detector] Assembly ${assemblyId} stalled on ${stageInfo} for ${stalledMinutes}m — killing`);
        try {
          await killPipeline(assemblyId, `Pipeline stalled on ${stageInfo} — no activity for ${stalledMinutes} minutes`);
        } catch (err) {
          console.error(`[stall-detector] Failed to kill assembly ${assemblyId}:`, err);
        }
      }
    }
    if (runningProcesses.size === 0) {
      stopStallChecker();
    }
  }, STALL_CHECK_INTERVAL_MS);
}

function stopStallChecker() {
  if (stallCheckTimer) {
    clearInterval(stallCheckTimer);
    stallCheckTimer = null;
  }
}

export async function killPipeline(assemblyId: number, errorMessage?: string): Promise<{ killed: boolean; message: string }> {
  const entry = runningProcesses.get(assemblyId);
  if (!entry) {
    return { killed: false, message: "No running pipeline found for this assembly" };
  }

  const { child, pipelineRunId } = entry;
  const killReason = errorMessage || "Pipeline killed by user";

  child.kill("SIGTERM");

  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      try { child.kill("SIGKILL"); } catch {}
      resolve();
    }, 5000);

    child.once("close", () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  const run = await storage.getPipelineRun(pipelineRunId);
  if (run && run.status === "running") {
    const stages = (run.stages || {}) as Record<string, any>;
    for (const key of Object.keys(stages)) {
      if (stages[key].status === "pending" || stages[key].status === "running") {
        stages[key].status = "cancelled";
      }
    }
    await storage.updatePipelineRun(pipelineRunId, {
      status: "failed",
      completedAt: new Date(),
      error: killReason,
      stages,
    });
  }

  const assembly = await storage.getAssembly(assemblyId);
  if (assembly && assembly.status === "running") {
    await storage.updateAssembly(assemblyId, {
      status: "failed",
      currentStep: "killed",
      error: killReason,
    });
  }

  runningProcesses.delete(assemblyId);

  return { killed: true, message: "Pipeline terminated" };
}

const FALLBACK_STAGE_ORDER = [
  "S1_INGEST_NORMALIZE", "S2_VALIDATE_INTAKE", "S3_BUILD_CANONICAL",
  "S4_VALIDATE_CANONICAL", "S5_RESOLVE_STANDARDS", "S6_SELECT_TEMPLATES",
  "S7_RENDER_DOCS", "S8_BUILD_PLAN", "S9_VERIFY_PROOF", "S10_PACKAGE",
];

function getEffectiveStageOrder(): string[] {
  const orchOrder = getStageOrder(process.cwd());
  return orchOrder.length > 0 ? orchOrder : FALLBACK_STAGE_ORDER;
}

function buildInitialStages() {
  const stages: Record<string, { status: string; startedAt?: string; completedAt?: string }> = {};
  for (const s of getEffectiveStageOrder()) {
    stages[s] = { status: "pending" };
  }
  return stages;
}

export async function startPipelineRun(assembly: Assembly): Promise<PipelineRun> {
  await storage.updateAssembly(assembly.id, { status: "running", currentStep: "initializing" });

  const pipelineRun = await storage.createPipelineRun({
    assemblyId: assembly.id,
    runId: "pending",
    plan: "full",
    status: "running",
    stages: buildInitialStages(),
    currentStage: "initializing",
  });

  runPipeline(assembly, pipelineRun.id).catch((err) => {
    console.error("Pipeline error:", err);
  });

  return pipelineRun;
}

async function runPipeline(assembly: Assembly, pipelineRunId: number) {
  const assemblyId = assembly.id;
  const startTime = Date.now();

  const pendingIntakeFilename = `pending_intake_${assemblyId}_${Date.now()}.json`;
  const pendingIntakePath = path.join(AXION_ROOT, ".axion", pendingIntakeFilename);
  fs.mkdirSync(path.dirname(pendingIntakePath), { recursive: true });

  if (assembly.intakePayload) {
    fs.writeFileSync(pendingIntakePath, JSON.stringify(assembly.intakePayload, null, 2));
  }

  const child = spawn("npx", ["tsx", "src/cli/axion.ts", "run"], {
    cwd: AXION_ROOT,
    env: { ...process.env, AXION_PENDING_INTAKE: pendingIntakePath },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const proc: RunningProcess = {
    child,
    pipelineRunId,
    startTime,
    lastActivityAt: Date.now(),
    currentStage: "initializing",
    runId: "",
  };
  runningProcesses.set(assemblyId, proc);
  startStallChecker();

  let stdout = "";
  let stderr = "";
  let runId = "";
  let stdoutBuffer = "";
  let lastTokenApiCalls = 0;
  const stages = buildInitialStages();
  let updateQueue = Promise.resolve();

  function enqueueUpdate(fn: () => Promise<void>) {
    updateQueue = updateQueue.then(fn).catch(() => {});
  }

  child.stdout.on("data", (chunk: Buffer) => {
    const text = chunk.toString();
    stdout += text;
    stdoutBuffer += text;

    proc.lastActivityAt = Date.now();

    const lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop() ?? "";

    for (const line of lines) {
      const runMatch = line.match(/Created run: (RUN-\d+)/);
      if (runMatch) {
        runId = runMatch[1];
        proc.runId = runId;
        enqueueUpdate(async () => {
          await storage.updatePipelineRun(pipelineRunId, { runId });
          await storage.updateAssembly(assemblyId, { runId });
        });
      }

      const stageMatch = line.match(/Stage (S\d+_\w+): (pass|fail)/);
      if (stageMatch) {
        const [, stageId, result] = stageMatch;
        stages[stageId] = {
          status: result === "pass" ? "passed" : "failed",
          completedAt: new Date().toISOString(),
        };
        proc.currentStage = stageId;
        proc.lastActivityAt = Date.now();
        enqueueUpdate(async () => {
          await storage.updatePipelineRun(pipelineRunId, {
            stages,
            currentStage: stageId,
          });
          await storage.updateAssembly(assemblyId, { currentStep: stageId });
        });
      }

      const stageStartMatch = line.match(/Running stage:\s*(S\d+_\w+)/i) || line.match(/\[S(\d+)\]\s*Starting/i);
      if (stageStartMatch) {
        const stageName = stageStartMatch[1];
        proc.currentStage = stageName;
        proc.lastActivityAt = Date.now();
      }

      const gateMatch = line.match(/(PASS|FAIL) (G\d+_\w+)/);
      if (gateMatch) {
        const gate = gateMatch[2];
        const status = gateMatch[1].toLowerCase();
        proc.lastActivityAt = Date.now();
        enqueueUpdate(async () => {
          await storage.createReport({
            assemblyId,
            runId,
            reportType: "gate_result",
            content: { gate, status },
          });
        });
      }

      const tokenMatch = line.match(/^TOKEN_USAGE: (.+)$/);
      if (tokenMatch) {
        proc.lastActivityAt = Date.now();
        try {
          const usage = JSON.parse(tokenMatch[1]);
          const calls = usage.api_calls ?? 0;
          if (calls > lastTokenApiCalls) {
            lastTokenApiCalls = calls;
            const tokenUsage = {
              total_prompt_tokens: usage.total_prompt_tokens ?? 0,
              total_completion_tokens: usage.total_completion_tokens ?? 0,
              total_tokens: usage.total_tokens ?? 0,
              total_cost_usd: usage.total_cost_usd ?? 0,
              api_calls: calls,
              by_stage: usage.by_stage ?? {},
            };
            enqueueUpdate(async () => {
              await storage.updatePipelineRun(pipelineRunId, { tokenUsage });
            });
          }
        } catch (err: any) {
          console.error(`[pipeline] Malformed TOKEN_USAGE line: ${err.message}`);
        }
      }
    }
  });

  child.stderr.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
    proc.lastActivityAt = Date.now();
  });

  return new Promise<void>((resolve) => {
    child.on("close", async (code) => {
      runningProcesses.delete(assemblyId);
      await updateQueue;
      await new Promise((r) => setTimeout(r, 200));
      const duration = Date.now() - startTime;
      const status = code === 0 ? "completed" : "failed";

      try { fs.unlinkSync(pendingIntakePath); } catch {}

      const currentRun = await storage.getPipelineRun(pipelineRunId);
      const alreadyHandled = currentRun && currentRun.status !== "running";

      if (!alreadyHandled) {
        await storage.updatePipelineRun(pipelineRunId, {
          status,
          completedAt: new Date(),
          error: code !== 0 ? stderr || `Exit code ${code}` : undefined,
        });

        const latestAssembly = await storage.getAssembly(assemblyId);
        await storage.updateAssembly(assemblyId, {
          status,
          currentStep: code === 0 ? "done" : "failed",
          error: code !== 0 ? stderr || `Exit code ${code}` : undefined,
          totalRuns: (latestAssembly?.totalRuns || 0) + 1,
          totalDurationMs: (latestAssembly?.totalDurationMs || 0) + duration,
          verificationStatus: code === 0 ? "PASS" : "FAIL",
        });
      }

      if (code === 0 && runId) {
        let tokenUsage = null;
        try {
          const usagePath = path.join(AXION_ROOT, ".axion", "runs", runId, "token_usage.json");
          if (fs.existsSync(usagePath)) {
            tokenUsage = JSON.parse(fs.readFileSync(usagePath, "utf-8"));
          }
        } catch {}

        if (tokenUsage) {
          await storage.updatePipelineRun(pipelineRunId, { tokenUsage });
        }

        await storage.createReport({
          assemblyId,
          runId,
          reportType: "run_complete",
          content: { stdout, duration, stages },
        });
      }

      resolve();
    });
  });
}

export function isRunning(assemblyId: number): boolean {
  return runningProcesses.has(assemblyId);
}

export function getPipelineStatus(): Array<{
  assemblyId: number;
  runId: string;
  currentStage: string;
  startTime: number;
  lastActivityAt: number;
  elapsedMs: number;
  inactiveMs: number;
  stallTimeoutMs: number;
}> {
  const now = Date.now();
  const result = [];
  for (const [assemblyId, proc] of runningProcesses.entries()) {
    result.push({
      assemblyId,
      runId: proc.runId,
      currentStage: proc.currentStage,
      startTime: proc.startTime,
      lastActivityAt: proc.lastActivityAt,
      elapsedMs: now - proc.startTime,
      inactiveMs: now - proc.lastActivityAt,
      stallTimeoutMs: STALL_TIMEOUT_MS,
    });
  }
  return result;
}
