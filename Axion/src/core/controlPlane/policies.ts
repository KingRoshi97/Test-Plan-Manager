import { NotImplementedError } from "../../utils/errors.js";

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

export function loadPolicies(_registryPath: string): Policy[] {
  throw new NotImplementedError("loadPolicies");
}

export function evaluatePolicy(_policy: Policy, _context: unknown): PolicyEvaluationResult {
  throw new NotImplementedError("evaluatePolicy");
}

export function evaluateAllPolicies(_policies: Policy[], _context: unknown): PolicyEvaluationResult[] {
  throw new NotImplementedError("evaluateAllPolicies");
}
