import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
  BAQGateResult,
  BuildQualityGateId,
  BAQSeverity,
} from "./types.js";
import type { ReconciliationResult } from "./generationAlignment.js";

export interface BAQGateCondition {
  condition_id: string;
  description: string;
  passed: boolean;
  detail: string;
  severity: BAQSeverity;
  message: string;
  evidence_refs: string[];
}

function cond(
  id: string,
  description: string,
  passed: boolean,
  detail: string,
  severity: BAQSeverity,
  evidenceRefs: string[] = [],
): BAQGateCondition {
  return {
    condition_id: id,
    description,
    passed,
    detail,
    severity,
    message: passed ? `OK: ${description}` : `FAIL: ${detail}`,
    evidence_refs: evidenceRefs,
  };
}

function makeGateResult(
  gateId: BuildQualityGateId,
  gateName: string,
  conditions: BAQGateCondition[],
): BAQGateResult {
  const allPassed = conditions.every(c => c.passed);
  const blockers = conditions.filter(c => !c.passed).map(c => c.detail);
  return {
    gate_id: gateId,
    gate_name: gateName,
    status: allPassed ? "pass" : "fail",
    conditions: conditions.map(c => ({
      condition_id: c.condition_id,
      description: c.description,
      passed: c.passed,
      detail: c.detail,
      severity: c.severity,
      message: c.message,
      evidence_refs: c.evidence_refs,
    })),
    blockers,
    evaluated_at: new Date().toISOString(),
  };
}

export function evaluateGateBQ01(extraction: BAQKitExtraction | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];
  const artifactPath = "kit_extraction.json";

  conditions.push(cond(
    "BQ01-C1", "Kit extraction artifact exists",
    extraction !== null,
    extraction ? "Extraction artifact present" : "Extraction artifact is null",
    "critical", [artifactPath],
  ));

  if (extraction) {
    conditions.push(cond(
      "BQ01-C2", "Extraction result is not failed",
      extraction.extraction_result !== "failed",
      `Extraction result: ${extraction.extraction_result}`,
      "critical", [artifactPath],
    ));

    conditions.push(cond(
      "BQ01-C3", "All required sections present",
      extraction.summary.required_sections_present >= extraction.summary.required_sections_total,
      `Required sections: ${extraction.summary.required_sections_present}/${extraction.summary.required_sections_total}`,
      "error", [artifactPath],
    ));

    conditions.push(cond(
      "BQ01-C4", "No blocking warnings",
      extraction.summary.blocking_warnings === 0,
      `Blocking warnings: ${extraction.summary.blocking_warnings}`,
      "warning", [artifactPath],
    ));
  }

  return makeGateResult("G-BQ-01", "Kit Extraction Integrity", conditions);
}

export function evaluateGateBQ02(derivedInputs: BAQDerivedBuildInputs | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];
  const artifactPath = "derived_build_inputs.json";

  conditions.push(cond(
    "BQ02-C1", "Derived build inputs artifact exists",
    derivedInputs !== null,
    derivedInputs ? "Derived inputs present" : "Derived inputs artifact is null",
    "critical", [artifactPath],
  ));

  if (derivedInputs) {
    conditions.push(cond(
      "BQ02-C2", "Derivation completeness >= 50%",
      derivedInputs.summary.derivation_completeness >= 50,
      `Derivation completeness: ${derivedInputs.summary.derivation_completeness}%`,
      "error", [artifactPath],
    ));

    conditions.push(cond(
      "BQ02-C3", "At least one feature mapped",
      derivedInputs.summary.feature_count > 0,
      `Features: ${derivedInputs.summary.feature_count}`,
      "error", [artifactPath],
    ));

    conditions.push(cond(
      "BQ02-C4", "At least one subsystem identified",
      derivedInputs.summary.subsystem_count > 0,
      `Subsystems: ${derivedInputs.summary.subsystem_count}`,
      "warning", [artifactPath],
    ));
  }

  return makeGateResult("G-BQ-02", "Derived Inputs Completeness", conditions);
}

