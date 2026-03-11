import type { ICPRunStatus, ICPStageStatus, RunTransitionRequest, TransitionValidationResult } from "./model.js";

export type { RunTransitionRequest, TransitionValidationResult };

export const VALID_RUN_TRANSITIONS: Record<ICPRunStatus, ICPRunStatus[]> = {
  created: ["queued"],
  queued: ["running", "cancelled"],
  running: ["gated", "paused", "failed", "completed", "cancelled"],
  paused: ["running", "cancelled"],
  gated: ["running", "failed", "cancelled"],
  failed: ["queued", "archived"],
  completed: ["archived"],
  cancelled: ["archived"],
  archived: [],
};

export const VALID_STAGE_TRANSITIONS: Record<ICPStageStatus, ICPStageStatus[]> = {
  not_started: ["in_progress", "skip"],
  in_progress: ["pass", "fail", "skip"],
  pass: [],
  fail: ["not_started", "in_progress"],
  skip: [],
};

export const FORBIDDEN_RUN_TRANSITIONS: Array<{ from: ICPRunStatus; to: ICPRunStatus; reason: string }> = [
  { from: "archived", to: "running", reason: "Archived runs cannot be restarted" },
  { from: "completed", to: "running", reason: "Completed runs cannot be restarted directly; use retry" },
  { from: "cancelled", to: "running", reason: "Cancelled runs cannot be resumed; use retry" },
];

export class StateMachineGovernor {
  validateRunTransition(current: ICPRunStatus, proposed: ICPRunStatus): TransitionValidationResult {
    const forbidden = FORBIDDEN_RUN_TRANSITIONS.find((f) => f.from === current && f.to === proposed);
    if (forbidden) {
      return {
        valid: false,
        from: current,
        to: proposed,
        rejection_reason: forbidden.reason,
      };
    }

    const allowed = VALID_RUN_TRANSITIONS[current];
    if (!allowed || !allowed.includes(proposed)) {
      return {
        valid: false,
        from: current,
        to: proposed,
        rejection_reason: `Transition from '${current}' to '${proposed}' is not allowed. Valid targets: ${(allowed ?? []).join(", ") || "none"}`,
      };
    }

    return { valid: true, from: current, to: proposed };
  }

  validateStageTransition(current: ICPStageStatus, proposed: ICPStageStatus): TransitionValidationResult {
    const allowed = VALID_STAGE_TRANSITIONS[current];
    if (!allowed || !allowed.includes(proposed)) {
      return {
        valid: false,
        from: current,
        to: proposed,
        rejection_reason: `Stage transition from '${current}' to '${proposed}' is not allowed. Valid targets: ${(allowed ?? []).join(", ") || "none"}`,
      };
    }

    return { valid: true, from: current, to: proposed };
  }

  assertRunTransition(current: ICPRunStatus, proposed: ICPRunStatus): void {
    const result = this.validateRunTransition(current, proposed);
    if (!result.valid) {
      throw new Error(`Invalid run transition: ${current} → ${proposed}. ${result.rejection_reason}`);
    }
  }

  assertStageTransition(current: ICPStageStatus, proposed: ICPStageStatus): void {
    const result = this.validateStageTransition(current, proposed);
    if (!result.valid) {
      throw new Error(`Invalid stage transition: ${current} → ${proposed}. ${result.rejection_reason}`);
    }
  }

  canPause(status: ICPRunStatus): boolean {
    return status === "running";
  }

  canResume(status: ICPRunStatus): boolean {
    return status === "paused";
  }

  canCancel(status: ICPRunStatus): boolean {
    return status === "queued" || status === "running" || status === "paused" || status === "gated";
  }

  canRetry(status: ICPRunStatus): boolean {
    return status === "failed";
  }

  getRecoveryTransitions(status: ICPRunStatus): ICPRunStatus[] {
    switch (status) {
      case "failed":
        return ["queued"];
      case "paused":
        return ["running", "cancelled"];
      case "gated":
        return ["running", "failed", "cancelled"];
      default:
        return [];
    }
  }
}
