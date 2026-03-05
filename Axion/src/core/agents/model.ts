export type AgentType = "internal" | "external_build" | "maintenance";

export type RiskClass = "prototype" | "production" | "compliance";

export interface AgentIdentity {
  agent_id: string;
  agent_type: AgentType;
  capabilities: string[];
  constraints: string[];
}

export interface AgentContext {
  run_id: string;
  mode_id: string;
  risk_class: RiskClass;
  executor_type: AgentType;
  targets: string[];
  source_of_truth_refs: Record<string, string>;
  upstream_artifact_refs: string[];
}

export interface AgentOutput {
  artifact_id: string;
  artifact_type: string;
  path: string;
  hash: string;
  produced_by: string;
  input_pointers: string[];
  registry_version_refs: Record<string, string>;
}

export interface AgentFailure {
  agent_id: string;
  stage_id: string;
  failing_artifact: string;
  failing_schema: string;
  remediation_steps: string[];
  evidence_pointers: string[];
}

export interface AgentGuardrail {
  guardrail_id: string;
  description: string;
  check: (context: AgentContext) => GuardrailResult;
}

export interface GuardrailResult {
  passed: boolean;
  guardrail_id: string;
  message: string;
  evidence_pointer?: string;
}

export abstract class BaseAgent {
  readonly identity: AgentIdentity;
  protected guardrails: AgentGuardrail[];

  constructor(identity: AgentIdentity, guardrails: AgentGuardrail[] = []) {
    this.identity = identity;
    this.guardrails = guardrails;
  }

  checkGuardrails(context: AgentContext): GuardrailResult[] {
    return this.guardrails.map((g) => g.check(context));
  }

  enforceGuardrails(context: AgentContext): void {
    const results = this.checkGuardrails(context);
    const violations = results.filter((r) => !r.passed);
    if (violations.length > 0) {
      const messages = violations.map((v) => `[${v.guardrail_id}] ${v.message}`).join("; ");
      throw new Error(`Agent guardrail violations: ${messages}`);
    }
  }
}
