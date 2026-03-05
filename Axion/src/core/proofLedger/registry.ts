import { existsSync, readFileSync } from "node:fs";
import type { ProofEntry } from "./types.js";

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