export function evaluateGateBQ03(
  inventory: BAQRepoInventory | null,
  traceMap: BAQRequirementTraceMap | null,
  sufficiency: BAQSufficiencyEvaluation | null,
): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push(cond(
    "BQ03-C1", "Repo inventory artifact exists",
    inventory !== null,
    inventory ? "Inventory present" : "Inventory artifact is null",
    "critical", ["repo_inventory.json"],
  ));

  if (inventory) {
    conditions.push(cond(
      "BQ03-C2", "At least one file in inventory",
      inventory.summary.total_files > 0,
      `Total files: ${inventory.summary.total_files}`,
      "error", ["repo_inventory.json"],
    ));
  }

  conditions.push(cond(
    "BQ03-C3", "Requirement trace map exists",
    traceMap !== null,
    traceMap ? "Trace map present" : "Trace map artifact is null",
    "critical", ["requirement_trace_map.json"],
  ));

  if (traceMap) {
    conditions.push(cond(
      "BQ03-C4", "Coverage >= 30%",
      traceMap.summary.coverage_percent >= 30,
      `Coverage: ${traceMap.summary.coverage_percent}%`,
      "error", ["requirement_trace_map.json"],
    ));

    conditions.push(cond(
      "BQ03-C5", "No critical unmapped requirements",
      traceMap.summary.unmapped_critical === 0,
      `Critical unmapped: ${traceMap.summary.unmapped_critical}`,
      "error", ["requirement_trace_map.json"],
    ));
  }

  conditions.push(cond(
    "BQ03-C6", "Sufficiency evaluation exists",
    sufficiency !== null,
    sufficiency ? "Sufficiency evaluation present" : "Sufficiency evaluation is null",
    "critical", ["sufficiency_evaluation.json"],
  ));

  if (sufficiency) {
    conditions.push(cond(
      "BQ03-C7", "Sufficiency status is not insufficient",
      sufficiency.status !== "insufficient",
      `Sufficiency status: ${sufficiency.status}`,
      "error", ["sufficiency_evaluation.json"],
    ));

    conditions.push(cond(
      "BQ03-C8", "No critical sufficiency gaps",
      sufficiency.summary.critical_gaps === 0,
      `Critical gaps: ${sufficiency.summary.critical_gaps}`,
      "warning", ["sufficiency_evaluation.json"],
    ));
  }

  return makeGateResult("G-BQ-03", "Inventory & Traceability Integrity", conditions);
}

export function evaluateGateBQ04(traceMap: BAQRequirementTraceMap | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push(cond(
    "BQ04-C1", "Requirement trace map exists",
    traceMap !== null,
    traceMap ? "Trace map present" : "Trace map artifact is null",
    "error", ["requirement_trace_map.json"],
  ));

  if (traceMap) {
    conditions.push(cond(
      "BQ04-C2", "Requirement coverage >= 70%",
      traceMap.summary.coverage_percent >= 70,
      `Requirement coverage: ${traceMap.summary.coverage_percent}%`,
      "warning", ["requirement_trace_map.json"],
    ));

    conditions.push(cond(
      "BQ04-C3", "No critical unmapped requirements",
      traceMap.summary.unmapped_critical === 0,
      `Critical unmapped: ${traceMap.summary.unmapped_critical}`,
      "error", ["requirement_trace_map.json"],
    ));

    const fullyCoveredPct = traceMap.summary.total_requirements > 0
      ? Math.round((traceMap.summary.fully_covered / traceMap.summary.total_requirements) * 100)
      : 0;
    conditions.push(cond(
      "BQ04-C4", "Fully covered requirements >= 50%",
      fullyCoveredPct >= 50,
      `Fully covered: ${fullyCoveredPct}% (${traceMap.summary.fully_covered}/${traceMap.summary.total_requirements})`,
      "warning", ["requirement_trace_map.json"],
    ));
  }

  return makeGateResult("G-BQ-04", "Requirement Coverage", conditions);
}

export function evaluateGateBQ05(
  reconciliation: ReconciliationResult | null,
  sufficiency: BAQSufficiencyEvaluation | null,
): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push(cond(
    "BQ05-C1", "Generation reconciliation available",
    reconciliation !== null,
    reconciliation ? "Reconciliation available" : "No reconciliation data",
    "error", [],
  ));

  if (reconciliation) {
    conditions.push(cond(
      "BQ05-C2", "Generation coverage >= 50%",
      reconciliation.coverage_percent >= 50,
      `Generation coverage: ${reconciliation.coverage_percent}%`,
      "warning", [],
    ));

    conditions.push(cond(
      "BQ05-C3", "No missing required files",
      reconciliation.missing_required_files.length === 0,
      `Missing required files: ${reconciliation.missing_required_files.length}`,
      "error", reconciliation.missing_required_files,
    ));

    conditions.push(cond(
      "BQ05-C4", "No structural violations",
      reconciliation.violations.length === 0,
      `Violations: ${reconciliation.violations.length}`,
      "error", [],
    ));

    conditions.push(cond(
      "BQ05-C5", "No placeholder violations in required files",
      reconciliation.placeholder_violations.length === 0,
      `Placeholder violations: ${reconciliation.placeholder_violations.length}`,
      "warning", [],
    ));
  }

  if (sufficiency) {
    conditions.push(cond(
      "BQ05-C6", "Sufficiency score >= 60",
      sufficiency.overall_score >= 60,
      `Sufficiency score: ${sufficiency.overall_score}`,
      "warning", ["sufficiency_evaluation.json"],
    ));
  }

  return makeGateResult("G-BQ-05", "Output Sufficiency", conditions);
}

