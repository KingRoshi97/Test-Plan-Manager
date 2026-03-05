import { join } from "node:path";
import { existsSync } from "node:fs";
import type { ICPRun, ICPStageRun, ICPRunStatus, ICPStageStatus, StageId } from "./model.js";
import type { RunStore } from "./store.js";
import { AuditLogger } from "./audit.js";
import { STAGE_ORDER, STAGE_GATES, GATES_REQUIRED } from "../../types/run.js";
import { isoNow } from "../../utils/time.js";
import { readJson, writeJson, ensureDir } from "../../utils/fs.js";
import { getRunProfile, evaluatePolicyHook } from "../system/loader.js";

function padRunId(n: number): string {
  return `RUN-${String(n).padStart(6, "0")}`;
}

const VALID_RUN_TRANSITIONS: Record<ICPRunStatus, ICPRunStatus[]> = {
  queued: ["running", "failed"],
  running: ["gated", "failed", "released"],
  gated: ["running", "failed"],
  failed: ["archived"],
  released: ["archived"],
  archived: [],
};

export class RunController {
  constructor(
    private store: RunStore,
    private audit?: AuditLogger,
    private baseDir: string = ".",
  ) {}

  async createRun(config: Record<string, unknown>): Promise<ICPRun> {
    const counterPath = join(this.baseDir, ".axion", "run_counter.json");
    let runNumber = 1;
    if (existsSync(counterPath)) {
      const counter = readJson<{ next: number }>(counterPath);
      runNumber = counter.next;
      counter.next = runNumber + 1;
      writeJson(counterPath, counter);
    } else {
      ensureDir(join(this.baseDir, ".axion"));
      writeJson(counterPath, { next: 2 });
    }

    const runId = padRunId(runNumber);
    const runDir = join(this.baseDir, ".axion", "runs", runId);

    const subdirs = [
      "stage_reports",
      "gates",
      "intake",
      "standards",
      "canonical",
      "planning",
      "templates",
      "proof",
      "verification",
      "kit",
      "state",
      "state/handoff_packet",
    ];
    for (const sub of subdirs) {
      ensureDir(join(runDir, sub));
    }

    const now = isoNow();

    const stages: ICPStageRun[] = STAGE_ORDER.map((sid) => ({
      stage_id: sid,
      icp_status: "not_started" as ICPStageStatus,
      stage_report_ref: null,
    }));

    const requestedProfile = config.profile_id as string ?? "default";
    const resolvedProfile = getRunProfile(this.baseDir, requestedProfile);
    const systemProfileId = resolvedProfile?.profile_id ?? requestedProfile;

    const hookDecision = evaluatePolicyHook("RUN_START", {
      run_id: runId,
      profile_id: systemProfileId,
      pipeline_id: config.pipeline_id as string ?? "axion_default",
    });

    if (hookDecision.decision === "DENY") {
      throw new Error(
        `Policy hook RUN_START denied run creation: ${hookDecision.reason}`,
      );
    }

    const run: ICPRun = {
      run_id: runId,
      icp_status: "queued",
      created_at: now,
      updated_at: now,
      pipeline: {
        pipeline_id: config.pipeline_id as string ?? "axion_default",
        pipeline_version: config.pipeline_version as string ?? "0.2.0",
      },
      profile: {
        profile_id: resolvedProfile?.profile_id ?? (config.profile_id as string ?? "default"),
      },
      stage_order: [...STAGE_ORDER],
      stages,
      stage_gates: { ...STAGE_GATES },
      gates_required: [...GATES_REQUIRED],
      gate_reports: [],
      artifact_index_ref: "artifact_index.json",
      errors: [],
      policy_snapshot_ref: null,
      config,
      system_profile: systemProfileId,
      quota_set: config.quota_set as string ?? "QUOTA-BASE01",
    };

    await this.store.createRun(run);

    this.audit?.append("run.created", runId, { config, system_profile: systemProfileId });

    console.log(`Created run: ${runId}`);
    console.log(`  Run directory: ${runDir}`);
    console.log(`  System profile: ${systemProfileId}`);

    return run;
  }

  async advanceStage(runId: string, stageId: string): Promise<void> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    const typedStageId = stageId as StageId;

    const stageIndex = run.stage_order.indexOf(typedStageId);
    if (stageIndex < 0) {
      throw new Error(`Stage ${stageId} not in run stage_order`);
    }

