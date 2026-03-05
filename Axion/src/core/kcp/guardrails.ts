import { isoNow } from "../../utils/time.js";
import type { GuardrailReport, GuardrailViolation } from "./model.js";

export interface GuardrailConfig {
  forbidden_paths: string[];
  command_allowlist: string[];
  max_file_size_bytes: number;
  secrets_patterns: RegExp[];
  pii_patterns: RegExp[];
  reuse_rules: {
    max_copy_lines: number;
    require_attribution: boolean;
  };
}

const DEFAULT_CONFIG: GuardrailConfig = {
  forbidden_paths: [
    ".env",
    ".env.local",
    ".env.production",
    "node_modules/",
    ".git/",
    "/etc/",
    "/var/",
    "~/.ssh/",
    "~/.aws/",
  ],
  command_allowlist: [
    "npm",
    "npx",
    "node",
    "tsc",
    "eslint",
    "prettier",
    "jest",
    "vitest",
    "mocha",
    "cargo",
    "go",
    "python",
    "pip",
    "pytest",
    "cat",
    "echo",
    "ls",
    "find",
    "grep",
    "mkdir",
    "cp",
    "mv",
  ],
  max_file_size_bytes: 10 * 1024 * 1024,
  secrets_patterns: [
    /(?:api[_-]?key|secret[_-]?key|password|token|credential)\s*[:=]\s*['"]\S+['"]/i,
    /-----BEGIN (?:RSA |DSA |EC )?PRIVATE KEY-----/,
    /ghp_[a-zA-Z0-9]{36}/,
    /sk-[a-zA-Z0-9]{48}/,
    /AKIA[0-9A-Z]{16}/,
  ],
  pii_patterns: [
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  ],
  reuse_rules: {
    max_copy_lines: 50,
    require_attribution: true,
  },
};

export function checkForbiddenPaths(
  paths: string[],
  config?: GuardrailConfig,
): GuardrailViolation[] {
  const cfg = config ?? DEFAULT_CONFIG;
  const violations: GuardrailViolation[] = [];

  for (const p of paths) {
    for (const forbidden of cfg.forbidden_paths) {
      if (p.includes(forbidden)) {
        violations.push({
          rule_id: "GR-FORBIDDEN-PATH",
          description: `Access to forbidden path: ${p}`,
          severity: "error",
          target: p,
        });
      }
    }
  }

  return violations;
}

export function checkCommandAllowlist(
  commands: string[],
  config?: GuardrailConfig,
): GuardrailViolation[] {
  const cfg = config ?? DEFAULT_CONFIG;
  const violations: GuardrailViolation[] = [];

  for (const cmd of commands) {
    const base = cmd.trim().split(/\s+/)[0];
    if (!cfg.command_allowlist.includes(base)) {
      violations.push({
        rule_id: "GR-COMMAND-BLOCKED",
        description: `Command not in allowlist: ${base}`,
        severity: "error",
        target: cmd,
      });
    }
  }

  return violations;
}

export function checkSecretsAndPii(
  content: string,
  sourcePath: string,
  config?: GuardrailConfig,
): GuardrailViolation[] {
  const cfg = config ?? DEFAULT_CONFIG;
  const violations: GuardrailViolation[] = [];

  for (const pattern of cfg.secrets_patterns) {
    if (pattern.test(content)) {
      violations.push({
        rule_id: "GR-SECRET-DETECTED",
        description: `Potential secret detected in ${sourcePath}`,
        severity: "error",
        target: sourcePath,
      });
      break;
    }
  }

  for (const pattern of cfg.pii_patterns) {
    if (pattern.test(content)) {
      violations.push({
        rule_id: "GR-PII-DETECTED",
        description: `Potential PII detected in ${sourcePath}`,
        severity: "warning",
        target: sourcePath,
      });
      break;
    }
  }

  return violations;
}

export function checkReuseRules(
  copyLineCount: number,
  hasAttribution: boolean,
  sourcePath: string,
  config?: GuardrailConfig,
): GuardrailViolation[] {
  const cfg = config ?? DEFAULT_CONFIG;
  const violations: GuardrailViolation[] = [];

  if (copyLineCount > cfg.reuse_rules.max_copy_lines) {
    violations.push({
      rule_id: "GR-REUSE-EXCESS",
      description: `Copied ${copyLineCount} lines exceeds max ${cfg.reuse_rules.max_copy_lines}`,
      severity: "warning",
      target: sourcePath,
    });
  }

  if (cfg.reuse_rules.require_attribution && !hasAttribution && copyLineCount > 0) {
    violations.push({
      rule_id: "GR-REUSE-NO-ATTR",
      description: `Copied content lacks attribution in ${sourcePath}`,
      severity: "warning",
      target: sourcePath,
    });
  }

  return violations;
}

export function buildGuardrailReport(
  kitRunId: string,
  violations: GuardrailViolation[],
): GuardrailReport {
  const hasErrors = violations.some((v) => v.severity === "error");

  return {
    kit_run_id: kitRunId,
    passed: !hasErrors,
    violations,
    timestamp: isoNow(),
  };
}
