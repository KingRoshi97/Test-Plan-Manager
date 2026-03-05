import { join } from "node:path";
import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { ImplementationRef, ProofRef, VerificationResult } from "./model.js";

export interface UnitResult {
  result_id: string;
  kit_run_id: string;
  unit_id: string;
  status: "done" | "failed";
  implementation_refs: ImplementationRef[];
  proof_refs: ProofRef[];
  verification_results: VerificationResult[];
  created_at: string;
  hash: string;
}

export function buildUnitResult(
  kitRunId: string,
  unitId: string,
  status: "done" | "failed",
  implementationRefs: ImplementationRef[],
  proofRefs: ProofRef[],
  verificationResults: VerificationResult[],
): UnitResult {
  const timestamp = isoNow();
  const resultId = `RESULT_${unitId}`;

  const payload = {
    resultId,
    kitRunId,
    unitId,
    status,
    implementationRefs,
    proofRefs,
    verificationResults,
    timestamp,
  };
  const hash = sha256(JSON.stringify(payload));

  return {
    result_id: resultId,
    kit_run_id: kitRunId,
    unit_id: unitId,
    status,
    implementation_refs: implementationRefs,
    proof_refs: proofRefs,
    verification_results: verificationResults,
    created_at: timestamp,
    hash,
  };
}

export function writeUnitResult(
  outputDir: string,
  result: UnitResult,
): string {
  const fileName = `RESULT_${result.unit_id}.json`;
  const filePath = join(outputDir, fileName);
  writeJson(filePath, result);
  return filePath;
}
