import { spawn } from "child_process";
import path from "path";
import { storage } from "./storage.js";
import type { Assembly, PipelineRun } from "../shared/schema.js";

const AXION_ROOT = path.resolve(process.cwd(), "Axion");

const STAGE_ORDER = [
  "S1_INGEST_NORMALIZE", "S2_VALIDATE_INTAKE", "S3_BUILD_CANONICAL",
  "S4_VALIDATE_CANONICAL", "S5_RESOLVE_STANDARDS", "S6_SELECT_TEMPLATES",
  "S7_RENDER_DOCS", "S8_BUILD_PLAN", "S9_VERIFY_PROOF", "S10_PACKAGE",
];

function buildInitialStages() {
  const stages: Record<string, { status: string; startedAt?: string; completedAt?: string }> = {};
  for (const s of STAGE_ORDER) {
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

  runPipeline(assembly.id, pipelineRun.id).catch((err) => {
    console.error("Pipeline error:", err);
  });

  return pipelineRun;
}

async function runPipeline(assemblyId: number, pipelineRunId: number) {
  const startTime = Date.now();

  const child = spawn("npx", ["tsx", "src/cli/axion.ts", "run"], {
    cwd: AXION_ROOT,
    env: { ...process.env },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  let runId = "";
  const stages = buildInitialStages();

  child.stdout.on("data", async (chunk: Buffer) => {
    const text = chunk.toString();
    stdout += text;

    const runMatch = text.match(/Created run: (RUN-\d+)/);
    if (runMatch) {
      runId = runMatch[1];
      await storage.updatePipelineRun(pipelineRunId, { runId });
      await storage.updateAssembly(assemblyId, { runId });
    }

    for (const line of text.split("\n")) {
      const stageMatch = line.match(/Stage (S\d+_\w+): (pass|fail)/);
      if (stageMatch) {
        const [, stageId, result] = stageMatch;
        stages[stageId] = {
          status: result === "pass" ? "passed" : "failed",
          completedAt: new Date().toISOString(),
        };
        await storage.updatePipelineRun(pipelineRunId, {
          stages,
          currentStage: stageId,
        });
        await storage.updateAssembly(assemblyId, { currentStep: stageId });
      }

      const gateMatch = line.match(/(PASS|FAIL) (G\d+_\w+)/);
      if (gateMatch) {
        await storage.createReport({
          assemblyId,
          runId,
          reportType: "gate_result",
          content: { gate: gateMatch[2], status: gateMatch[1].toLowerCase() },
        });
      }
    }
  });

  child.stderr.on("data", (chunk: Buffer) => {
    stderr += chunk.toString();
  });

  return new Promise<void>((resolve) => {
    child.on("close", async (code) => {
      const duration = Date.now() - startTime;
      const status = code === 0 ? "completed" : "failed";

      await storage.updatePipelineRun(pipelineRunId, {
        status,
        completedAt: new Date(),
        error: code !== 0 ? stderr || `Exit code ${code}` : undefined,
      });

      const assembly = await storage.getAssembly(assemblyId);
      await storage.updateAssembly(assemblyId, {
        status,
        currentStep: code === 0 ? "done" : "failed",
        error: code !== 0 ? stderr || `Exit code ${code}` : undefined,
        totalRuns: (assembly?.totalRuns || 0) + 1,
        totalDurationMs: (assembly?.totalDurationMs || 0) + duration,
        verificationStatus: code === 0 ? "PASS" : "FAIL",
      });

      if (code === 0 && runId) {
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
