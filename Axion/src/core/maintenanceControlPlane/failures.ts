import type { EvidencePointer, RemediationStep } from "../../types/controlPlane.js";
import type { MaintenanceFailureReport } from "./types.js";
import { isoNow } from "../../utils/time.js";

export function classifyMaintenanceFailure(
  error: Error | string,
  moduleId: string,
): "blocked" | "failed" {
  const message = typeof error === "string" ? error : error.message;

  const blockedPatterns = [
    "scope constraint",
    "max_files_touched",
    "forbidden path",
    "backcompat",
    "breaking change",
  ];

  const isBlocked = blockedPatterns.some((p) => message.toLowerCase().includes(p));
  return isBlocked ? "blocked" : "failed";
}

export function shouldFailFast(classification: "blocked" | "failed"): boolean {
  return classification === "failed";
}

export function buildMaintenanceFailureReport(
  classification: "blocked" | "failed",
  moduleId: string,
  reason: string,
  evidence: EvidencePointer[],
  remediation: RemediationStep[],
): MaintenanceFailureReport {
  return {
    classification,
    module_id: moduleId,
    reason,
    evidence,
    remediation,
    fail_fast: shouldFailFast(classification),
    timestamp: isoNow(),
  };
}

export function canRetryModule(classification: "blocked" | "failed"): boolean {
  return classification === "blocked";
}

export function buildRemediationForBlocked(
  moduleId: string,
  reason: string,
): RemediationStep[] {
  return [
    {
      step_id: `REM-${moduleId}-001`,
      description: `Resolve blocking condition: ${reason}`,
      priority: "high",
    },
    {
      step_id: `REM-${moduleId}-002`,
      description: `Re-run maintenance module ${moduleId} after resolution`,
      priority: "medium",
    },
  ];
}

export function buildRemediationForFailed(
  moduleId: string,
  reason: string,
): RemediationStep[] {
  return [
    {
      step_id: `REM-${moduleId}-001`,
      description: `Investigate failure in module ${moduleId}: ${reason}`,
      priority: "critical",
    },
    {
      step_id: `REM-${moduleId}-002`,
      description: "Check maintenance run log for detailed error trace",
      priority: "high",
    },
    {
      step_id: `REM-${moduleId}-003`,
      description: "Consider rolling back to repo_revision_baseline if changes were partially applied",
      priority: "high",
    },
  ];
}
