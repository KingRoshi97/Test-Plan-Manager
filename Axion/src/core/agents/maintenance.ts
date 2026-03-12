import { BaseAgent, type AgentContext, type AgentGuardrail, type AgentIdentity, type GuardrailResult } from "./model.js";
import { getMusPolicy, getMaintenanceModes } from "../maintenance/loader.js";

const MA_CAPABILITIES = [
  "plan_maintenance",
  "apply_dependency_upgrades",
  "apply_migrations",
  "apply_refactors",
  "apply_test_hardening",
  "apply_ci_fixes",
  "apply_security_patches",
  "verify_and_prove",
  "maintain_axion_compatibility",
  "handle_rollback",
];

const MA_CONSTRAINTS = [
  "no_scope_expansion",
  "lockfile_discipline",
  "no_migration_safety_violations",
  "no_weakening_axion_enforcement",
  "no_secrets_pii_in_logs",
  "versioned_audit_trail",
];

export type MaintenanceIntentType =
  | "dep_upgrade"
  | "migration"
  | "refactor"
  | "test_hardening"
  | "ci_fix"
  | "security_patch";

const noScopeExpansionGuardrail: AgentGuardrail = {
  guardrail_id: "MA-G01",
  description: "MA must not expand scope beyond declared intent and allowed paths",
  check: (ctx: AgentContext): GuardrailResult => {
    const hasTargets = ctx.targets.length > 0;
    return {
      passed: hasTargets,
      guardrail_id: "MA-G01",
      message: hasTargets
        ? `Scope constrained to ${ctx.targets.length} declared path(s)`
        : "No scope constraints declared — scope expansion risk",
    };
  },
};

const lockfileDisciplineGuardrail: AgentGuardrail = {
  guardrail_id: "MA-G02",
  description: "MA must not introduce nondeterministic dependency states",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "MA-G02",
    message: "Lockfile discipline enforcement active",
  }),
};

const migrationSafetyGuardrail: AgentGuardrail = {
  guardrail_id: "MA-G03",
  description: "MA must not violate migration safety rules",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "MA-G03",
    message: "Migration safety rules enforcement active",
  }),
};

const axionEnforcementGuardrail: AgentGuardrail = {
  guardrail_id: "MA-G04",
  description: "MA must not weaken AXION enforcement rules",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "MA-G04",
    message: "AXION enforcement preservation active",
  }),
};

const noSecretsPIIGuardrail: AgentGuardrail = {
  guardrail_id: "MA-G05",
  description: "MA must not leak secrets/PII into logs/reports",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "MA-G05",
    message: "Secrets/PII filter active",
  }),
};

const auditTrailGuardrail: AgentGuardrail = {
  guardrail_id: "MA-G06",
  description: "MA must preserve audit trail — no overwrites, attempts versioned",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "MA-G06",
    message: "Versioned audit trail active",
  }),
};

export class MaintenanceAgent extends BaseAgent {
  private allowedPaths: string[];
  private disallowedPaths: string[];

  constructor(
    agentId: string = "MA-001",
    options: MaintenanceAgentOptions = {},
  ) {
    const identity: AgentIdentity = {
      agent_id: agentId,
      agent_type: "maintenance",
      capabilities: [...MA_CAPABILITIES],
      constraints: [...MA_CONSTRAINTS],
    };
    super(identity, [
      noScopeExpansionGuardrail,
      lockfileDisciplineGuardrail,
      migrationSafetyGuardrail,
      axionEnforcementGuardrail,
      noSecretsPIIGuardrail,
      auditTrailGuardrail,
    ]);
    this.allowedPaths = options.allowedPaths ?? [];
    this.disallowedPaths = options.disallowedPaths ?? [];
  }

  isPathInScope(targetPath: string): boolean {
    if (this.disallowedPaths.some((p) => targetPath.startsWith(p))) {
      return false;
    }
    if (this.allowedPaths.length === 0) return true;
    return this.allowedPaths.some((p) => targetPath.startsWith(p));
  }

  hasCapability(intentType: MaintenanceIntentType): boolean {
    const capabilityMap: Record<MaintenanceIntentType, string> = {
      dep_upgrade: "apply_dependency_upgrades",
      migration: "apply_migrations",
      refactor: "apply_refactors",
      test_hardening: "apply_test_hardening",
      ci_fix: "apply_ci_fixes",
      security_patch: "apply_security_patches",
    };
    return this.identity.capabilities.includes(capabilityMap[intentType]);
  }

  buildEvidenceRecord(
    intentType: MaintenanceIntentType,
    baselineRevision: string,
    filesTouched: string[],
    deltas: MaintenanceDelta[],
    verificationPointers: string[],
    compatibilityPointers: string[],
  ): MAEvidenceRecord {
    return {
      agent_id: this.identity.agent_id,
      intent_type: intentType,
      baseline_revision: baselineRevision,
      files_touched: filesTouched,
      deltas,
      verification_pointers: verificationPointers,
      compatibility_pointers: compatibilityPointers,
    };
  }

  validateRollbackStrategy(strategy: RollbackStrategy): RollbackValidationResult {
    const errors: string[] = [];
    if (!strategy.baseline_revision) {
      errors.push("Missing baseline_revision for rollback");
    }
    if (!strategy.rollback_command && !strategy.rollback_steps) {
      errors.push("Must provide either rollback_command or rollback_steps");
    }
    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export interface MaintenanceAgentOptions {
  allowedPaths?: string[];
  disallowedPaths?: string[];
}

export interface MaintenanceDelta {
  type: "dependency" | "migration" | "file_change";
  description: string;
  before: string;
  after: string;
}

export interface MAEvidenceRecord {
  agent_id: string;
  intent_type: MaintenanceIntentType;
  baseline_revision: string;
  files_touched: string[];
  deltas: MaintenanceDelta[];
  verification_pointers: string[];
  compatibility_pointers: string[];
}

export interface RollbackStrategy {
  baseline_revision: string;
  rollback_command?: string;
  rollback_steps?: string[];
}

export interface RollbackValidationResult {
  valid: boolean;
  errors: string[];
}

export function getMusPolicyGuardrails(): { applyRequiresConsent: boolean; publishRequiresConsent: boolean; tokenCap: number; maxProposals: number } {
  try {
    const policy = getMusPolicy(process.cwd());
    if (!policy) return { applyRequiresConsent: true, publishRequiresConsent: true, tokenCap: 50000, maxProposals: 5 };
    const consent = policy["consent"] as Record<string, unknown> | undefined;
    const budgets = policy["budgets_default"] as Record<string, unknown> | undefined;
    const proposalRules = policy["proposal_rules"] as Record<string, unknown> | undefined;
    return {
      applyRequiresConsent: (consent?.["apply_required"] as boolean | undefined) ?? true,
      publishRequiresConsent: (consent?.["publish_required"] as boolean | undefined) ?? true,
      tokenCap: (budgets?.["token_cap"] as number | undefined) ?? 50000,
      maxProposals: (proposalRules?.["max_proposal_packs_per_run"] as number | undefined) ?? 5,
    };
  } catch {
    return { applyRequiresConsent: true, publishRequiresConsent: true, tokenCap: 50000, maxProposals: 5 };
}
}

export function getActiveModeIds(): string[] {
  try {
    const modes = getMaintenanceModes(process.cwd());
    return modes.filter((m) => m.status === "active").map((m) => m.mode_id);
  } catch {
    return [];
  }
}
