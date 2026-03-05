import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { GateReportV1 } from "../gates/report.js";
import type { ProofType } from "../proofLedger/types.js";

export interface ProofObject {
  proof_id: string;
  run_id: string;
  gate_id: string;
  proof_type: ProofType;
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

export function createCommandOutputProof(
  runId: string,
  gateId: string,
  command: string,
  workingDirectory: string,
  exitCode: number,
  output: string,
  acceptanceRefs: string[] = [],
): ProofObject {
  const timestamp = isoNow();
  const proofId = `proof_${sha256(`${runId}_${gateId}_P01_${timestamp}`).slice(0, 12)}`;

  const evidence: Record<string, unknown> = {
    command,
    working_directory: workingDirectory,
    exit_code: exitCode,
    timestamp,
    output_ref: output,
  };

  const hash = sha256(JSON.stringify({ proofId, runId, gate_id: gateId, evidence, timestamp }));

  return {
    proof_id: proofId,
    run_id: runId,
    gate_id: gateId,
    proof_type: "P-01",
    status: exitCode === 0 ? "pass" : "fail",
    created_at: timestamp,
    acceptance_refs: acceptanceRefs,
    evidence,
    hash,
  };
}

export function createTestResultProof(
  runId: string,
  gateId: string,
  testCommand: string,
  passed: number,
  failed: number,
  reportLocation: string,
  acceptanceRefs: string[] = [],
): ProofObject {
  const timestamp = isoNow();
  const proofId = `proof_${sha256(`${runId}_${gateId}_P02_${timestamp}`).slice(0, 12)}`;

  const evidence: Record<string, unknown> = {
    test_command: testCommand,
    pass_fail_summary: { passed, failed, total: passed + failed },
    report_location: reportLocation,
    timestamp,
  };

  const hash = sha256(JSON.stringify({ proofId, runId, gate_id: gateId, evidence, timestamp }));

  return {
    proof_id: proofId,
    run_id: runId,
    gate_id: gateId,
    proof_type: "P-02",
    status: failed === 0 ? "pass" : "fail",
    created_at: timestamp,
    acceptance_refs: acceptanceRefs,
    evidence,
    hash,
  };
}

export function createDiffCommitProof(
  runId: string,
  gateId: string,
  diffCommitRef: string,
  filesChanged: string[],
  proves: string,
  acceptanceRefs: string[] = [],
): ProofObject {
  const timestamp = isoNow();
  const proofId = `proof_${sha256(`${runId}_${gateId}_P05_${timestamp}`).slice(0, 12)}`;

  const evidence: Record<string, unknown> = {
    diff_commit_ref: diffCommitRef,
    files_changed: filesChanged,
    timestamp,
    proves,
  };

  const hash = sha256(JSON.stringify({ proofId, runId, gate_id: gateId, evidence, timestamp }));

  return {
    proof_id: proofId,
    run_id: runId,
    gate_id: gateId,
    proof_type: "P-05",
    status: "pass",
    created_at: timestamp,
    acceptance_refs: acceptanceRefs,
    evidence,
    hash,
  };
}

export function createChecklistProof(
  runId: string,
  gateId: string,
  checklistId: string,
  items: Array<{ item: string; result: "pass" | "fail" }>,
  reviewer: string,
  acceptanceRefs: string[] = [],
): ProofObject {
  const timestamp = isoNow();
  const proofId = `proof_${sha256(`${runId}_${gateId}_P06_${timestamp}`).slice(0, 12)}`;

  const allPassed = items.every((i) => i.result === "pass");

  const evidence: Record<string, unknown> = {
    checklist_id: checklistId,
    itemized_results: items,
    reviewer,
    timestamp,
  };

  const hash = sha256(JSON.stringify({ proofId, runId, gate_id: gateId, evidence, timestamp }));

  return {
    proof_id: proofId,
    run_id: runId,
    gate_id: gateId,
    proof_type: "P-06",
    status: allPassed ? "pass" : "fail",
    created_at: timestamp,
    acceptance_refs: acceptanceRefs,
    evidence,
    hash,
  };
}
