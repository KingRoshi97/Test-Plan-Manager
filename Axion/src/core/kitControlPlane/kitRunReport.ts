import { isoNow } from "../../utils/time.js";
import type { KitRunState } from "../../types/controlPlane.js";
import type {
  KitValidationReport,
  UnitStatusIndex,
  ResultFile,
  VerificationRunResult,
  KitProofObject,
  KitRunReport,
  GuardrailReport,
} from "./types.js";

export function buildKitRunReport(
  kitId: string,
  runId: string,
  state: KitRunState,
  stateTransitions: KitRunState[],
  validationResult: KitValidationReport,
  unitIndex: UnitStatusIndex,
  results: ResultFile[],
  verification: VerificationRunResult | null,
  proofs: KitProofObject[],
  guardrails: GuardrailReport | null
): KitRunReport {
  const unitEntries = Object.values(unitIndex.units);
  const unitSummary = {
    total: unitEntries.length,
    done: unitEntries.filter((u) => u.state === "DONE").length,
    failed: unitEntries.filter((u) => u.state === "FAILED").length,
    skipped: unitEntries.filter((u) => u.state === "SKIPPED").length,
    not_started: unitEntries.filter((u) => u.state === "NOT_STARTED").length,
    in_progress: unitEntries.filter((u) => u.state === "IN_PROGRESS").length,
  };

  const report: KitRunReport = {
    kit_id: kitId,
    run_id: runId,
    state,
    state_transitions: stateTransitions,
    validation: validationResult,
    unit_summary: unitSummary,
    results,
    verification,
    proof_count: proofs.length,
    guardrails,
    created_at: isoNow(),
    updated_at: isoNow(),
  };

  if (state === "FAILED" || state === "BLOCKED") {
    const failedUnits = unitEntries.filter((u) => u.state === "FAILED");
    if (failedUnits.length > 0) {
      report.remediation = {
        what_failed: `${failedUnits.length} work unit(s) failed`,
        why: failedUnits.map((u) => u.unit_id).join(", "),
        next_steps: failedUnits.map((u) => ({
          step_id: `retry_${u.unit_id}`,
          description: `Retry or investigate failure for unit ${u.unit_id}`,
          priority: "high" as const,
        })),
        evidence: [],
      };
    }
  }

  return report;
}
