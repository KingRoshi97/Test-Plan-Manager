import { z } from "zod";

export const RoutingSnapshotSchema = z.object({
  skill_level: z.string(),
  category: z.string(),
  type_preset: z.string(),
  build_target: z.string(),
  audience_context: z.string(),
});

export const ProjectInfoSchema = z.object({
  project_name: z.string(),
  project_overview: z.string(),
});

export const SpecSnapshotFeatureSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const SpecSnapshotRoleSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  primary_goal: z.string().optional(),
});

export const SpecSnapshotWorkflowSchema = z.object({
  name: z.string(),
  actor_role: z.string(),
  steps: z.array(z.string()),
  success_outcome: z.string(),
  failure_states: z.string().optional(),
  priority: z.string().optional(),
});

export const SpecSnapshotSchema = z.object({
  must_have_features: z.array(SpecSnapshotFeatureSchema),
  roles: z.array(SpecSnapshotRoleSchema),
  workflows: z.array(SpecSnapshotWorkflowSchema),
});

export const SubmissionSchema = z.object({
  submission_id: z.string(),
  submitted_at: z.string(),
  form_version: z.string(),
  routing: RoutingSnapshotSchema,
  project: ProjectInfoSchema,
  spec: SpecSnapshotSchema,
  constraints: z.record(z.string(), z.unknown()).optional(),
});

export const NormalizedInputSchema = z.object({
  submission_id: z.string(),
  normalized_at: z.string(),
  routing: RoutingSnapshotSchema,
  project: ProjectInfoSchema,
  spec: SpecSnapshotSchema,
  constraints: z.record(z.string(), z.unknown()),
  raw_hash: z.string(),
});

export const SubmissionRecordSchema = z.object({
  submission_id: z.string(),
  schema_version: z.string(),
  submitted_at: z.string(),
  payload_hash: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ValidationResultSchema = z.object({
  submission_id: z.string(),
  validated_at: z.string(),
  valid: z.boolean(),
  hard_failures: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional(),
  })),
  soft_failures: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional(),
  })),
  warnings: z.array(z.object({
    field: z.string(),
    message: z.string(),
    code: z.string().optional(),
  })),
});

export const RoleEntitySchema = z.object({
  role_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  primary_goal: z.string().optional(),
});

export const FeatureEntitySchema = z.object({
  feature_id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  priority_tier: z.enum(["must", "nice", "future"]),
  priority_rank: z.number().optional(),
});

export const WorkflowEntitySchema = z.object({
  workflow_id: z.string(),
  name: z.string(),
  actor_role_ref: z.string(),
  steps: z.array(z.string()),
  success_outcome: z.string(),
  failure_states: z.string().optional(),
  priority: z.string().optional(),
});

export const PermissionEntitySchema = z.object({
  perm_id: z.string(),
  role_ref: z.string(),
  allowed_capabilities: z.array(z.string()),
  restricted_actions: z.array(z.string()).optional(),
  approval_required_actions: z.array(z.string()).optional(),
});

export const UnknownEntitySchema = z.object({
  unknown_id: z.string(),
  area: z.string(),
  summary: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  blocking: z.boolean(),
  needs: z.string(),
  refs: z.array(z.string()),
});

