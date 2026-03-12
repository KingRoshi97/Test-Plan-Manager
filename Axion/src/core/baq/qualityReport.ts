import * as fs from "fs";
import * as path from "path";
import type {
  BAQBuildQualityReport,
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
  BAQGateResult,
  BAQRunStatus,
} from "./types.js";
import type { FullGateEvaluation } from "./gates.js";
import type { ReconciliationResult } from "./generationAlignment.js";
import type { VerificationSignals } from "./gates.js";

export interface CoverageMetrics {
  requirement_coverage_percent: number;
  extraction_coverage_percent: number;
  acceptance_coverage_percent: number;
  proof_coverage_percent: number;
  fully_covered_count: number;
  partially_covered_count: number;
  not_covered_count: number;
  unmapped_critical_count: number;
}

export interface InventoryMetrics {
  planned_files: number;
  generated_files: number;
  missing_files: number;
  missing_required_files: number;
  unplanned_files: number;
  generation_coverage_percent: number;
  placeholder_count: number;
  placeholder_in_required: number;
  trace_linked_coverage_percent: number;
  inventory_variance_percent: number;
  inventory_variance_delta: number;
}

export interface QualitySignals {
  extraction_result: string | null;
  extraction_completeness_percent: number | null;
  derivation_completeness: number | null;
  sufficiency_score: number | null;
  sufficiency_status: string | null;
  verification_fidelity_percent: number | null;
  verification_passed: boolean | null;
  structural_violations: number | null;
  placeholder_ratio: number | null;
  inferred_ratio: number | null;
  warning_count: number;
  blocking_count: number;
  inventory_variance_percent: number | null;
}

export interface PackagingEligibility {
  eligible: boolean;
  blocking_gates: string[];
  reasons: string[];
}

export interface QualityReportInput {
  runId: string;
  buildId: string;
  extraction: BAQKitExtraction | null;
  derivedInputs: BAQDerivedBuildInputs | null;
  inventory: BAQRepoInventory | null;
  traceMap: BAQRequirementTraceMap | null;
  sufficiency: BAQSufficiencyEvaluation | null;
  gateEvaluation: FullGateEvaluation;
  reconciliation: ReconciliationResult | null;
  verificationSignals: VerificationSignals | null;
  buildStatus: BAQRunStatus;
}

function computeOverallQualityScore(input: QualityReportInput): number {
  const MAX_SCORE = 100;
  let score = 0;

  if (input.extraction) {
    if (input.extraction.extraction_result === "passed") score += 15;
    else if (input.extraction.extraction_result === "partial") score += 8;
  }

  if (input.derivedInputs) {
    score += Math.round((input.derivedInputs.summary.derivation_completeness / 100) * 15);
  }

  if (input.traceMap) {
    score += Math.round((input.traceMap.summary.coverage_percent / 100) * 20);
  }

  if (input.sufficiency) {
    score += Math.round((input.sufficiency.overall_score / 100) * 15);
  }

  if (input.reconciliation) {
    score += Math.round((input.reconciliation.coverage_percent / 100) * 20);
  }

  if (input.verificationSignals) {
    score += Math.round((input.verificationSignals.fidelity_percent / 100) * 15);
  }

  return Math.min(score, MAX_SCORE);
}

function buildCoverageMetrics(input: QualityReportInput): CoverageMetrics {
  const traceMap = input.traceMap;

  let extractionCoveragePct = 0;
  let acceptanceCoveragePct = 0;
  if (input.extraction) {
    const s = input.extraction.summary;
    extractionCoveragePct = s.required_sections_total > 0
      ? Math.round((s.required_sections_present / s.required_sections_total) * 100)
      : 100;
    acceptanceCoveragePct = s.critical_obligations_total > 0
      ? Math.round((s.critical_obligations_fulfilled / s.critical_obligations_total) * 100)
      : 100;
  }

  const proofCoveragePct = input.verificationSignals?.fidelity_percent ?? 0;

  if (!traceMap) {
    return {
      requirement_coverage_percent: 0,
      extraction_coverage_percent: extractionCoveragePct,
      acceptance_coverage_percent: acceptanceCoveragePct,
      proof_coverage_percent: proofCoveragePct,
      fully_covered_count: 0,
      partially_covered_count: 0,
      not_covered_count: 0,
      unmapped_critical_count: 0,
    };
  }
  return {
    requirement_coverage_percent: traceMap.summary.coverage_percent,
    extraction_coverage_percent: extractionCoveragePct,
    acceptance_coverage_percent: acceptanceCoveragePct,
    proof_coverage_percent: proofCoveragePct,
    fully_covered_count: traceMap.summary.fully_covered,
    partially_covered_count: traceMap.summary.partially_covered,
    not_covered_count: traceMap.summary.not_covered,
    unmapped_critical_count: traceMap.summary.unmapped_critical,
  };
}

