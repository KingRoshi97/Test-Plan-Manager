import { existsSync, readFileSync } from "node:fs";
import type { ProofEntry } from "../proofLedger/types.js";
import type { CoverageRule } from "./rules.js";

export interface CoverageScore {
  total_items: number;
  covered_items: number;
  coverage_percent: number;
  by_category: Record<string, { total: number; covered: number; percent: number }>;
  uncovered: Array<{ item_id: string; category: string; reason: string }>;
}

export interface SpecItem {
  item_id: string;
  category: string;
  acceptance_ref: string;
  required_proof_types?: string[];
}

export interface AcceptanceMap {
  items: SpecItem[];
}

export function parseAcceptanceMap(acceptanceMap: unknown): AcceptanceMap {
  if (!acceptanceMap || typeof acceptanceMap !== "object") {
    throw new Error("ERR-COV-002: acceptance map must be a non-null object");
  }
  const map = acceptanceMap as Record<string, unknown>;
  if (!Array.isArray(map.items)) {
    throw new Error("ERR-COV-002: acceptance map must contain an 'items' array");
  }
  const items: SpecItem[] = [];
  for (const raw of map.items) {
    if (!raw || typeof raw !== "object") {
      throw new Error("ERR-COV-002: each acceptance map item must be an object");
    }
    const item = raw as Record<string, unknown>;
    if (typeof item.item_id !== "string" || typeof item.category !== "string" || typeof item.acceptance_ref !== "string") {
      throw new Error("ERR-COV-002: each item must have item_id, category, and acceptance_ref as strings");
    }
    items.push({
      item_id: item.item_id as string,
      category: item.category as string,
      acceptance_ref: item.acceptance_ref as string,
      required_proof_types: Array.isArray(item.required_proof_types) ? item.required_proof_types as string[] : undefined,
    });
  }
  return { items };
}

export function loadAcceptanceMapFromFile(filePath: string): AcceptanceMap {
  if (!existsSync(filePath)) {
    throw new Error(`ERR-COV-001: acceptance map file not found: ${filePath}`);
  }
  const raw = JSON.parse(readFileSync(filePath, "utf-8"));
  return parseAcceptanceMap(raw);
}

export function computeCoverage(
  spec: unknown,
  proofLedger: ProofEntry[],
  acceptanceMap: unknown,
): CoverageScore {
  const map = parseAcceptanceMap(acceptanceMap);
  const items = map.items;

  if (items.length === 0) {
    return {
      total_items: 0,
      covered_items: 0,
      coverage_percent: 100,
      by_category: {},
      uncovered: [],
    };
  }

  const proofRefSet = new Set<string>();
  const proofTypesByRef = new Map<string, Set<string>>();

  for (const proof of proofLedger) {
    if (proof.acceptance_refs) {
      for (const ref of proof.acceptance_refs) {
        proofRefSet.add(ref);
        if (!proofTypesByRef.has(ref)) {
          proofTypesByRef.set(ref, new Set());
        }
        proofTypesByRef.get(ref)!.add(proof.proof_type);
      }
    }
  }

  const categoryTotals = new Map<string, number>();
  const categoryCovered = new Map<string, number>();
  const uncovered: Array<{ item_id: string; category: string; reason: string }> = [];
  let coveredCount = 0;

  for (const item of items) {
    const cat = item.category;
    categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + 1);

    if (!proofRefSet.has(item.acceptance_ref)) {
      uncovered.push({
        item_id: item.item_id,
        category: cat,
        reason: "no proof entry references this acceptance item",
      });
      continue;
    }

    if (item.required_proof_types && item.required_proof_types.length > 0) {
      const availableTypes = proofTypesByRef.get(item.acceptance_ref) || new Set();
      const missingTypes = item.required_proof_types.filter((t) => !availableTypes.has(t));
      if (missingTypes.length > 0) {
        uncovered.push({
          item_id: item.item_id,
          category: cat,
          reason: `missing required proof types: ${missingTypes.join(", ")}`,
        });
        continue;
      }
    }

    coveredCount++;
    categoryCovered.set(cat, (categoryCovered.get(cat) || 0) + 1);
  }

  const by_category: Record<string, { total: number; covered: number; percent: number }> = {};
  for (const [cat, total] of categoryTotals.entries()) {
    const covered = categoryCovered.get(cat) || 0;
    by_category[cat] = {
      total,
      covered,
      percent: total > 0 ? Math.round((covered / total) * 10000) / 100 : 100,
    };
  }

  return {
    total_items: items.length,
    covered_items: coveredCount,
    coverage_percent: Math.round((coveredCount / items.length) * 10000) / 100,
    by_category,
    uncovered,
  };
}

export function meetsCoverageThreshold(score: CoverageScore, threshold: number): boolean {
  return score.coverage_percent >= threshold;
}

export function meetsCategoryThresholds(
  score: CoverageScore,
  rules: CoverageRule[],
): { passed: boolean; failures: Array<{ rule_id: string; category: string; required: number; actual: number }> } {
  const failures: Array<{ rule_id: string; category: string; required: number; actual: number }> = [];

  for (const rule of rules) {
    for (const cat of rule.applies_to) {
      const catScore = score.by_category[cat];
      if (!catScore) {
        failures.push({
          rule_id: rule.rule_id,
          category: cat,
          required: rule.minimum_coverage,
          actual: 0,
        });
        continue;
      }
      if (catScore.percent < rule.minimum_coverage) {
        failures.push({
          rule_id: rule.rule_id,
          category: cat,
          required: rule.minimum_coverage,
          actual: catScore.percent,
        });
      }
    }
  }

  return { passed: failures.length === 0, failures };
}
