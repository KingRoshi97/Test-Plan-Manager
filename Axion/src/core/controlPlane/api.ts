import type { Run, RunStage } from "./model.js";
import type { RunStore } from "./store.js";
import type {
  RunState,
  StageState,
  RunContext,
  FailureClassification,
  ICPStageReport,
} from "../../types/controlPlane.js";
import {
  canTransitionRun,
  canTransitionStage,
  validateAdvancement,
  canRerunStage,
  buildInitialStages,
  getStageIndex,
} from "./model.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";

export class RunController {
  constructor(private store: RunStore) {}

  async createRun(context: RunContext): Promise<Run> {
    const runId = context.run_id ?? `RUN-${Date.now()}-${sha256(JSON.stringify(context)).slice(0, 8)}`;
    const now = isoNow();

    const normalized: RunContext = {
      ...context,
      run_id: runId,
      risk_class: context.risk_class,
      executor_type_default: context.executor_type_default,
      targets: {
        platforms: [...context.targets.platforms].sort(),
        stack: context.targets.stack ? [...context.targets.stack].sort() : undefined,
        domains: [...context.targets.domains].sort(),
      },
    };

    const run: Run = {
      run_id: runId,
      state: "QUEUED",
      run_context: normalized,
      pinset_ref: null,
      stages: buildInitialStages(),
      gate_reports: [],
      audit_trail_ref: null,
      created_at: now,
      updated_at: now,
    };

    await this.store.createRun(run);
    return run;
  }

  async advanceStage(runId: string, stageId: string): Promise<void> {
    const run = await this.requireRun(runId);

    if (run.state === "QUEUED") {
      this.transitionRunState(run, "RUNNING");
    }

    if (run.state !== "RUNNING") {
      throw new Error(`Cannot advance stage in run state ${run.state}`);
    }

    const idx = getStageIndex(run.stages, stageId);
    if (idx < 0) throw new Error(`Stage ${stageId} not found`);

    const stage = run.stages[idx];

    if (canRerunStage(stage)) {
      if (!canTransitionStage(stage.state, "IN_PROGRESS")) {
        throw new Error(`Cannot transition stage ${stageId} from ${stage.state} to IN_PROGRESS`);
      }
      stage.state = "IN_PROGRESS";
    } else if (stage.state === "NOT_STARTED") {
      if (!validateAdvancement(run.stages, idx)) {
        throw new Error(`Cannot advance to stage ${stageId}: prior stages not complete`);
      }
      if (!canTransitionStage(stage.state, "IN_PROGRESS")) {
        throw new Error(`Cannot transition stage ${stageId} from ${stage.state} to IN_PROGRESS`);
      }
      stage.state = "IN_PROGRESS";
    } else {
      throw new Error(`Stage ${stageId} is in state ${stage.state}, cannot advance`);
    }

    run.updated_at = isoNow();
    await this.store.updateRun(runId, run);
  }

  async completeStage(
    runId: string,
    stageId: string,
    result: { status: "PASS" | "FAIL"; report?: ICPStageReport },
  ): Promise<void> {
    const run = await this.requireRun(runId);
    const idx = getStageIndex(run.stages, stageId);
    if (idx < 0) throw new Error(`Stage ${stageId} not found`);

    const stage = run.stages[idx];
    if (stage.state !== "IN_PROGRESS") {
      throw new Error(`Stage ${stageId} is not IN_PROGRESS (current: ${stage.state})`);
    }

    const target: StageState = result.status;
    if (!canTransitionStage(stage.state, target)) {
      throw new Error(`Cannot transition stage ${stageId} from ${stage.state} to ${target}`);
    }

    stage.state = target;

    if (result.report) {
      stage.stage_report_ref = `stage_reports/${stageId}_${result.report.attempt_id}.json`;
      stage.attempts.push({
        attempt_id: result.report.attempt_id,
        prior_attempt_ref: stage.attempts.length > 0 ? stage.attempts[stage.attempts.length - 1].attempt_id : null,
        stage_id: stageId,
        stage_report_ref: stage.stage_report_ref,
        status: target,
        started_at: result.report.started_at,
        completed_at: result.report.finished_at,
      });
    }

    run.updated_at = isoNow();
    await this.store.updateRun(runId, run);
  }

  async gateRun(runId: string): Promise<void> {
    const run = await this.requireRun(runId);
    this.transitionRunState(run, "GATED");
    await this.store.updateRun(runId, run);
  }

  async releaseRun(runId: string): Promise<void> {
    const run = await this.requireRun(runId);

    const allStagesComplete = run.stages.every((s) => s.state === "PASS" || s.state === "SKIP");
    if (!allStagesComplete) {
      const incomplete = run.stages.filter((s) => s.state !== "PASS" && s.state !== "SKIP").map((s) => s.stage_id);
      throw new Error(`Cannot release: stages not complete: ${incomplete.join(", ")}`);
    }

    const allGatesPass = run.gate_reports.every((g) => g.overall_status === "PASS");
    if (!allGatesPass) {
      throw new Error("Cannot release: not all gate reports show PASS");
    }

    if (run.state === "GATED") {
      this.transitionRunState(run, "RUNNING");
    }

    this.transitionRunState(run, "RELEASED");
    await this.store.updateRun(runId, run);
  }

  async failRun(runId: string, reason: { classification: FailureClassification; message: string }): Promise<void> {
    const run = await this.requireRun(runId);
    this.transitionRunState(run, "FAILED");
    run.updated_at = isoNow();
    await this.store.updateRun(runId, run);
  }

  async archiveRun(runId: string): Promise<void> {
    const run = await this.requireRun(runId);
    this.transitionRunState(run, "ARCHIVED");
    run.updated_at = isoNow();
    await this.store.updateRun(runId, run);
  }

  async getRunStatus(runId: string): Promise<Run | null> {
    return this.store.getRun(runId);
  }

  private async requireRun(runId: string): Promise<Run> {
    const run = await this.store.getRun(runId);
    if (!run) throw new Error(`Run ${runId} not found`);
    return run;
  }

  private transitionRunState(run: Run, to: RunState): void {
    if (!canTransitionRun(run.state, to)) {
      throw new Error(`Invalid run state transition: ${run.state} → ${to}`);
    }
    run.state = to;
    run.updated_at = isoNow();
  }
}