export interface VerificationSignals {
  verification_passed: boolean;
  files_verified: number;
  files_failed: number;
  structural_violations: number;
  fidelity_percent: number;
}

export function evaluateGateBQ06(signals: VerificationSignals | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push(cond(
    "BQ06-C1", "Verification signals available",
    signals !== null,
    signals ? "Verification data present" : "No verification data",
    "error", [],
  ));

  if (signals) {
    conditions.push(cond(
      "BQ06-C2", "Verification passed",
      signals.verification_passed,
      `Verification: ${signals.verification_passed ? "passed" : "failed"}`,
      "error", [],
    ));

    conditions.push(cond(
      "BQ06-C3", "Fidelity >= 70%",
      signals.fidelity_percent >= 70,
      `Fidelity: ${signals.fidelity_percent}%`,
      "warning", [],
    ));

    conditions.push(cond(
      "BQ06-C4", "No structural violations",
      signals.structural_violations === 0,
      `Structural violations: ${signals.structural_violations}`,
      "warning", [],
    ));

    const verifiedPct = (signals.files_verified + signals.files_failed) > 0
      ? Math.round((signals.files_verified / (signals.files_verified + signals.files_failed)) * 100)
      : 0;
    conditions.push(cond(
      "BQ06-C5", "Verified file ratio >= 80%",
      verifiedPct >= 80,
      `Verified: ${verifiedPct}% (${signals.files_verified}/${signals.files_verified + signals.files_failed})`,
      "warning", [],
    ));
  }

  return makeGateResult("G-BQ-06", "Verification Integrity", conditions);
}

export interface PackagingSignals {
  export_attempted: boolean;
  export_success: boolean;
  file_count: number;
  zip_size_bytes: number;
}

export function evaluateGateBQ07(signals: PackagingSignals | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push(cond(
    "BQ07-C1", "Packaging signals available",
    signals !== null,
    signals ? "Packaging data present" : "No packaging data",
    "info", [],
  ));

  if (signals) {
    if (signals.export_attempted) {
      conditions.push(cond(
        "BQ07-C2", "Export completed successfully",
        signals.export_success,
        `Export: ${signals.export_success ? "success" : "failed"}`,
        "error", [],
      ));

      conditions.push(cond(
        "BQ07-C3", "Package contains files",
        signals.file_count > 0,
        `Package file count: ${signals.file_count}`,
        "error", [],
      ));

      conditions.push(cond(
        "BQ07-C4", "Package size is non-zero",
        signals.zip_size_bytes > 0,
        `Package size: ${signals.zip_size_bytes} bytes`,
        "warning", [],
      ));
    } else {
      conditions.push(cond(
        "BQ07-C2", "Export was not attempted (build_only mode)",
        true,
        "Export not attempted — skipped in build_only mode",
        "info", [],
      ));
    }
  }

  return makeGateResult("G-BQ-07", "Packaging Integrity", conditions);
}

export interface FullGateEvaluation {
  gates: BAQGateResult[];
  all_passed: boolean;
  total: number;
  passed_count: number;
  failed_count: number;
  skipped_count: number;
  packaging_eligible: boolean;
}

export function evaluateAllGates(params: {
  extraction: BAQKitExtraction | null;
  derivedInputs: BAQDerivedBuildInputs | null;
  inventory: BAQRepoInventory | null;
  traceMap: BAQRequirementTraceMap | null;
  sufficiency: BAQSufficiencyEvaluation | null;
  reconciliation: ReconciliationResult | null;
  verificationSignals: VerificationSignals | null;
  packagingSignals: PackagingSignals | null;
}): FullGateEvaluation {
  const gates: BAQGateResult[] = [
    evaluateGateBQ01(params.extraction),
    evaluateGateBQ02(params.derivedInputs),
    evaluateGateBQ03(params.inventory, params.traceMap, params.sufficiency),
    evaluateGateBQ04(params.traceMap),
    evaluateGateBQ05(params.reconciliation, params.sufficiency),
    evaluateGateBQ06(params.verificationSignals),
    evaluateGateBQ07(params.packagingSignals),
  ];

  const passedCount = gates.filter(g => g.status === "pass").length;
  const failedCount = gates.filter(g => g.status === "fail").length;
  const skippedCount = gates.filter(g => g.status === "skip").length;

  return {
    gates,
    all_passed: failedCount === 0,
    total: gates.length,
    passed_count: passedCount,
    failed_count: failedCount,
    skipped_count: skippedCount,
    packaging_eligible: failedCount === 0,
  };
}