    if (stageIndex > 0) {
      const prevStageId = run.stage_order[stageIndex - 1];
      const prevStage = run.stages.find((s) => s.stage_id === prevStageId);
      if (prevStage && prevStage.icp_status !== "pass" && prevStage.icp_status !== "skip") {
        throw new Error(
          `Cannot advance to ${stageId}: prior stage ${prevStageId} is ${prevStage.icp_status} (must be pass or skip)`,
        );
      }
    }

    if (run.icp_status === "queued") {
      this.transitionRun(run, "running");
    } else if (run.icp_status === "gated") {
      this.transitionRun(run, "running");
    } else if (run.icp_status !== "running") {
      throw new Error(`Cannot advance stage: run is ${run.icp_status}`);
    }

    const stage = run.stages.find((s) => s.stage_id === typedStageId);
    if (!stage) {
      throw new Error(`Stage ${stageId} not found in run ${runId}`);
    }

    stage.icp_status = "in_progress";
    run.updated_at = isoNow();
    await this.store.updateRun(runId, run);

    this.audit?.append("stage.started", runId, { stage_id: stageId });
  }

  async recordStageResult(
    runId: string,
    stageId: string,
    result: "pass" | "fail" | "skip",
    reportRef?: string,
  ): Promise<void> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    const typedStageId = stageId as StageId;
    const stage = run.stages.find((s) => s.stage_id === typedStageId);
    if (!stage) {
      throw new Error(`Stage ${stageId} not found in run ${runId}`);
    }

    const statusMap: Record<string, ICPStageStatus> = {
      pass: "pass",
      fail: "fail",
      skip: "skip",
    };

    stage.icp_status = statusMap[result];
    if (reportRef) {
      stage.stage_report_ref = reportRef;
    }

    if (result === "fail") {
      const gateId = run.stage_gates[stageId];
      if (gateId) {
        this.transitionRun(run, "gated");
        run.errors.push({
          stage_id: typedStageId,
          message: `Gate ${gateId} blocked stage ${stageId}`,
          timestamp: isoNow(),
        });
      } else {
        this.transitionRun(run, "failed");
      }
    }

    run.updated_at = isoNow();
    await this.store.updateRun(runId, run);

    this.audit?.append("stage.completed", runId, {
      stage_id: stageId,
      result,
      report_ref: reportRef ?? null,
    });

    console.log(`  Stage ${stageId}: ${result}`);
  }

  async completeRun(runId: string): Promise<void> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new Error(`Run ${runId} not found`);
    }

    const allDone = run.stages.every(
      (s) => s.icp_status === "pass" || s.icp_status === "skip",
    );

    if (!allDone) {
      const incomplete = run.stages
        .filter((s) => s.icp_status !== "pass" && s.icp_status !== "skip")
        .map((s) => `${s.stage_id}:${s.icp_status}`);
      throw new Error(
        `Cannot complete run: stages not done: ${incomplete.join(", ")}`,
      );
    }

    const exportDecision = evaluatePolicyHook("KIT_EXPORT", {
      run_id: runId,
      system_profile: run.system_profile,
      quota_set: run.quota_set,
    });

    if (exportDecision.decision === "DENY") {
      this.transitionRun(run, "gated");
      run.errors.push({
        stage_id: run.stage_order[run.stage_order.length - 1],
        message: `Policy hook KIT_EXPORT denied release: ${exportDecision.reason}`,
        timestamp: isoNow(),
      });
      run.updated_at = isoNow();
      await this.store.updateRun(runId, run);
      this.audit?.append("run.export_denied", runId, { reason: exportDecision.reason });
      throw new Error(`Policy hook KIT_EXPORT denied release: ${exportDecision.reason}`);
    }

    this.transitionRun(run, "released");
    run.updated_at = isoNow();
    await this.store.updateRun(runId, run);

    this.audit?.append("run.released", runId, { system_profile: run.system_profile });
  }

  async getRunStatus(runId: string): Promise<ICPRun | null> {
    return this.store.getRun(runId);
  }

  private transitionRun(run: ICPRun, target: ICPRunStatus): void {
    const allowed = VALID_RUN_TRANSITIONS[run.icp_status];
    if (!allowed.includes(target)) {
      throw new Error(
        `Invalid run transition: ${run.icp_status} → ${target}`,
      );
    }
    run.icp_status = target;
  }
}
