import { appendJsonl } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { ProofEntry } from "./types.js";

export class ProofLedger {
  constructor(private ledgerPath: string) {}

  append(runId: string, gateId: string, proofType: string, evidence: Record<string, unknown>): ProofEntry {
    const timestamp = isoNow();
    const proofId = `proof_${sha256(`${runId}_${gateId}_${timestamp}`).slice(0, 12)}`;
    const hash = sha256(JSON.stringify({ proofId, runId, gateId, proofType, evidence, timestamp }));

    const entry: ProofEntry = {
      proof_id: proofId,
      run_id: runId,
      gate_id: gateId,
      proof_type: proofType,
      timestamp,
      evidence,
      hash,
    };

    appendJsonl(this.ledgerPath, entry);
    return entry;
  }
}
