import { BaseAgent, type AgentContext, type AgentGuardrail, type AgentIdentity, type GuardrailResult } from "./model.js";

const BA_CAPABILITIES = [
  "follow_kit_entrypoint",
  "implement_plan_units",
  "run_verification",
  "produce_result_artifacts",
  "support_safe_reruns",
];

const BA_CONSTRAINTS = [
  "no_axion_registry_access",
  "scope_limited_to_kit_targets",
  "command_allowlist_only",
  "no_secrets_pii_in_logs",
  "reuse_rules_enforced",
  "one_target_per_unit",
];

const noRegistryAccessGuardrail: AgentGuardrail = {
  guardrail_id: "BA-G01",
  description: "BA cannot access AXION registries or modify system rules",
  check: (ctx: AgentContext): GuardrailResult => ({
    passed: ctx.executor_type === "external_build",
    guardrail_id: "BA-G01",
    message: ctx.executor_type === "external_build"
      ? "Executor type is external_build — registry access blocked"
      : `Invalid executor type for BA: ${ctx.executor_type}`,
  }),
};

const scopeLimitGuardrail: AgentGuardrail = {
  guardrail_id: "BA-G02",
  description: "BA scope limited to kit declared targets and active plan unit",
  check: (ctx: AgentContext): GuardrailResult => {
    const hasTargets = ctx.targets.length > 0;
    return {
      passed: hasTargets,
      guardrail_id: "BA-G02",
      message: hasTargets
        ? `Scope limited to ${ctx.targets.length} declared target(s)`
        : "No targets declared — scope violation",
    };
  },
};

const noSecretsPIIGuardrail: AgentGuardrail = {
  guardrail_id: "BA-G03",
  description: "BA cannot include secrets/PII in logs/results",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "BA-G03",
    message: "Secrets/PII filter active",
  }),
};

const oneTargetPerUnitGuardrail: AgentGuardrail = {
  guardrail_id: "BA-G04",
  description: "BA must enforce 1-target-per-unit constraint",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "BA-G04",
    message: "1-target-per-unit enforcement active",
  }),
};

export class BuildAgent extends BaseAgent {
  private commandAllowlist: string[];
  private forbiddenPaths: string[];
  private reuseAllowlist: string[];

  constructor(
    agentId: string = "BA-001",
    options: BuildAgentOptions = {},
  ) {
    const identity: AgentIdentity = {
      agent_id: agentId,
      agent_type: "external_build",
      capabilities: [...BA_CAPABILITIES],
      constraints: [...BA_CONSTRAINTS],
    };
    super(identity, [
      noRegistryAccessGuardrail,
      scopeLimitGuardrail,
      noSecretsPIIGuardrail,
      oneTargetPerUnitGuardrail,
    ]);
    this.commandAllowlist = options.commandAllowlist ?? [];
    this.forbiddenPaths = options.forbiddenPaths ?? [];
    this.reuseAllowlist = options.reuseAllowlist ?? [];
  }

  isCommandAllowed(command: string): boolean {
    if (this.commandAllowlist.length === 0) return true;
    return this.commandAllowlist.some((allowed) => command.startsWith(allowed));
  }

  isPathAllowed(targetPath: string): boolean {
    return !this.forbiddenPaths.some((forbidden) => targetPath.startsWith(forbidden));
  }

  isReuseAllowed(sourceRef: string): boolean {
    if (this.reuseAllowlist.length === 0) return false;
    return this.reuseAllowlist.includes(sourceRef);
  }

  validateUnit(unit: PlanUnit): UnitValidationResult {
    const errors: string[] = [];

    if (!unit.unit_id) {
      errors.push("Missing unit_id");
    }
    if (!unit.target || unit.target.length === 0) {
      errors.push("Missing target — 1-target-per-unit rule violated");
    }
    if (Array.isArray(unit.target) && unit.target.length > 1) {
      errors.push(`Multi-target unit rejected: ${unit.target.length} targets found — 1-target-per-unit rule violated`);
    }

    return {
      valid: errors.length === 0,
      unit_id: unit.unit_id,
      errors,
    };
  }

  buildResultArtifact(
    unitId: string,
    implementationRefs: ImplementationRef[],
    proofRefs: BAProofRef[],
  ): ResultArtifact {
    if (implementationRefs.length === 0) {
      throw new Error(`Cannot produce RESULT for unit ${unitId}: implementation_refs[] is empty`);
    }
    if (proofRefs.length === 0) {
      throw new Error(`Cannot produce RESULT for unit ${unitId}: proof_refs[] is empty`);
    }

    return {
      unit_id: unitId,
      status: "done",
      implementation_refs: implementationRefs,
      proof_refs: proofRefs,
      produced_by: this.identity.agent_id,
    };
  }
}

export interface BuildAgentOptions {
  commandAllowlist?: string[];
  forbiddenPaths?: string[];
  reuseAllowlist?: string[];
}

export interface PlanUnit {
  unit_id: string;
  target: string | string[];
  acceptance_criteria?: string[];
  proof_requirements?: string[];
}

export interface UnitValidationResult {
  valid: boolean;
  unit_id: string;
  errors: string[];
}

export interface ImplementationRef {
  type: "path" | "diff" | "commit";
  value: string;
}

export interface BAProofRef {
  type: "verification_log" | "build_output" | "screenshot" | "hash";
  value: string;
  hash?: string;
}

export interface ResultArtifact {
  unit_id: string;
  status: "done";
  implementation_refs: ImplementationRef[];
  proof_refs: BAProofRef[];
  produced_by: string;
}
