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

function deriveDecision(
  gateEval: FullGateEvaluation,
  qualityScore: number,
): { decision: BAQBuildQualityReport["decision"]; reasons: string[] } {
  const reasons: string[] = [];
  const CRITICAL_GATES = new Set(["G-BQ-01", "G-BQ-02", "G-BQ-03"]);

  const criticalFailures = gateEval.gates.filter(
    g => g.status === "fail" && CRITICAL_GATES.has(g.gate_id),
  );
  const nonCriticalFailures = gateEval.gates.filter(
    g => g.status === "fail" && !CRITICAL_GATES.has(g.gate_id),
  );

  if (criticalFailures.length > 0) {
    const failedIds = criticalFailures.map(g => `${g.gate_id} (${g.gate_name})`);
    reasons.push(`Critical pre-generation gate(s) failed: ${failedIds.join(", ")}`);
    reasons.push("Build blocked — critical gates are hard requirements");
    return { decision: "block_build", reasons };
  }

  if (nonCriticalFailures.length > 0) {
    const failedIds = nonCriticalFailures.map(g => `${g.gate_id} (${g.gate_name})`);
    reasons.push(`Non-critical gate(s) failed: ${failedIds.join(", ")}`);
    reasons.push(`Quality score ${qualityScore}% — allowing with warnings`);
    return { decision: "allow_with_warnings", reasons };
  }

  if (qualityScore >= 70) {
    reasons.push(`All gates passed, quality score ${qualityScore}%`);
    return { decision: "allow_build", reasons };
  }

  reasons.push(`All gates passed but quality score ${qualityScore}% below 70% — allowing with warnings`);
  return { decision: "allow_with_warnings", reasons };
}

export function buildQualityReport(input: QualityReportInput): BAQBuildQualityReport {
  const qualityScore = computeOverallQualityScore(input);
  const { decision, reasons } = deriveDecision(input.gateEvaluation, qualityScore);
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
    created_at: now,
    updated_at: now,
  };
}

export function writeQualityReport(
  runDir: string,
  report: BAQBuildQualityReport,
): string {
  const reportPath = path.join(runDir, "build_quality_report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");
  return reportPath;
}
