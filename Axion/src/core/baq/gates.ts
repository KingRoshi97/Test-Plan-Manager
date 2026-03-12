import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
  BAQGateResult,
  BuildQualityGateId,
} from "./types.js";
import type { ReconciliationResult } from "./generationAlignment.js";

export interface BAQGateCondition {
  condition_id: string;
  description: string;
  passed: boolean;
  detail: string;
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
    })),
    blockers,
    evaluated_at: new Date().toISOString(),
  };
}

export function evaluateGateBQ01(extraction: BAQKitExtraction | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push({
    condition_id: "BQ01-C1",
    description: "Kit extraction artifact exists",
    passed: extraction !== null,
    detail: extraction ? "Extraction artifact present" : "Extraction artifact is null",
  });

  if (extraction) {
    conditions.push({
      condition_id: "BQ01-C2",
      description: "Extraction result is not failed",
      passed: extraction.extraction_result !== "failed",
      detail: `Extraction result: ${extraction.extraction_result}`,
    });

    conditions.push({
      condition_id: "BQ01-C3",
      description: "All required sections present",
      passed: extraction.summary.required_sections_present >= extraction.summary.required_sections_total,
      detail: `Required sections: ${extraction.summary.required_sections_present}/${extraction.summary.required_sections_total}`,
    });

    conditions.push({
      condition_id: "BQ01-C4",
      description: "No blocking warnings",
      passed: extraction.summary.blocking_warnings === 0,
      detail: `Blocking warnings: ${extraction.summary.blocking_warnings}`,
    });
  }

  return makeGateResult("G-BQ-01", "Kit Extraction Integrity", conditions);
}

export function evaluateGateBQ02(derivedInputs: BAQDerivedBuildInputs | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push({
    condition_id: "BQ02-C1",
    description: "Derived build inputs artifact exists",
    passed: derivedInputs !== null,
    detail: derivedInputs ? "Derived inputs present" : "Derived inputs artifact is null",
  });

  if (derivedInputs) {
    conditions.push({
      condition_id: "BQ02-C2",
      description: "Derivation completeness >= 50%",
      passed: derivedInputs.summary.derivation_completeness >= 50,
      detail: `Derivation completeness: ${derivedInputs.summary.derivation_completeness}%`,
    });

    conditions.push({
      condition_id: "BQ02-C3",
      description: "At least one feature mapped",
      passed: derivedInputs.summary.feature_count > 0,
      detail: `Features: ${derivedInputs.summary.feature_count}`,
    });

    conditions.push({
      condition_id: "BQ02-C4",
      description: "At least one subsystem identified",
      passed: derivedInputs.summary.subsystem_count > 0,
      detail: `Subsystems: ${derivedInputs.summary.subsystem_count}`,
    });
  }

  return makeGateResult("G-BQ-02", "Derived Inputs Completeness", conditions);
}

export function evaluateGateBQ03(
  inventory: BAQRepoInventory | null,
  traceMap: BAQRequirementTraceMap | null,
  sufficiency: BAQSufficiencyEvaluation | null,
): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push({
    condition_id: "BQ03-C1",
    description: "Repo inventory artifact exists",
    passed: inventory !== null,
    detail: inventory ? "Inventory present" : "Inventory artifact is null",
  });

  if (inventory) {
    conditions.push({
      condition_id: "BQ03-C2",
      description: "At least one file in inventory",
      passed: inventory.summary.total_files > 0,
      detail: `Total files: ${inventory.summary.total_files}`,
    });
  }

  conditions.push({
    condition_id: "BQ03-C3",
    description: "Requirement trace map exists",
    passed: traceMap !== null,
    detail: traceMap ? "Trace map present" : "Trace map artifact is null",
  });

  if (traceMap) {
    conditions.push({
      condition_id: "BQ03-C4",
      description: "Coverage >= 30%",
      passed: traceMap.summary.coverage_percent >= 30,
      detail: `Coverage: ${traceMap.summary.coverage_percent}%`,
    });

    conditions.push({
      condition_id: "BQ03-C5",
      description: "No critical unmapped requirements",
      passed: traceMap.summary.unmapped_critical === 0,
      detail: `Critical unmapped: ${traceMap.summary.unmapped_critical}`,
    });
  }

  conditions.push({
    condition_id: "BQ03-C6",
    description: "Sufficiency evaluation exists",
    passed: sufficiency !== null,
    detail: sufficiency ? "Sufficiency evaluation present" : "Sufficiency evaluation is null",
  });

  if (sufficiency) {
    conditions.push({
      condition_id: "BQ03-C7",
      description: "Sufficiency status is not insufficient",
      passed: sufficiency.status !== "insufficient",
      detail: `Sufficiency status: ${sufficiency.status}`,
    });

    conditions.push({
      condition_id: "BQ03-C8",
      description: "No critical sufficiency gaps",
      passed: sufficiency.summary.critical_gaps === 0,
      detail: `Critical gaps: ${sufficiency.summary.critical_gaps}`,
    });
  }

  return makeGateResult("G-BQ-03", "Inventory & Traceability Integrity", conditions);
}

