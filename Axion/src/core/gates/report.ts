import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import type { EvidenceEntry } from "./evaluator.js";
import type { EvidenceCompletenessResult } from "./evidencePolicy.js";

export type GateVerdict = "pass" | "fail";

export interface GateIssue {
  issue_id: string;
  severity: "error" | "warning";
  error_code: string;
  rule_id: string;
  pointer: string;
  message: string;
  remediation: string;
}

export interface CheckReport {
  check_id: string;
  status: GateVerdict;
  failure_code: string | null;
  evidence: EvidenceEntry[];
}

export interface GateReportV1 {
  run_id: string;
  gate_id: string;
  stage_id: string;
  target: string;
  status: GateVerdict;
  evaluated_at: string;
  engine: {
    name: string;
    version: string;
  };
  issues: GateIssue[];
  checks: CheckReport[];
  failure_codes: string[];
  evidence: EvidenceEntry[];
  evidence_completeness?: EvidenceCompletenessResult;
}

export function writeGateReport(outputPath: string, report: GateReportV1): void {
  writeCanonicalJson(outputPath, report);
}

export function deriveTarget(gateId: string): string {
  const targetMap: Record<string, string> = {
    G1_INTAKE_VALIDITY: "intake/validation_result.json",
    G2_CANONICAL_INTEGRITY: "canonical/canonical_spec.json",
    G3_STANDARDS_RESOLVED: "standards/resolved_standards_snapshot.json",
    G4_TEMPLATE_SELECTION: "templates/selection_result.json",
    G5_TEMPLATE_COMPLETENESS: "templates/template_completeness_report.json",
    G6_PLAN_COVERAGE: "planning/coverage_report.json",
    G7_VERIFICATION: "verification/verification_run_result.json",
    G8_PACKAGE_INTEGRITY: "kit/kit_manifest.json",
  };
  return targetMap[gateId] ?? "run_manifest.json";
}

export function checksToIssues(
  checks: CheckReport[],
  gateId: string
): GateIssue[] {
  const issues: GateIssue[] = [];
  let issueCounter = 0;
  for (const check of checks) {
    if (check.status === "fail") {
      issueCounter++;
      issues.push({
        issue_id: `${gateId}-ISS-${String(issueCounter).padStart(3, "0")}`,
        severity: "error",
        error_code: check.failure_code ?? "GATE_CHECK_FAILED",
        rule_id: check.check_id,
        pointer: check.evidence[0]?.path ?? "",
        message: `Gate check '${check.check_id}' failed: ${check.failure_code ?? "unknown"}`,
        remediation: `Fix the condition causing check '${check.check_id}' to fail and re-run this stage.`,
      });
    }
  }
  return issues;
}
