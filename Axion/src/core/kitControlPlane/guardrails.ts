import { isoNow } from "../../utils/time.js";
import type { ExecutorType } from "../../types/controlPlane.js";
import type { GuardrailViolation, GuardrailReport } from "./types.js";

const SECRETS_PATTERNS = [
  /(?:^|[^a-zA-Z0-9])(?:password|passwd|pwd)\s*[:=]\s*["'][^"']+["']/gi,
  /(?:api[_-]?key|apikey)\s*[:=]\s*["'][^"']+["']/gi,
  /(?:secret[_-]?key|secretkey)\s*[:=]\s*["'][^"']+["']/gi,
  /(?:access[_-]?token|auth[_-]?token)\s*[:=]\s*["'][^"']+["']/gi,
  /(?:private[_-]?key)\s*[:=]\s*["'][^"']+["']/gi,
  /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/,
];

const PII_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/,
];

const EXTERNAL_AGENT_FORBIDDEN_ACTIONS = new Set([
  "modify_gate_definitions",
  "override_gates",
  "modify_pinset",
  "modify_registries",
  "release_bundle",
  "modify_audit_log",
]);

export function checkForbiddenPaths(
  paths: string[],
  forbiddenPatterns: string[]
): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];

  for (const p of paths) {
    for (const pattern of forbiddenPatterns) {
      if (p.includes(pattern) || new RegExp(pattern).test(p)) {
        violations.push({
          rule_id: "forbidden_path",
          severity: "critical",
          affected_paths: [p],
          evidence: [{ type: "file", path: p, description: `Path matches forbidden pattern: ${pattern}` }],
          remediation: [{ step_id: "remove_forbidden", description: `Remove or relocate file at forbidden path: ${p}`, priority: "critical" }],
          overridable: false,
        });
      }
    }
  }

  return violations;
}

export function checkExternalAgentRestrictions(
  executorType: ExecutorType,
  action: string
): GuardrailViolation[] {
  if (executorType !== "external") return [];

  if (EXTERNAL_AGENT_FORBIDDEN_ACTIONS.has(action)) {
    return [{
      rule_id: "external_agent_restriction",
      severity: "critical",
      affected_paths: [],
      evidence: [{ type: "log", path: "", description: `External agent attempted forbidden action: ${action}` }],
      remediation: [{ step_id: "escalate_to_internal", description: `Action '${action}' requires internal agent. Escalate or request operator override.`, priority: "critical" }],
      overridable: false,
    }];
  }

  return [];
}

export function checkPlagiarismReuse(
  content: string,
  allowlist: string[]
): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];
  const copyrightPattern = /(?:copyright|©|\(c\))\s+\d{4}/gi;
  const matches = content.match(copyrightPattern);

  if (matches) {
    for (const match of matches) {
      const isAllowed = allowlist.some((a) => match.toLowerCase().includes(a.toLowerCase()));
      if (!isAllowed) {
        violations.push({
          rule_id: "plagiarism_copyright",
          severity: "high",
          affected_paths: [],
          evidence: [{ type: "log", path: "", description: `Potential copyright content detected: ${match}` }],
          remediation: [{ step_id: "review_copyright", description: "Review and remove or attribute copyrighted content", priority: "high" }],
          overridable: true,
        });
      }
    }
  }

  return violations;
}

export function checkSecretsPII(content: string): GuardrailViolation[] {
  const violations: GuardrailViolation[] = [];

  for (const pattern of SECRETS_PATTERNS) {
    if (pattern.test(content)) {
      violations.push({
        rule_id: "secrets_detected",
        severity: "critical",
        affected_paths: [],
        evidence: [{ type: "log", path: "", description: `Potential secret/credential detected matching pattern: ${pattern.source}` }],
        remediation: [{ step_id: "remove_secret", description: "Remove hardcoded secret and use environment variable or secrets manager", priority: "critical" }],
        overridable: false,
      });
      pattern.lastIndex = 0;
    }
  }

  for (const pattern of PII_PATTERNS) {
    if (pattern.test(content)) {
      violations.push({
        rule_id: "pii_detected",
        severity: "high",
        affected_paths: [],
        evidence: [{ type: "log", path: "", description: `Potential PII detected matching pattern: ${pattern.source}` }],
        remediation: [{ step_id: "remove_pii", description: "Remove or redact personally identifiable information", priority: "high" }],
        overridable: true,
      });
    }
  }

  return violations;
}

export function buildGuardrailReport(violations: GuardrailViolation[]): GuardrailReport {
  let status: GuardrailReport["status"] = "PASS";
  if (violations.length > 0) {
    const hasCritical = violations.some((v) => v.severity === "critical" && !v.overridable);
    status = hasCritical ? "FAIL" : "BLOCKED";
  }

  return {
    status,
    violations,
    checked_at: isoNow(),
  };
}
