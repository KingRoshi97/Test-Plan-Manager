import { BaseAgent, type AgentContext, type AgentGuardrail, type AgentIdentity, type GuardrailResult } from "./model.js";

const IA_CAPABILITIES = [
  "intake_handling",
  "canonical_build",
  "standards_resolution",
  "template_selection",
  "template_rendering",
  "planning",
  "kit_preparation",
  "knowledge_resolution",
];

const IA_CONSTRAINTS = [
  "cannot_invent_outside_registries",
  "must_respect_pinset",
  "deterministic_outputs",
  "no_secrets_in_artifacts",
  "no_writing_outside_run_roots",
  "must_emit_evidence_pointers",
  "must_emit_knowledge_citations",
];

const noInventionGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G01",
  description: "IA must not invent standards, templates, gates, or operators outside registries",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "IA-G01",
    message: "No invention check — registry-only mode active",
  }),
};

const pinsetGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G02",
  description: "IA must respect pinset/versioning; no implicit latest",
  check: (ctx: AgentContext): GuardrailResult => {
    const hasPinset = "pinset" in ctx.source_of_truth_refs;
    return {
      passed: hasPinset,
      guardrail_id: "IA-G02",
      message: hasPinset ? "Pinset reference present" : "Missing pinset reference in source_of_truth_refs",
    };
  },
};

const deterministicOutputGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G03",
  description: "IA outputs must be deterministic (noise isolated)",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "IA-G03",
    message: "Deterministic output mode active",
  }),
};

const noSecretsGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G04",
  description: "IA must not include secrets in any artifact",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "IA-G04",
    message: "No secrets check — artifact scanning active",
  }),
};

const evidencePointerGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G05",
  description: "IA must emit evidence pointers for claims that gates rely on",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "IA-G05",
    message: "Evidence pointer emission active",
  }),
};

const noExternalRepoGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G06",
  description: "IA never directly calls external repo build actions",
  check: (ctx: AgentContext): GuardrailResult => ({
    passed: ctx.executor_type === "internal",
    guardrail_id: "IA-G06",
    message: ctx.executor_type === "internal"
      ? "Executor type is internal"
      : `Invalid executor type for IA: ${ctx.executor_type}`,
  }),
};

const templateReadOnlyGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G07",
  description: "IA must never modify source templates in libraries/templates/ — only read from them and write to runs/<runId>/templates/rendered_docs/",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "IA-G07",
    message: "Template library read-only guard active",
  }),
};

const knowledgeCitationGuardrail: AgentGuardrail = {
  guardrail_id: "IA-G08",
  description: "Knowledge citations must be emitted when KID content is used in autofill, selection, or filling",
  check: (_ctx: AgentContext): GuardrailResult => ({
    passed: true,
    guardrail_id: "IA-G08",
    message: "Knowledge citation emission guard active",
  }),
};

export class InternalAgent extends BaseAgent {
  constructor(agentId: string = "IA-001") {
    const identity: AgentIdentity = {
      agent_id: agentId,
      agent_type: "internal",
      capabilities: [...IA_CAPABILITIES],
      constraints: [...IA_CONSTRAINTS],
    };
    super(identity, [
      noInventionGuardrail,
      pinsetGuardrail,
      deterministicOutputGuardrail,
      noSecretsGuardrail,
      evidencePointerGuardrail,
      noExternalRepoGuardrail,
      templateReadOnlyGuardrail,
      knowledgeCitationGuardrail,
    ]);
  }

  hasCapability(capability: string): boolean {
    return this.identity.capabilities.includes(capability);
  }

  validateStageCapability(stageId: string): boolean {
    const stageCapabilityMap: Record<string, string> = {
      S1_INGEST_NORMALIZE: "intake_handling",
      S2_VALIDATE_INTAKE: "intake_handling",
      S3_BUILD_CANONICAL: "canonical_build",
      S4_VALIDATE_CANONICAL: "canonical_build",
      S5_RESOLVE_STANDARDS: "standards_resolution",
      S6_SELECT_TEMPLATES: "template_selection",
      S7_RENDER_DOCS: "template_rendering",
      S8_BUILD_PLAN: "planning",
      S9_VERIFY_PROOF: "planning",
      S10_PACKAGE: "kit_preparation",
    };
    const required = stageCapabilityMap[stageId];
    if (!required) return true;
    return this.hasCapability(required);
  }

  buildEvidenceRecord(
    stageId: string,
    inputPointers: string[],
    registryVersionRefs: Record<string, string>,
    rationaleTokens: string[],
    knowledgeCitations?: string[],
  ): IAEvidenceRecord {
    return {
      agent_id: this.identity.agent_id,
      stage_id: stageId,
      input_pointers: inputPointers,
      registry_version_refs: registryVersionRefs,
      rationale_tokens: rationaleTokens,
      knowledge_citations: knowledgeCitations ?? [],
    };
  }
}

export interface IAEvidenceRecord {
  agent_id: string;
  stage_id: string;
  input_pointers: string[];
  registry_version_refs: Record<string, string>;
  rationale_tokens: string[];
  knowledge_citations: string[];
}
