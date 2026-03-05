import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { readJson } from "../../utils/fs.js";

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

export interface RiskClass {
  risk_class: string;
  hard_stops: string[];
  required_evidence: string[];
  allow_overrides: boolean;
}

export interface OverrideRule {
  rule_id: string;
  applies_to: string;
  allowed: boolean;
  requires_evidence: string[];
  expires_in_days: number;
  notes?: string;
}

interface PolicyRegistryFile {
  $schema: string;
  description: string;
  entries: Array<{
    policy_id: string;
    version: string;
    description: string;
    rules: Array<{
      rule_id?: string;
      condition?: string;
      action?: string;
      message?: string;
    }>;
    applies_to?: string[];
    enforcement?: "strict" | "advisory";
    name?: string;
  }>;
}

interface RiskClassesFile {
  version: string;
  description: string;
  classes: RiskClass[];
}

interface OverridePolicyFile {
  version: string;
  rules: OverrideRule[];
}

export interface PolicyContext {
  run_id?: string;
  stage_id?: string;
  risk_class?: string;
  gate_results?: Record<string, { passed: boolean }>;
  evidence?: string[];
  overrides?: Array<{
    rule_id: string;
    evidence: string[];
    created_at: string;
  }>;
  [key: string]: unknown;
}

export function loadPolicies(registryPath: string): Policy[] {
  const policies: Policy[] = [];

  if (existsSync(registryPath)) {
    const registry = readJson<PolicyRegistryFile>(registryPath);
    for (const entry of registry.entries) {
      policies.push({
        policy_id: entry.policy_id,
        name: entry.name ?? entry.policy_id,
        version: entry.version,
        description: entry.description,
        rules: (entry.rules ?? []).map((r, i) => ({
          rule_id: r.rule_id ?? `${entry.policy_id}-R${String(i + 1).padStart(2, "0")}`,
          condition: r.condition ?? "true",
          action: (r.action as PolicyRule["action"]) ?? "allow",
          message: r.message ?? "",
        })),
        applies_to: entry.applies_to ?? ["*"],
        enforcement: entry.enforcement ?? "strict",
      });
    }
  }

  const libraryDir = join(dirname(registryPath), "libraries", "policy");
  if (existsSync(libraryDir)) {
    const riskClassesPath = join(libraryDir, "risk_classes.v1.json");
    if (existsSync(riskClassesPath)) {
      const riskFile = readJson<RiskClassesFile>(riskClassesPath);
      for (const rc of riskFile.classes) {
        const rules: PolicyRule[] = [];
        for (const hs of rc.hard_stops) {
          rules.push({
            rule_id: `RC-${rc.risk_class}-HS-${hs}`,
            condition: hs,
            action: "deny",
            message: `Hard stop for risk class ${rc.risk_class}: ${hs}`,
          });
        }
        for (const ev of rc.required_evidence) {
          rules.push({
            rule_id: `RC-${rc.risk_class}-EV-${ev}`,
            condition: `evidence.includes("${ev}")`,
            action: "deny",
            message: `Required evidence for risk class ${rc.risk_class}: ${ev}`,
          });
        }
        if (!rc.allow_overrides) {
          rules.push({
            rule_id: `RC-${rc.risk_class}-NO-OVR`,
            condition: "overrides.length === 0",
            action: "deny",
            message: `Overrides not allowed for risk class ${rc.risk_class}`,
          });
        }
        policies.push({
          policy_id: `RISK-${rc.risk_class}`,
          name: `Risk Class ${rc.risk_class}`,
          version: riskFile.version,
          description: `Policy derived from risk class ${rc.risk_class}`,
          rules,
          applies_to: [`risk_class:${rc.risk_class}`],
          enforcement: "strict",
        });
      }
    }

    const overridePath = join(libraryDir, "override_policy.v1.json");
    if (existsSync(overridePath)) {
      const overrideFile = readJson<OverridePolicyFile>(overridePath);
      const rules: PolicyRule[] = overrideFile.rules.map((r) => ({
        rule_id: r.rule_id,
        condition: r.applies_to,
        action: r.allowed ? "allow" : "deny",
        message: r.notes ?? `Override rule ${r.rule_id}: ${r.allowed ? "allowed" : "denied"} for ${r.applies_to}`,
      }));
      policies.push({
        policy_id: "OVERRIDE-POLICY",
        name: "Override Policy",
        version: overrideFile.version,
        description: "Controls which overrides are permitted",
        rules,
        applies_to: ["overrides"],
        enforcement: "strict",
      });
    }
  }

  return policies;
}

function matchesCondition(condition: string, context: PolicyContext): boolean {
  if (condition === "true") return true;

  const hardStopPatterns = [
    "security.gates.fail",
    "privacy.data_handling.missing",
  ];
  if (hardStopPatterns.includes(condition)) {
    const gateResults = context.gate_results ?? {};
    const parts = condition.split(".");
    const domain = parts[0];
    const resultKey = Object.keys(gateResults).find((k) =>
      k.toLowerCase().includes(domain)
    );
    if (resultKey && gateResults[resultKey] && !gateResults[resultKey].passed) {
      return true;
    }
    return false;
  }

  if (condition.startsWith("evidence.includes(")) {
    const match = condition.match(/evidence\.includes\("([^"]+)"\)/);
    if (match) {
      const required = match[1];
      const evidence = context.evidence ?? [];
      return !evidence.includes(required);
    }
  }

  if (condition === "overrides.length === 0") {
    const overrides = context.overrides ?? [];
    return overrides.length > 0;
  }

  if (condition.startsWith("gates.") || condition.startsWith("standards.")) {
    return false;
  }

  return false;
}

function policyAppliesToContext(policy: Policy, context: PolicyContext): boolean {
  for (const scope of policy.applies_to) {
    if (scope === "*") return true;
    if (scope === "overrides" && context.overrides !== undefined) return true;
    if (scope.startsWith("risk_class:")) {
      const rc = scope.split(":")[1];
      if (context.risk_class === rc) return true;
    }
    if (scope === context.stage_id) return true;
  }
  return false;
}

export function evaluatePolicy(policy: Policy, context: unknown): PolicyEvaluationResult {
  const ctx = (context ?? {}) as PolicyContext;
  const violations: PolicyEvaluationResult["violations"] = [];

  if (!policyAppliesToContext(policy, ctx)) {
    return { policy_id: policy.policy_id, passed: true, violations: [] };
  }

  for (const rule of policy.rules) {
    if (rule.action === "allow") continue;

    const triggered = matchesCondition(rule.condition, ctx);
    if (triggered) {
      violations.push({
        rule_id: rule.rule_id,
        action: rule.action,
        message: rule.message,
        context: {
          condition: rule.condition,
          risk_class: ctx.risk_class,
          stage_id: ctx.stage_id,
        },
      });
    }
  }

  const hasDeny = violations.some((v) => v.action === "deny");
  const passed = policy.enforcement === "strict" ? !hasDeny : true;

  return { policy_id: policy.policy_id, passed, violations };
}

export function evaluateAllPolicies(policies: Policy[], context: unknown): PolicyEvaluationResult[] {
  return policies.map((p) => evaluatePolicy(p, context));
}
