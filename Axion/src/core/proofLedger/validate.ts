import { NotImplementedError } from "../../utils/errors.js";
import type { ProofEntry } from "./types.js";

export function validateProofEntry(_entry: ProofEntry): boolean {
  throw new NotImplementedError("validateProofEntry");
}

export function validateLedgerIntegrity(_entries: ProofEntry[]): boolean {
  throw new NotImplementedError("validateLedgerIntegrity");
}
