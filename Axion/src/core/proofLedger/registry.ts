import { NotImplementedError } from "../../utils/errors.js";
import type { ProofEntry } from "./types.js";

export function loadProofEntries(_ledgerPath: string): ProofEntry[] {
  throw new NotImplementedError("loadProofEntries");
}

export function filterProofsByGate(_entries: ProofEntry[], _gateId: string): ProofEntry[] {
  throw new NotImplementedError("filterProofsByGate");
}
