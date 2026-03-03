import type { KitRunState, WorkUnitState } from "../../types/controlPlane.js";

const KIT_RUN_TRANSITIONS: Record<KitRunState, KitRunState[]> = {
  READY: ["EXECUTING", "FAILED", "CANCELLED"],
  EXECUTING: ["VERIFYING", "BLOCKED", "FAILED", "PAUSED", "CANCELLED"],
  VERIFYING: ["COMPLETE", "BLOCKED", "FAILED"],
  BLOCKED: ["EXECUTING", "FAILED", "CANCELLED"],
  FAILED: ["READY", "CANCELLED"],
  COMPLETE: [],
  PAUSED: ["EXECUTING", "RESUMING", "CANCELLED"],
  CANCELLED: [],
  RESUMING: ["EXECUTING", "FAILED"],
};

const WORK_UNIT_TRANSITIONS: Record<WorkUnitState, WorkUnitState[]> = {
  NOT_STARTED: ["IN_PROGRESS", "SKIPPED"],
  IN_PROGRESS: ["DONE", "FAILED", "SKIPPED"],
  DONE: [],
  FAILED: ["IN_PROGRESS", "SKIPPED"],
  SKIPPED: [],
};

export function canTransitionKitRun(from: KitRunState, to: KitRunState): boolean {
  return KIT_RUN_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canTransitionWorkUnit(from: WorkUnitState, to: WorkUnitState): boolean {
  return WORK_UNIT_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionKitRun(from: KitRunState, to: KitRunState): KitRunState {
  if (!canTransitionKitRun(from, to)) {
    throw new Error(`Invalid KCP state transition: ${from} → ${to}`);
  }
  return to;
}

export function transitionWorkUnit(from: WorkUnitState, to: WorkUnitState): WorkUnitState {
  if (!canTransitionWorkUnit(from, to)) {
    throw new Error(`Invalid work unit state transition: ${from} → ${to}`);
  }
  return to;
}
