import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { GateReportV1 } from "../gates/report.js";

export interface ProofObject {
  proof_id: string;
  run_id: string;
  gate_id: string;
  proof_type: string;
  status: "pass" | "fail";
  created_at: string;
  acceptance_refs: string[];
  evidence: Record<string, unknown>;
  hash: string;
}

export function createProofFromGateReport(
  report: GateReportV1,
  runId: string,
  acceptanceRefs: string[] = [],
): ProofObject {
  const timestamp = isoNow();
  const proofId = `proof_${sha256(`${runId}_${report.gate_id}_${timestamp}`).slice(0, 12)}`;

  const evidence: Record<string, unknown> = {
    gate_id: report.gate_id,
    stage_id: report.stage_id,
    verdict: report.status,
    checks_total: report.checks.length,
    checks_passed: report.checks.filter((c) => c.status === "pass").length,
    failure_codes: report.failure_codes,
    evaluated_at: report.evaluated_at,
  };

  const hash = sha256(JSON.stringify({ proofId, runId, gate_id: report.gate_id, evidence, timestamp }));

  return {
    proof_id: proofId,
    run_id: runId,
    gate_id: report.gate_id,
    proof_type: "automated_check",
    status: report.status === "pass" ? "pass" : "fail",
    created_at: timestamp,
    acceptance_refs: acceptanceRefs,
    evidence,
    hash,
  };
}

export function createProofsFromGateReports(
  reports: GateReportV1[],
  runId: string,
): ProofObject[] {
  return reports.map((r) => createProofFromGateReport(r, runId));
}
