import type { MaintenanceRunState } from "../../types/controlPlane.js";

const VALID_TRANSITIONS: Record<MaintenanceRunState, MaintenanceRunState[]> = {
  PLANNED: ["APPLYING", "CANCELLED"],
  APPLYING: ["VERIFYING", "BLOCKED", "FAILED", "PAUSED", "CANCELLED"],
  VERIFYING: ["COMPLETE", "BLOCKED", "FAILED", "ROLLBACKING"],
  BLOCKED: ["APPLYING", "FAILED", "CANCELLED"],
  FAILED: ["PLANNED", "CANCELLED"],
  COMPLETE: [],
  PAUSED: ["APPLYING", "CANCELLED"],
  CANCELLED: [],
  ROLLBACKING: ["FAILED", "PLANNED"],
};

export function canTransitionMaintenance(from: MaintenanceRunState, to: MaintenanceRunState): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionMaintenance(from: MaintenanceRunState, to: MaintenanceRunState): MaintenanceRunState {
  if (!canTransitionMaintenance(from, to)) {
    throw new Error(`Invalid MCP state transition: ${from} → ${to}`);
  }
  return to;
}

export function isTerminalState(state: MaintenanceRunState): boolean {
  return state === "COMPLETE" || state === "CANCELLED";
}

export function isFailedState(state: MaintenanceRunState): boolean {
  return state === "FAILED" || state === "BLOCKED";
}

export function canRetry(state: MaintenanceRunState): boolean {
  return state === "FAILED" || state === "BLOCKED";
}
