import { existsSync, readFileSync } from "node:fs";

export interface Policy {
  policy_id: string;
  name: string;
  version: string;
  description: string;
  rules: PolicyRule[];
  applies_to: string[];
  enforcement: "strict" | "advisory";
}

export interface PolicyRule {
  rule_id: string;
  condition: string;
  action: "allow" | "deny" | "warn";
  message: string;
}

export interface PolicyEvaluationResult {
  policy_id: string;
  passed: boolean;
  violations: Array<{
    rule_id: string;
    action: "deny" | "warn";
    message: string;
    context: Record<string, unknown>;
  }>;
}

export function loadPolicies(registryPath: string): Policy[] {
  if (!existsSync(registryPath)) {
    return [];
  }
  const raw = readFileSync(registryPath, "utf-8");
  const parsed = JSON.parse(raw) as unknown;
  if (Array.isArray(parsed)) {
    return parsed as Policy[];
  }
  if (parsed && typeof parsed === "object" && "policies" in parsed) {
    return (parsed as { policies: Policy[] }).policies;
  }
  return [];
}

export function evaluatePolicy(policy: Policy, context: unknown): PolicyEvaluationResult {
  const ctx = context as Record<string, unknown>;
  const violations: PolicyEvaluationResult["violations"] = [];

  for (const rule of policy.rules) {
    if (rule.action === "allow") continue;

    const conditionMet = evaluateCondition(rule.condition, ctx);
    if (conditionMet) {
      violations.push({
        rule_id: rule.rule_id,
        action: rule.action,
        message: rule.message,
        context: { condition: rule.condition },
      });
    }
  }

  const hasDenyViolation = violations.some((v) => v.action === "deny");
  const passed = policy.enforcement === "strict" ? !hasDenyViolation : true;

  return {
    policy_id: policy.policy_id,
    passed,
    violations,
  };
}

export function evaluateAllPolicies(policies: Policy[], context: unknown): PolicyEvaluationResult[] {
  return policies.map((p) => evaluatePolicy(p, context));
}

function evaluateCondition(condition: string, context: Record<string, unknown>): boolean {
  const parts = condition.split(/\s+/);
  if (parts.length < 3) return false;

  const [field, op, ...valueParts] = parts;
  const expected = valueParts.join(" ");
  const actual = resolveField(field, context);

  switch (op) {
    case "==":
    case "===":
      return String(actual) === expected;
    case "!=":
    case "!==":
      return String(actual) !== expected;
    case ">":
      return Number(actual) > Number(expected);
    case ">=":
      return Number(actual) >= Number(expected);
    case "<":
      return Number(actual) < Number(expected);
    case "<=":
      return Number(actual) <= Number(expected);
    case "contains":
      return Array.isArray(actual) ? actual.includes(expected) : String(actual).includes(expected);
    case "missing":
      return actual === undefined || actual === null;
    case "present":
      return actual !== undefined && actual !== null;
    default:
      return false;
  }
}

function resolveField(path: string, obj: Record<string, unknown>): unknown {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}
