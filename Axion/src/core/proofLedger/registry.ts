import { existsSync, readFileSync } from "node:fs";
import type { ProofEntry } from "./types.js";
import { loadProofTypeRegistry, validateRequiredFields } from "./ledger.js";
import type { ProofTypeRegistryEntry } from "./ledger.js";

export function loadProofEntries(ledgerPath: string): ProofEntry[] {
  if (!existsSync(ledgerPath)) return [];
  const content = readFileSync(ledgerPath, "utf-8").trim();
  if (!content) return [];
  const lines = content.split("\n").filter((l) => l.trim().length > 0);
  const entries: ProofEntry[] = [];
  for (const line of lines) {
    entries.push(JSON.parse(line) as ProofEntry);
  }
  return entries;
}

export function filterProofsByGate(entries: ProofEntry[], gateId: string): ProofEntry[] {
  return entries.filter((e) => e.gate_id === gateId);
}

export function filterProofsByRun(entries: ProofEntry[], runId: string): ProofEntry[] {
  return entries.filter((e) => e.run_id === runId);
}

export interface ProofGateLinkageResult {
  valid: boolean;
  errors: string[];
  gate_proof_map: Record<string, string[]>;
}

export function checkProofToGateLinkage(
  entries: ProofEntry[],
  requiredGateProofTypes: Record<string, string[]>
): ProofGateLinkageResult {
  const errors: string[] = [];
  const gateProofMap: Record<string, string[]> = {};

  for (const [gateId, requiredTypes] of Object.entries(requiredGateProofTypes)) {
    const gateProofs = filterProofsByGate(entries, gateId);
    const foundTypes = new Set(gateProofs.map((p) => p.proof_type));
    gateProofMap[gateId] = [...foundTypes];

    for (const reqType of requiredTypes) {
      if (!foundTypes.has(reqType)) {
        errors.push(`Gate "${gateId}" requires proof type "${reqType}" but none found in ledger`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    gate_proof_map: gateProofMap,
  };
}

export interface ProofCompletenessResult {
  complete: boolean;
  errors: string[];
  total_proofs: number;
  valid_proofs: number;
  invalid_proofs: ProofInvalidEntry[];
  unregistered_types: string[];
  missing_required_fields: ProofFieldError[];
}

export interface ProofInvalidEntry {
  proof_id: string;
  reason: string;
}

export interface ProofFieldError {
  proof_id: string;
  proof_type: string;
  missing_fields: string[];
}

export function checkProofCompleteness(
  entries: ProofEntry[],
  registryPath: string
): ProofCompletenessResult {
  const registryEntries = loadProofTypeRegistry(registryPath);
  const errors: string[] = [];
  const invalidProofs: ProofInvalidEntry[] = [];
  const unregisteredTypes: string[] = [];
  const missingRequiredFields: ProofFieldError[] = [];
  let validCount = 0;

  const registeredTypeSet = new Set(registryEntries.map((e) => e.proof_type));

  for (const entry of entries) {
    if (registryEntries.length > 0 && !registeredTypeSet.has(entry.proof_type)) {
      unregisteredTypes.push(entry.proof_type);
      invalidProofs.push({
        proof_id: entry.proof_id,
        reason: `Unregistered proof type: "${entry.proof_type}"`,
      });
      errors.push(`Proof ${entry.proof_id}: unregistered type "${entry.proof_type}"`);
      continue;
    }

    const fieldCheck = validateRequiredFields(entry.proof_type, entry.evidence, registryPath);
    if (!fieldCheck.valid) {
      missingRequiredFields.push({
        proof_id: entry.proof_id,
        proof_type: entry.proof_type,
        missing_fields: fieldCheck.missing,
      });
      invalidProofs.push({
        proof_id: entry.proof_id,
        reason: `Missing required fields: ${fieldCheck.missing.join(", ")}`,
      });
      errors.push(`Proof ${entry.proof_id} (type "${entry.proof_type}"): missing required fields: ${fieldCheck.missing.join(", ")}`);
      continue;
    }

    validCount++;
  }

  return {
    complete: errors.length === 0,
    errors,
    total_proofs: entries.length,
    valid_proofs: validCount,
    invalid_proofs: invalidProofs,
    unregistered_types: [...new Set(unregisteredTypes)],
    missing_required_fields: missingRequiredFields,
  };
}