export const CanonicalSpecSchema = z.object({
  meta: z.object({
    spec_id: z.string(),
    submission_id: z.string(),
    schema_version_used: z.string(),
    standards_snapshot_id: z.string(),
    standards_version_used: z.string(),
    spec_version: z.string(),
    created_at: z.string(),
  }),
  routing: z.record(z.string(), z.string()),
  constraints: z.object({
    stack_constraints: z.unknown(),
    security_constraints: z.unknown(),
    quality_constraints: z.unknown(),
    design_constraints: z.unknown().optional(),
    fixed_vs_configurable: z.record(z.string(), z.enum(["fixed", "configurable"])),
  }),
  entities: z.object({
    roles: z.array(RoleEntitySchema),
    features: z.array(FeatureEntitySchema),
    workflows: z.array(WorkflowEntitySchema),
    permissions: z.array(PermissionEntitySchema),
    screens: z.array(z.unknown()).optional(),
    data_objects: z.array(z.unknown()).optional(),
    operations: z.array(z.unknown()).optional(),
    integrations: z.array(z.unknown()).optional(),
  }),
  rules: z.object({
    definition_of_done: z.string(),
    must_always: z.array(z.string()).optional(),
    must_never: z.array(z.string()).optional(),
    must_pass_checks: z.array(z.string()).optional(),
    acceptance_criteria: z.array(z.string()).optional(),
    rejection_conditions: z.string().optional(),
  }),
  unknowns: z.array(UnknownEntitySchema),
  index: z.object({
    roles_by_id: z.record(z.string(), z.unknown()),
    features_by_id: z.record(z.string(), z.unknown()),
    workflows_by_id: z.record(z.string(), z.unknown()),
    cross_maps: z.object({
      workflow_to_features: z.record(z.string(), z.array(z.string())).optional(),
      feature_to_workflows: z.record(z.string(), z.array(z.string())).optional(),
      feature_to_operations: z.record(z.string(), z.array(z.string())).optional(),
      role_to_workflows: z.record(z.string(), z.array(z.string())).optional(),
      role_to_permissions: z.record(z.string(), z.array(z.string())).optional(),
    }),
  }),
});

export const ApplicabilityOutputSchema = z.object({
  run_id: z.string(),
  evaluated_at: z.string(),
  matched_packs: z.array(z.object({
    pack_id: z.string(),
    version: z.string(),
    rationale: z.string(),
    match_score: z.number().optional(),
  })),
  unmatched_packs: z.array(z.string()).optional(),
});

export const ResolverTraceEntrySchema = z.object({
  pack_id: z.string(),
  version: z.string(),
  rule_id: z.string(),
  merged_at: z.string(),
  namespace: z.string().optional(),
});

export const ResolvedStandardsSnapshotSchema = z.object({
  snapshot_id: z.string(),
  run_id: z.string(),
  created_at: z.string(),
  resolver_version: z.string(),
  resolved_standards: z.array(z.object({
    standard_id: z.string(),
    title: z.string(),
    namespace: z.string(),
    source_pack: z.string(),
    version: z.string(),
    content: z.unknown(),
  })),
  resolver_trace: z.array(ResolverTraceEntrySchema),
});

export const TemplateSelectionResultSchema = z.object({
  run_id: z.string(),
  selected_at: z.string(),
  selection_hash: z.string().optional(),
  selected: z.array(z.object({
    template_id: z.string(),
    template_version: z.string(),
    source_file_path: z.string(),
    output_path: z.string(),
    rationale: z.string().optional(),
  })),
});

export const RenderEnvelopeSchema = z.object({
  template_id: z.string(),
  template_version: z.string(),
  rendered_at: z.string(),
  output_path: z.string(),
  placeholders_total: z.number(),
  placeholders_resolved: z.number(),
  placeholders_unresolved: z.number(),
  resolved_fields: z.record(z.string(), z.unknown()).optional(),
  unresolved_fields: z.array(z.string()).optional(),
  content: z.unknown(),
});

export const CompletenessReportSchema = z.object({
  run_id: z.string(),
  checked_at: z.string(),
  total_templates: z.number(),
  complete_count: z.number(),
  incomplete_count: z.number(),
  pass: z.boolean(),
  templates: z.array(z.object({
    template_id: z.string(),
    complete: z.boolean(),
    total_placeholders: z.number(),
    resolved: z.number(),
    unresolved: z.number(),
    unresolved_fields: z.array(z.string()).optional(),
    blocking: z.boolean().optional(),
  })),
});

export const WorkUnitSchema = z.object({
  unit_id: z.string(),
  title: z.string(),
  type: z.enum(["spec", "design", "frontend", "backend", "contracts", "data", "security", "qa", "devops", "docs"]),
  description: z.string().optional(),
  scope_refs: z.array(z.string()),
  depends_on: z.array(z.string()),
  outputs: z.array(z.string()),
  acceptance_refs: z.array(z.string()).optional(),
});

export const WorkBreakdownSchema = z.object({
  version: z.string(),
  run_id: z.string(),
  spec_id: z.string(),
  units: z.array(WorkUnitSchema),
});

