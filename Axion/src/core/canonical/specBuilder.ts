import { NotImplementedError } from "../../utils/errors.js";

export interface CanonicalSpecMeta {
  spec_id: string;
  submission_id: string;
  schema_version_used: string;
  standards_snapshot_id: string;
  standards_version_used: string;
  spec_version: string;
  created_at: string;
}

export interface RoleEntity {
  role_id: string;
  name: string;
  description?: string;
  primary_goal?: string;
}

export interface FeatureEntity {
  feature_id: string;
  name: string;
  description?: string;
  priority_tier: "must" | "nice" | "future";
  priority_rank?: number;
  scope_boundaries?: {
    in_scope?: string[];
    out_of_scope?: string[];
  };
  workflow_refs?: string[];
}

export interface WorkflowEntity {
  workflow_id: string;
  name: string;
  actor_role_ref: string;
  steps: string[];
  success_outcome: string;
  failure_states?: string;
  priority?: string;
}

export interface PermissionEntity {
  perm_id: string;
  role_ref: string;
  allowed_capabilities: string[];
  restricted_actions?: string[];
  approval_required_actions?: string[];
}

export interface ScreenEntity {
  screen_id: string;
  name: string;
  purpose: string;
  roles_allowed: string[];
  data_shown?: string;
  actions?: string[];
  state_notes?: string;
}

export interface DataObjectEntity {
  data_object_id: string;
  name: string;
  description?: string;
  fields_required: Array<{ name: string; type: string; notes?: string }>;
  fields_optional: Array<{ name: string; type: string; notes?: string }>;
  relationships: Array<{ relation_type: string; target_data_object_ref: string; notes?: string }>;
  lifecycle_states?: string[];
  sensitive_flags?: string[];
}

export interface OperationEntity {
  operation_id: string;
  name: string;
  purpose: string;
  inputs_summary?: string;
  outputs_summary?: string;
  auth_required?: boolean;
  error_behavior?: string;
  feature_refs: string[];
  workflow_refs: string[];
  data_refs: string[];
}

export interface IntegrationEntity {
  integration_id: string;
  service_name: string;
  purpose: string;
  data_in?: string;
  data_out?: string;
  triggers?: string[];
  secrets_handling?: string;
}

export interface UnknownEntity {
  unknown_id: string;
  area: string;
  summary: string;
  impact: "low" | "medium" | "high";
  blocking: boolean;
  needs: string;
  refs: string[];
}

export interface CanonicalSpec {
  meta: CanonicalSpecMeta;
  routing: Record<string, string>;
  constraints: {
    stack_constraints: unknown;
    security_constraints: unknown;
    quality_constraints: unknown;
    design_constraints?: unknown;
    fixed_vs_configurable: Record<string, "fixed" | "configurable">;
  };
  entities: {
    roles: RoleEntity[];
    features: FeatureEntity[];
    workflows: WorkflowEntity[];
    permissions: PermissionEntity[];
    screens?: ScreenEntity[];
    data_objects?: DataObjectEntity[];
    operations?: OperationEntity[];
    integrations?: IntegrationEntity[];
  };
  rules: {
    must_always?: string[];
    must_never?: string[];
    validation_rules?: string[];
    lifecycle_rules?: string[];
    definition_of_done: string;
    must_pass_checks?: string[];
    acceptance_criteria?: string[];
    rejection_conditions?: string;
  };
  unknowns: UnknownEntity[];
  index: {
    roles_by_id: Record<string, RoleEntity>;
    features_by_id: Record<string, FeatureEntity>;
    workflows_by_id: Record<string, WorkflowEntity>;
    cross_maps: {
      workflow_to_features: Record<string, string[]>;
      feature_to_workflows: Record<string, string[]>;
      feature_to_operations: Record<string, string[]>;
      role_to_workflows: Record<string, string[]>;
      role_to_permissions: Record<string, string[]>;
    };
  };
}

export function buildSpec(_normalizedInput: unknown, _standardsSnapshot: unknown): CanonicalSpec {
  throw new NotImplementedError("buildSpec");
}