function buildInventoryMetrics(reconciliation: ReconciliationResult | null): InventoryMetrics {
  if (!reconciliation) {
    return {
      planned_files: 0,
      generated_files: 0,
      missing_files: 0,
      missing_required_files: 0,
      unplanned_files: 0,
      generation_coverage_percent: 0,
      placeholder_count: 0,
      placeholder_in_required: 0,
      trace_linked_coverage_percent: 0,
      inventory_variance_percent: 0,
      inventory_variance_delta: 0,
    };
  }
  const v = reconciliation.inventory_variance;
  const traceCoveragePct = v.trace_linked_total > 0
    ? Math.round((v.trace_linked_generated / v.trace_linked_total) * 100)
    : 100;
  const varianceDelta = v.produced_files - v.expected_files;
  const variancePct = v.expected_files > 0
    ? Math.round(Math.abs(varianceDelta) / v.expected_files * 10000) / 100
    : 0;
  return {
    planned_files: reconciliation.total_planned,
    generated_files: reconciliation.total_generated,
    missing_files: reconciliation.total_missing,
    missing_required_files: reconciliation.missing_required_files.length,
    unplanned_files: reconciliation.total_unplanned,
    generation_coverage_percent: reconciliation.coverage_percent,
    placeholder_count: v.placeholder_count,
    placeholder_in_required: v.placeholder_in_required,
    trace_linked_coverage_percent: traceCoveragePct,
    inventory_variance_percent: variancePct,
    inventory_variance_delta: varianceDelta,
  };
}

function buildQualitySignals(input: QualityReportInput): QualitySignals {
  let extractionCompleteness: number | null = null;
  if (input.extraction) {
    const { required_sections_present, required_sections_total } = input.extraction.summary;
    extractionCompleteness = required_sections_total > 0
      ? Math.round((required_sections_present / required_sections_total) * 100)
      : 100;
  }

  let placeholderRatio: number | null = null;
  let inferredRatio: number | null = null;
  let inventoryVariancePct: number | null = null;
  if (input.reconciliation) {
    const v = input.reconciliation.inventory_variance;
    placeholderRatio = v.produced_files > 0
      ? Math.round((v.placeholder_count / v.produced_files) * 10000) / 100
      : 0;
    inferredRatio = v.produced_files > 0
      ? Math.round((v.unplanned_files / v.produced_files) * 10000) / 100
      : 0;
    inventoryVariancePct = v.expected_files > 0
      ? Math.round(Math.abs(v.produced_files - v.expected_files) / v.expected_files * 10000) / 100
      : 0;
  }

  let warningCount = 0;
  let blockingCount = 0;
  for (const gate of input.gateEvaluation.gates) {
    for (const c of gate.conditions) {
      if (!c.passed) {
        if (c.severity === "warning" || c.severity === "info") warningCount++;
        if (c.severity === "error" || c.severity === "critical") blockingCount++;
      }
    }
  }

  return {
    extraction_result: input.extraction?.extraction_result ?? null,
    extraction_completeness_percent: extractionCompleteness,
    derivation_completeness: input.derivedInputs?.summary.derivation_completeness ?? null,
    sufficiency_score: input.sufficiency?.overall_score ?? null,
    sufficiency_status: input.sufficiency?.status ?? null,
    verification_fidelity_percent: input.verificationSignals?.fidelity_percent ?? null,
    verification_passed: input.verificationSignals?.verification_passed ?? null,
    structural_violations: input.verificationSignals?.structural_violations ?? null,
    placeholder_ratio: placeholderRatio,
    inferred_ratio: inferredRatio,
    warning_count: warningCount,
    blocking_count: blockingCount,
    inventory_variance_percent: inventoryVariancePct,
  };
}

function buildPackagingEligibility(gateEval: FullGateEvaluation): PackagingEligibility {
  const blockingGates: string[] = [];
  const reasons: string[] = [];

  for (const gate of gateEval.gates) {
    if (gate.status === "fail") {
      blockingGates.push(gate.gate_id);
      reasons.push(`${gate.gate_id} (${gate.gate_name}) failed`);
    }
  }

  return {
    eligible: gateEval.packaging_eligible,
    blocking_gates: blockingGates,
    reasons: reasons.length > 0 ? reasons : ["All gates passed"],
  };
}

