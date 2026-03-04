import { sha256 } from "../../utils/hash.js";
import type { ProofEntry } from "./types.js";
import { loadProofEntries, checkProofCompleteness, checkProofToGateLinkage } from "./registry.js";
import type { ProofCompletenessResult, ProofGateLinkageResult } from "./registry.js";

export function validateProofEntry(entry: ProofEntry): boolean {
  if (!entry.proof_id || !entry.run_id || !entry.gate_id || !entry.proof_type || !entry.timestamp || !entry.hash) {
    return false;
  }
  if (typeof entry.evidence !== "object" || entry.evidence === null) {
    return false;
  }
  const expectedHash = sha256(JSON.stringify({
    proofId: entry.proof_id,
    runId: entry.run_id,
    gateId: entry.gate_id,
    proofType: entry.proof_type,
    evidence: entry.evidence,
    timestamp: entry.timestamp,
  }));
  return expectedHash === entry.hash;
}

export function validateLedgerIntegrity(entries: ProofEntry[]): boolean {
  if (entries.length === 0) return true;
  for (const entry of entries) {
    if (!validateProofEntry(entry)) {
      return false;
    }
  }
  const proofIds = new Set<string>();
  for (const entry of entries) {
    if (proofIds.has(entry.proof_id)) {
      return false;
    }
    proofIds.add(entry.proof_id);
  }
  return true;
}

export interface LedgerValidationReport {
  integrity_valid: boolean;
  completeness: ProofCompletenessResult;
  linkage: ProofGateLinkageResult;
  can_pass: boolean;
  errors: string[];
}

export function validateLedgerForPass(
  ledgerPath: string,
  registryPath: string,
  requiredGateProofTypes: Record<string, string[]>
): LedgerValidationReport {
  const entries = loadProofEntries(ledgerPath);
  const errors: string[] = [];

  const integrityValid = validateLedgerIntegrity(entries);
  if (!integrityValid) {
    errors.push("Ledger integrity check failed: corrupted or duplicate entries detected");
  }

  const completeness = checkProofCompleteness(entries, registryPath);
  if (!completeness.complete) {
    errors.push(...completeness.errors);
  }

  const linkage = checkProofToGateLinkage(entries, requiredGateProofTypes);
  if (!linkage.valid) {
    errors.push(...linkage.errors);
  }

  return {
    integrity_valid: integrityValid,
    completeness,
    linkage,
    can_pass: integrityValid && completeness.complete && linkage.valid,
    errors,
  };
}
