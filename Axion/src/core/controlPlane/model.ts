import type {
  RunState,
  StageState,
  RunContext,
  EvidencePointer,
  AttemptRecord,
  ICPGateReport,
} from "../../types/controlPlane.js";
import type { StageId } from "../../types/run.js";
import { STAGE_ORDER } from "../../types/run.js";

export interface RunStage {
  stage_id: StageId;
  state: StageState;
  stage_report_ref: string | null;
  attempts: AttemptRecord[];
}

export interface Run {
  run_id: string;
  state: RunState;
  run_context: RunContext;
  pinset_ref: string | null;
  stages: RunStage[];
  gate_reports: ICPGateReport[];
  audit_trail_ref: string | null;
  created_at: string;
  updated_at: string;
}

const VALID_RUN_TRANSITIONS: Record<RunState, RunState[]> = {
  QUEUED: ["RUNNING", "CANCELLED"],
  RUNNING: ["GATED", "RELEASED", "FAILED", "PAUSED", "CANCELLED"],
  GATED: ["RUNNING", "FAILED", "CANCELLED"],
  FAILED: ["ARCHIVED", "ROLLING_BACK"],
  RELEASED: ["ARCHIVED"],
  ARCHIVED: [],
  PAUSED: ["RUNNING", "CANCELLED"],
  CANCELLED: ["ARCHIVED"],
  ROLLING_BACK: ["FAILED", "ARCHIVED"],
};

const VALID_STAGE_TRANSITIONS: Record<StageState, StageState[]> = {
  NOT_STARTED: ["IN_PROGRESS", "SKIP"],
  IN_PROGRESS: ["PASS", "FAIL"],
  PASS: ["IN_PROGRESS"],
  FAIL: ["IN_PROGRESS"],
  SKIP: [],
};

export function canTransitionRun(from: RunState, to: RunState): boolean {
  return VALID_RUN_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionStage(from: StageState, to: StageState): boolean {
  return VALID_STAGE_TRANSITIONS[from]?.includes(to) ?? false;
}

export function validateAdvancement(stages: RunStage[], currentIndex: number): boolean {
  if (currentIndex === 0) return true;
  for (let i = 0; i < currentIndex; i++) {
    const prior = stages[i];
    if (prior.state !== "PASS" && prior.state !== "SKIP") {
      return false;
    }
  }
  return true;
}

export function canRerunStage(stage: RunStage): boolean {
  return stage.state === "PASS" || stage.state === "FAIL";
}

export function buildInitialStages(): RunStage[] {
  return STAGE_ORDER.map((sid) => ({
    stage_id: sid,
    state: "NOT_STARTED" as StageState,
    stage_report_ref: null,
    attempts: [],
  }));
}

export function getStageIndex(stages: RunStage[], stageId: string): number {
  return stages.findIndex((s) => s.stage_id === stageId);
}
