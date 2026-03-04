import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { ResolverContext, SelectedPack } from "./resolver.js";

export interface PackIndex {
  standards_library_version: string;
  packs: PackIndexEntry[];
}

export interface PackIndexEntry {
  pack_id: string;
  pack_version: string;
  category: string;
  applies_when: Record<string, unknown>;
  priority: number;
  rule_count: number;
}

export function loadPackIndex(indexPath: string): PackIndex {
  const raw = JSON.parse(readFileSync(indexPath, "utf-8"));
  return {
    standards_library_version: raw.standards_library_version ?? "0.0.0",
    packs: Array.isArray(raw.packs) ? raw.packs : [],
  };
}

export function matchPacks(index: PackIndex, context: ResolverContext): SelectedPack[] {
  const matched: SelectedPack[] = [];

  for (const entry of index.packs) {
    if (packApplies(entry.applies_when, context)) {
      matched.push({
        pack_id: entry.pack_id,
        pack_version: entry.pack_version,
        category: entry.category,
        applies_when: entry.applies_when,
        specificity_score: computeSpecificityScore(entry.applies_when),
        priority: entry.priority,
      });
    }
  }

  matched.sort((a, b) => {
    if (b.specificity_score !== a.specificity_score) return b.specificity_score - a.specificity_score;
    return b.priority - a.priority;
  });

  return matched;
}

function packApplies(appliesWhen: Record<string, unknown>, context: ResolverContext): boolean {
  const routing = appliesWhen.routing as Record<string, unknown> | undefined;
  if (routing && Object.keys(routing).length > 0) {
    for (const [key, expected] of Object.entries(routing)) {
      const actual = (context.routing as unknown as Record<string, unknown>)[key];
      if (typeof expected === "string" && actual !== expected) return false;
      if (Array.isArray(expected) && !expected.includes(actual)) return false;
    }
  }

  const gates = appliesWhen.gates as Record<string, unknown> | undefined;
  if (gates && Object.keys(gates).length > 0) {
    for (const [key, expected] of Object.entries(gates)) {
      const actual = (context.gates as unknown as Record<string, unknown>)[key];
      if (actual !== expected) return false;
    }
  }

  return true;
}

export function computeSpecificityScore(appliesWhen: Record<string, unknown>): number {
  let score = 0;

  const routing = appliesWhen.routing as Record<string, unknown> | undefined;
  if (routing) {
    score += Object.keys(routing).length * 10;
  }

  const gates = appliesWhen.gates as Record<string, unknown> | undefined;
  if (gates) {
    score += Object.keys(gates).length * 5;
  }

  return score;
}
