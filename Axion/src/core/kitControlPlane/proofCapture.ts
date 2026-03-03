import { join } from "node:path";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { appendJsonl, ensureDir } from "../../utils/fs.js";
import type { EvidencePointer } from "../../types/controlPlane.js";
import type { KitProofObject } from "./types.js";

export function captureKitProof(
  verificationOutput: EvidencePointer,
  unitId: string,
  target: string,
  proofType: string
): KitProofObject {
  const proofId = `proof_${unitId}_${proofType}_${Date.now()}`;
  const contentForHash = JSON.stringify({ verificationOutput, unitId, target, proofType });

  return {
    proof_id: proofId,
    proof_type: proofType,
    unit_id: unitId,
    target,
    source: verificationOutput,
    hash: sha256(contentForHash),
    captured_at: isoNow(),
  };
}

export function writeKitProofLedger(
  kitDir: string,
  proofObjects: KitProofObject[]
): string {
  const ledgerPath = join(kitDir, "proof_ledger.jsonl");
  ensureDir(kitDir);

  for (const proof of proofObjects) {
    appendJsonl(ledgerPath, proof);
  }

  return ledgerPath;
}
