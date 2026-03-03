import { join } from "node:path";
import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { EvidencePointer } from "../../types/controlPlane.js";
import type { ResultFile } from "./types.js";

export function writeResult(
  kitDir: string,
  unitId: string,
  status: "DONE" | "FAILED" | "SKIPPED",
  implementationRefs: EvidencePointer[],
  proofRefs: EvidencePointer[],
  notes?: string
): ResultFile {
  if (status === "DONE") {
    if (implementationRefs.length === 0) {
      throw new Error(
        `Result for unit ${unitId} marked DONE but has no implementation_refs. At least one implementation reference is required.`
      );
    }
    if (proofRefs.length === 0) {
      throw new Error(
        `Result for unit ${unitId} marked DONE but has no proof_refs. At least one proof reference is required.`
      );
    }
  }

  const result: ResultFile = {
    unit_id: unitId,
    status,
    implementation_refs: implementationRefs,
    proof_refs: proofRefs,
    notes,
    created_at: isoNow(),
  };

  const resultsDir = join(kitDir, "results");
  const filePath = join(resultsDir, `RESULT_${unitId}.json`);
  writeJson(filePath, result);

  return result;
}
