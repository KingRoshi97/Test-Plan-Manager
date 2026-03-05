import { existsSync, readFileSync } from "node:fs";

export interface CoverageRule {
  rule_id: string;
  category: string;
  description: string;
  required_proof_types: string[];
  minimum_coverage: number;
  applies_to: string[];
}

export const DEFAULT_RULES: CoverageRule[] = [
  {
    rule_id: "COV-RULE-001",
    category: "functional",
    description: "Functional acceptance items must have at least 80% coverage",
    required_proof_types: ["P-01", "P-02"],
    minimum_coverage: 80,
    applies_to: ["functional"],
  },
  {
    rule_id: "COV-RULE-002",
    category: "security",
    description: "Security acceptance items must have at least 90% coverage",
    required_proof_types: ["P-01", "P-02", "P-06"],
    minimum_coverage: 90,
    applies_to: ["security"],
  },
  {
    rule_id: "COV-RULE-003",
    category: "integration",
    description: "Integration acceptance items must have at least 70% coverage",
    required_proof_types: ["P-01", "P-02"],
    minimum_coverage: 70,
    applies_to: ["integration"],
  },
];

export function loadRules(rulesPath: string): CoverageRule[] {
  if (!existsSync(rulesPath)) {
    return DEFAULT_RULES;
  }
  const content = readFileSync(rulesPath, "utf-8");
  const parsed = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new Error("ERR-COV-001: coverage rules file must contain a JSON array");
  }

  const rules: CoverageRule[] = [];
  for (const raw of parsed) {
    const validated = validateRule(raw);
    rules.push(validated);
  }

  return rules;
}

function validateRule(raw: unknown): CoverageRule {
  if (!raw || typeof raw !== "object") {
    throw new Error("ERR-COV-002: each coverage rule must be an object");
  }
  const r = raw as Record<string, unknown>;

  if (typeof r.rule_id !== "string" || !r.rule_id) {
    throw new Error("ERR-COV-002: coverage rule must have a non-empty rule_id string");
  }
  if (typeof r.category !== "string" || !r.category) {
    throw new Error("ERR-COV-002: coverage rule must have a non-empty category string");
  }
  if (typeof r.description !== "string") {
    throw new Error("ERR-COV-002: coverage rule must have a description string");
  }
  if (!Array.isArray(r.required_proof_types)) {
    throw new Error("ERR-COV-002: coverage rule must have required_proof_types array");
  }
  if (typeof r.minimum_coverage !== "number" || r.minimum_coverage < 0 || r.minimum_coverage > 100) {
    throw new Error("ERR-COV-002: coverage rule minimum_coverage must be a number between 0 and 100");
  }
  if (!Array.isArray(r.applies_to) || r.applies_to.length === 0) {
    throw new Error("ERR-COV-002: coverage rule must have a non-empty applies_to array");
  }

  return {
    rule_id: r.rule_id as string,
    category: r.category as string,
    description: r.description as string,
    required_proof_types: r.required_proof_types as string[],
    minimum_coverage: r.minimum_coverage as number,
    applies_to: r.applies_to as string[],
  };
}

export function validateRules(rules: CoverageRule[]): boolean {
  if (!Array.isArray(rules) || rules.length === 0) {
    return false;
  }

  const ruleIds = new Set<string>();
  for (const rule of rules) {
    if (ruleIds.has(rule.rule_id)) {
      return false;
    }
    ruleIds.add(rule.rule_id);

    if (!rule.rule_id || !rule.category || !rule.description) {
      return false;
    }
    if (!Array.isArray(rule.required_proof_types)) {
      return false;
    }
    if (typeof rule.minimum_coverage !== "number" || rule.minimum_coverage < 0 || rule.minimum_coverage > 100) {
      return false;
    }
    if (!Array.isArray(rule.applies_to) || rule.applies_to.length === 0) {
      return false;
    }
  }

  return true;
}