export const RequiredProofSchema = z.object({
  type: z.enum(["test_run", "lint_run", "typecheck", "screenshot", "api_trace", "log_excerpt", "manual_check", "benchmark"]),
  ref: z.string(),
  notes: z.string().optional(),
});

export const AcceptanceItemSchema = z.object({
  acceptance_id: z.string(),
  title: z.string(),
  unit_ref: z.string(),
  category: z.enum(["screen", "endpoint", "entity", "business_rule", "component", "acceptance_criterion", "test_case", "flow", "nonfunctional"]),
  criteria: z.array(z.string()),
  required_proof: z.array(RequiredProofSchema),
});

export const AcceptanceMapSchema = z.object({
  version: z.string(),
  run_id: z.string(),
  spec_id: z.string(),
  acceptance: z.array(AcceptanceItemSchema),
});

export const CoverageReportSchema = z.object({
  run_id: z.string(),
  spec_id: z.string(),
  checked_at: z.string(),
  total_items: z.number(),
  covered_items: z.number(),
  coverage_percent: z.number(),
  uncovered: z.array(z.object({
    ref: z.string(),
    type: z.string(),
    reason: z.string().optional(),
  })),
});

export const ProofArtifactSchema = z.object({
  ref: z.string(),
  path: z.string(),
  hash: z.string().optional(),
  notes: z.string().optional(),
});

export const ProofCommandSchema = z.object({
  command_ref: z.string(),
  notes: z.string().optional(),
});

export const ProofEntrySchema = z.object({
  proof_id: z.string(),
  created_at: z.string(),
  acceptance_refs: z.array(z.string()),
  unit_refs: z.array(z.string()),
  type: z.enum(["test_run", "lint_run", "typecheck", "screenshot", "api_trace", "log_excerpt", "manual_check", "benchmark"]),
  status: z.enum(["pass", "fail", "warn", "skipped"]),
  summary: z.string().optional(),
  artifacts: z.array(ProofArtifactSchema),
  commands: z.array(ProofCommandSchema),
});

export const ProofLedgerSchema = z.object({
  version: z.string(),
  run_id: z.string(),
  spec_id: z.string(),
  entries: z.array(ProofEntrySchema),
});

export const VerificationRunResultSchema = z.object({
  run_id: z.string(),
  verified_at: z.string(),
  gates_checked: z.array(z.object({
    gate_id: z.string(),
    verdict: z.enum(["PASS", "FAIL", "WARN", "SKIP"]),
    report_path: z.string().optional(),
  })),
  all_passed: z.boolean(),
  proof_count: z.number(),
  summary: z.string().optional(),
});

export const KitManifestSchema = z.object({
  version: z.string(),
  run_id: z.string(),
  spec_id: z.string(),
  created_at: z.string(),
  files: z.array(z.object({
    path: z.string(),
    role: z.enum(["entrypoint", "versions", "canonical", "standards", "planning", "templates", "gates", "proof", "misc"]),
    hash: z.string(),
    bytes: z.number().optional(),
    notes: z.string().optional(),
  })),
});

export const KitEntrypointSchema = z.object({
  version: z.string(),
  run_id: z.string(),
  spec_id: z.string(),
  start_here: z.string(),
  how_to_use: z.array(z.string()),
  do_not_do: z.array(z.string()),
  links: z.array(z.object({
    label: z.string(),
    path: z.string(),
  })).optional(),
});

export const KitVersionPinSchema = z.object({
  id: z.string(),
  version: z.string(),
  hash: z.string().optional(),
  notes: z.string().optional(),
});

export const KitVersionStampSchema = z.object({
  version: z.string(),
  run_id: z.string(),
  pins: z.object({
    intake: KitVersionPinSchema,
    canonical: KitVersionPinSchema,
    standards: KitVersionPinSchema,
    templates: KitVersionPinSchema,
    planning: KitVersionPinSchema,
    gates: KitVersionPinSchema,
  }),
});

export const PackagingManifestSchema = z.object({
  run_id: z.string(),
  packaged_at: z.string(),
  total_files: z.number(),
  total_bytes: z.number(),
  files: z.array(z.object({
    path: z.string(),
    hash: z.string(),
    bytes: z.number(),
  })),
});
