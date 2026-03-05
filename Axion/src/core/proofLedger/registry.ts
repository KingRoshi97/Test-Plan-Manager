import { existsSync, readFileSync } from "node:fs";
import type { ProofEntry, ProofQuery, ProofType } from "./types.js";

export function loadProofEntries(ledgerPath: string): ProofEntry[] {
  if (!existsSync(ledgerPath)) {
    return [];
  }

  const content = readFileSync(ledgerPath, "utf-8");
  const lines = content.split("\n").filter((l) => l.trim());
  const entries: ProofEntry[] = [];

  for (const line of lines) {
    try {
      entries.push(JSON.parse(line) as ProofEntry);
    } catch {
      // skip malformed lines
    }
  }

  return entries;
}

export function filterProofsByGate(entries: ProofEntry[], gateId: string): ProofEntry[] {
  return entries.filter((e) => e.gate_id === gateId);
}

export function filterProofsByRun(entries: ProofEntry[], runId: string): ProofEntry[] {
  return entries.filter((e) => e.run_id === runId);
}

export function filterProofsByType(entries: ProofEntry[], proofType: ProofType): ProofEntry[] {
  return entries.filter((e) => e.proof_type === proofType);
}

export function filterProofsByAcceptanceRef(entries: ProofEntry[], acceptanceRef: string): ProofEntry[] {
  return entries.filter((e) => e.acceptance_refs && e.acceptance_refs.includes(acceptanceRef));
}

export function queryProofs(entries: ProofEntry[], query: ProofQuery): ProofEntry[] {
  let results = entries;

  if (query.run_id) {
    results = results.filter((e) => e.run_id === query.run_id);
  }
  if (query.gate_id) {
    results = results.filter((e) => e.gate_id === query.gate_id);
  }
  if (query.proof_type) {
    results = results.filter((e) => e.proof_type === query.proof_type);
  }
  if (query.acceptance_ref) {
    results = results.filter(
      (e) => e.acceptance_refs && e.acceptance_refs.includes(query.acceptance_ref!),
    );
  }

  return results;
}

export function getProofById(entries: ProofEntry[], proofId: string): ProofEntry | undefined {
  return entries.find((e) => e.proof_id === proofId);
}

export function getAcceptanceCoverage(
  entries: ProofEntry[],
  requiredAcceptanceRefs: string[],
): { covered: string[]; uncovered: string[]; coverage: number } {
  const coveredSet = new Set<string>();

  for (const entry of entries) {
    if (entry.acceptance_refs) {
      for (const ref of entry.acceptance_refs) {
        coveredSet.add(ref);
      }
    }
  }

  const covered = requiredAcceptanceRefs.filter((r) => coveredSet.has(r));
  const uncovered = requiredAcceptanceRefs.filter((r) => !coveredSet.has(r));
  const coverage = requiredAcceptanceRefs.length > 0
    ? covered.length / requiredAcceptanceRefs.length
    : 1;

  return { covered, uncovered, coverage };
}