export function evaluateGateBQ04(traceMap: BAQRequirementTraceMap | null): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push({
    condition_id: "BQ04-C1",
    description: "Requirement trace map exists",
    passed: traceMap !== null,
    detail: traceMap ? "Trace map present" : "Trace map artifact is null",
  });

  if (traceMap) {
    conditions.push({
      condition_id: "BQ04-C2",
      description: "Requirement coverage >= 70%",
      passed: traceMap.summary.coverage_percent >= 70,
      detail: `Requirement coverage: ${traceMap.summary.coverage_percent}%`,
    });

    conditions.push({
      condition_id: "BQ04-C3",
      description: "No critical unmapped requirements",
      passed: traceMap.summary.unmapped_critical === 0,
      detail: `Critical unmapped: ${traceMap.summary.unmapped_critical}`,
    });

    const fullyCoveredPct = traceMap.summary.total_requirements > 0
      ? Math.round((traceMap.summary.fully_covered / traceMap.summary.total_requirements) * 100)
      : 0;
    conditions.push({
      condition_id: "BQ04-C4",
      description: "Fully covered requirements >= 50%",
      passed: fullyCoveredPct >= 50,
      detail: `Fully covered: ${fullyCoveredPct}% (${traceMap.summary.fully_covered}/${traceMap.summary.total_requirements})`,
    });
  }

  return makeGateResult("G-BQ-04", "Requirement Coverage", conditions);
}

export function evaluateGateBQ05(
  reconciliation: ReconciliationResult | null,
  sufficiency: BAQSufficiencyEvaluation | null,
): BAQGateResult {
  const conditions: BAQGateCondition[] = [];

  conditions.push({
    condition_id: "BQ05-C1",
    description: "Generation reconciliation available",
    passed: reconciliation !== null,
    detail: reconciliation ? "Reconciliation available" : "No reconciliation data",
  });

  if (reconciliation) {
    conditions.push({
      condition_id: "BQ05-C2",
      description: "Generation coverage >= 80%",
      passed: reconciliation.coverage_percent >= 80,
      detail: `Generation coverage: ${reconciliation.coverage_percent}%`,
    });

    conditions.push({
      condition_id: "BQ05-C3",
      description: "No missing required files",
      passed: reconciliation.missing_required_files.length === 0,
      detail: `Missing required files: ${reconciliation.missing_required_files.length}`,
    });

    conditions.push({
      condition_id: "BQ05-C4",
      description: "No structural violations",
      passed: reconciliation.violations.length === 0,
      detail: `Violations: ${reconciliation.violations.length}`,
    });
  }

  if (sufficiency) {
    conditions.push({
      condition_id: "BQ05-C5",
      description: "Sufficiency score >= 60",
      passed: sufficiency.overall_score >= 60,
      detail: `Sufficiency score: ${sufficiency.overall_score}`,
    });
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

  conditions.push({
    condition_id: "BQ06-C1",
    description: "Verification signals available",
    passed: signals !== null,
    detail: signals ? "Verification data present" : "No verification data",
  });

  if (signals) {
    conditions.push({
      condition_id: "BQ06-C2",
      description: "Verification passed",
      passed: signals.verification_passed,
      detail: `Verification: ${signals.verification_passed ? "passed" : "failed"}`,
    });

    conditions.push({
      condition_id: "BQ06-C3",
      description: "Fidelity >= 70%",
      passed: signals.fidelity_percent >= 70,
      detail: `Fidelity: ${signals.fidelity_percent}%`,
    });

    conditions.push({
      condition_id: "BQ06-C4",
      description: "No structural violations",
      passed: signals.structural_violations === 0,
      detail: `Structural violations: ${signals.structural_violations}`,
    });

    const verifiedPct = (signals.files_verified + signals.files_failed) > 0
      ? Math.round((signals.files_verified / (signals.files_verified + signals.files_failed)) * 100)
      : 0;
    conditions.push({
      condition_id: "BQ06-C5",
      description: "Verified file ratio >= 80%",
      passed: verifiedPct >= 80,
      detail: `Verified: ${verifiedPct}% (${signals.files_verified}/${signals.files_verified + signals.files_failed})`,
    });
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

  conditions.push({
    condition_id: "BQ07-C1",
    description: "Packaging signals available",
    passed: signals !== null,
    detail: signals ? "Packaging data present" : "No packaging data",
  });

  if (signals) {
    if (signals.export_attempted) {
      conditions.push({
        condition_id: "BQ07-C2",
        description: "Export completed successfully",
        passed: signals.export_success,
        detail: `Export: ${signals.export_success ? "success" : "failed"}`,
      });

      conditions.push({
        condition_id: "BQ07-C3",
        description: "Package contains files",
        passed: signals.file_count > 0,
        detail: `Package file count: ${signals.file_count}`,
      });

      conditions.push({
        condition_id: "BQ07-C4",
        description: "Package size is non-zero",
        passed: signals.zip_size_bytes > 0,
        detail: `Package size: ${signals.zip_size_bytes} bytes`,
      });
    } else {
      conditions.push({
        condition_id: "BQ07-C2",
        description: "Export was not attempted (build_only mode)",
        passed: true,
        detail: "Export not attempted — skipped in build_only mode",
      });
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
  };
}
