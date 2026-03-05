import { join } from "node:path";
import { writeJson, appendJsonl } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { ProofRef, VerificationResult } from "./model.js";

export interface KitProofObject {
  proof_id: string;
  kit_run_id: string;
  unit_id: string;
  proof_type: "verification_log" | "build_output" | "test_result" | "manual_attestation";
  status: "pass" | "fail";
  created_at: string;
  evidence: Record<string, unknown>;
  hash: string;
}

export function captureProofFromVerification(
  kitRunId: string,
  unitId: string,
  result: VerificationResult,
): KitProofObject {
  const timestamp = isoNow();
  const proofId = `kproof_${sha256(`${kitRunId}_${unitId}_${result.check_id}_${timestamp}`).slice(0, 12)}`;

  const evidence: Record<string, unknown> = {
    check_id: result.check_id,
    command: result.command,
    exit_code: result.exit_code,
    passed: result.passed,
    log_ref: result.log_ref,
    verified_at: result.timestamp,
  };

  const hash = sha256(JSON.stringify({ proofId, kitRunId, unitId, evidence, timestamp }));

  return {
    proof_id: proofId,
    kit_run_id: kitRunId,
    unit_id: unitId,
    proof_type: "verification_log",
    status: result.passed ? "pass" : "fail",
    created_at: timestamp,
    evidence,
    hash,
  };
}

export function captureProofsFromVerifications(
  kitRunId: string,
  unitId: string,
  results: VerificationResult[],
): KitProofObject[] {
  return results.map((r) => captureProofFromVerification(kitRunId, unitId, r));
}

export function proofObjectToRef(proof: KitProofObject, outputDir: string): ProofRef {
  return {
    proof_id: proof.proof_id,
    type: proof.proof_type,
    path: join(outputDir, `${proof.proof_id}.json`),
    hash: proof.hash,
  };
}

export function writeProofObjects(
  outputDir: string,
  proofs: KitProofObject[],
): ProofRef[] {
  const refs: ProofRef[] = [];

  for (const proof of proofs) {
    const filePath = join(outputDir, `${proof.proof_id}.json`);
    writeJson(filePath, proof);
    refs.push(proofObjectToRef(proof, outputDir));
  }

  return refs;
}

export function appendToProofLedger(
  ledgerPath: string,
  proofs: KitProofObject[],
): void {
  for (const proof of proofs) {
    appendJsonl(ledgerPath, {
      proof_id: proof.proof_id,
      kit_run_id: proof.kit_run_id,
      unit_id: proof.unit_id,
      proof_type: proof.proof_type,
      status: proof.status,
      created_at: proof.created_at,
      hash: proof.hash,
    });
  }
}