function deriveDecision(
  gateEval: FullGateEvaluation,
  qualityScore: number,
  buildStatus: BAQRunStatus,
): { decision: BAQBuildQualityReport["decision"]; reasons: string[] } {
  const reasons: string[] = [];

  if (buildStatus === "failed") {
    reasons.push("Build terminated with failure status");
    return { decision: "failed", reasons };
  }

  const failedGates = gateEval.gates.filter(g => g.status === "fail");

  if (failedGates.length > 0) {
    const failedIds = failedGates.map(g => `${g.gate_id} (${g.gate_name})`);
    reasons.push(`Gate(s) failed: ${failedIds.join(", ")}`);
    reasons.push("Build blocked — all gate failures block packaging");
    return { decision: "blocked", reasons };
  }

  if (qualityScore >= 70) {
    reasons.push(`All gates passed, quality score ${qualityScore}%`);
    return { decision: "approved", reasons };
  }

  reasons.push(`All gates passed but quality score ${qualityScore}% below 70%`);
  return { decision: "approved_with_warnings", reasons };
}

export interface ExtendedBuildQualityReport extends BAQBuildQualityReport {
  coverage_metrics: CoverageMetrics;
  inventory_metrics: InventoryMetrics;
  quality_signals: QualitySignals;
  packaging_eligibility: PackagingEligibility;
}

export function buildQualityReport(input: QualityReportInput): ExtendedBuildQualityReport {
  const qualityScore = computeOverallQualityScore(input);
  const { decision, reasons } = deriveDecision(input.gateEvaluation, qualityScore, input.buildStatus);
  const now = new Date().toISOString();

  return {
    schema_version: "1.0.0",
    report_id: `BQR-${input.buildId}`,
    run_id: input.runId,
    build_id: input.buildId,
    status: input.buildStatus,
    extraction: input.extraction
      ? { ref: input.extraction.extraction_id, result: input.extraction.extraction_result }
      : null,
    derivation: input.derivedInputs
      ? { ref: input.derivedInputs.derivation_id, completeness: input.derivedInputs.summary.derivation_completeness }
      : null,
    inventory: input.inventory
      ? { ref: input.inventory.inventory_id, file_count: input.inventory.summary.total_files }
      : null,
    traceability: input.traceMap
      ? { ref: input.traceMap.trace_map_id, coverage_percent: input.traceMap.summary.coverage_percent }
      : null,
    gates: input.gateEvaluation.gates,
    overall_quality_score: qualityScore,
    gate_summary: {
      total_gates: input.gateEvaluation.total,
      passed: input.gateEvaluation.passed_count,
      failed: input.gateEvaluation.failed_count,
      skipped: input.gateEvaluation.skipped_count,
    },
    decision,
    decision_reasons: reasons,
    coverage_metrics: buildCoverageMetrics(input),
    inventory_metrics: buildInventoryMetrics(input.reconciliation),
    quality_signals: buildQualitySignals(input),
    packaging_eligibility: buildPackagingEligibility(input.gateEvaluation),
    created_at: now,
    updated_at: now,
  };
}

export function writeQualityReport(
  runDir: string,
  report: ExtendedBuildQualityReport,
): string {
  const reportPath = path.join(runDir, "build_quality_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  return reportPath;
}

export interface PackagingDecisionRecord {
  packaging_allowed: boolean;
  block_reasons: string[];
  evaluated_at: string;
}

export function updateQualityReportWithPackagingDecision(
  runDir: string,
  packagingDecision: PackagingDecisionRecord,
): void {
  const reportPath = path.join(runDir, "build_quality_report.json");
  if (!fs.existsSync(reportPath)) return;

  try {
    const report: ExtendedBuildQualityReport & { packaging_decision?: PackagingDecisionRecord } =
      JSON.parse(fs.readFileSync(reportPath, "utf-8"));

    report.packaging_decision = packagingDecision;
    report.packaging_eligibility = {
      ...report.packaging_eligibility,
      eligible: packagingDecision.packaging_allowed,
      reasons: packagingDecision.packaging_allowed
        ? report.packaging_eligibility.reasons
        : packagingDecision.block_reasons,
    };
    report.updated_at = new Date().toISOString();

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  } catch {
    // quality report not parseable — skip update
  }
}
