import type {
  FailureClassification,
  FailureReport,
  EvidencePointer,
  RemediationStep,
} from "../../types/controlPlane.js";
import { isoNow } from "../../utils/time.js";

const CONTRACT_FAILURE_PATTERNS = [
  "schema_invalid",
  "missing_required_artifact",
  "pinset_missing",
  "pinset_invalid",
  "registry_integrity_failure",
  "evidence_pointer_unresolved",
  "non_overridable_gate_failure",
  "referential_integrity_failure",
];

const VERIFICATION_FAILURE_PATTERNS = [
  "command_failed",
  "test_failed",
  "lint_failed",
  "build_failed",
  "typecheck_failed",
  "proof_requirements_unmet",
  "coverage_below_minimum",
];

export function classifyFailure(reasonCode: string): FailureClassification {
  if (CONTRACT_FAILURE_PATTERNS.some((p) => reasonCode.startsWith(p) || reasonCode.includes(p))) {
    return "contract_failure";
  }
  if (VERIFICATION_FAILURE_PATTERNS.some((p) => reasonCode.startsWith(p) || reasonCode.includes(p))) {
    return "verification_failure";
  }
  return "recoverable_execution_failure";
}

export function shouldFailFast(classification: FailureClassification): boolean {
  return classification === "contract_failure";
}

export function canRetry(classification: FailureClassification): boolean {
  return classification === "recoverable_execution_failure";
}

export function buildFailureReport(
  classification: FailureClassification,
  stageId: string,
  reasonCodes: string[],
  evidence: EvidencePointer[],
  remediation: RemediationStep[],
  inputsConsumed: string[] = [],
  outputsProduced: string[] = [],
  gateId?: string,
): FailureReport {
  return {
    classification,
    stage_id: stageId,
    gate_id: gateId,
    reason_codes: reasonCodes,
    evidence,
    remediation,
    inputs_consumed: inputsConsumed,
    outputs_produced: outputsProduced,
    timestamp: isoNow(),
  };
}

export function buildRemediationStep(
  stepId: string,
  description: string,
  priority: RemediationStep["priority"] = "high",
): RemediationStep {
  return { step_id: stepId, description, priority };
}

export function isMinimalFailureDeliverable(report: FailureReport): boolean {
  if (!report.stage_id) return false;
  if (report.reason_codes.length === 0) return false;
  if (report.remediation.length === 0) return false;
  return true;
}

export function validateFailureReport(report: FailureReport): string[] {
  const errors: string[] = [];
  if (!report.stage_id) errors.push("Missing stage_id");
  if (report.reason_codes.length === 0) errors.push("No reason codes provided");
  if (report.evidence.length === 0) errors.push("No evidence pointers provided");
  if (report.remediation.length === 0) errors.push("No remediation steps provided");
  if (!report.classification) errors.push("Missing failure classification");
  if (!report.timestamp) errors.push("Missing timestamp");
  return errors;
}
