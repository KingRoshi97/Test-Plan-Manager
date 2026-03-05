import { sha256 } from "../../utils/hash.js";
import type { ProofEntry } from "./types.js";

export function validateProofEntry(entry: ProofEntry): boolean {
  if (!entry.proof_id || !entry.run_id || !entry.gate_id || !entry.proof_type) {
    return false;
  }
  if (!entry.timestamp || !entry.hash) {
    return false;
  }
  if (typeof entry.evidence !== "object" || entry.evidence === null) {
    return false;
  }
  return true;
}

export function validateLedgerIntegrity(entries: ProofEntry[]): boolean {
  for (const entry of entries) {
    if (!validateProofEntry(entry)) {
      return false;
    }
  }
  return true;
}
