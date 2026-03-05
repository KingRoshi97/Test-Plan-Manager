import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { isoNow } from "../../utils/time.js";
import type { NormalizedInputRecord, SpecSnapshot, RoutingSnapshot } from "../intake/normalizer.js";

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

interface IdRule {
  type: string;
  prefix: string;
  pattern: string;
}

function loadIdRules(repoRoot?: string): IdRule[] {
  if (!repoRoot) return [];
  const rulesPath = join(repoRoot, "libraries", "canonical", "id_rules.v1.json");
  if (!existsSync(rulesPath)) return [];
  const raw = JSON.parse(readFileSync(rulesPath, "utf-8"));
  return raw.id_types ?? [];
}

function generateId(prefix: string, index: number): string {
  return `${prefix}${String(index + 1).padStart(3, "0")}`;
}

function buildRoles(spec: SpecSnapshot): RoleEntity[] {
  return spec.roles.map((r, i) => ({
    role_id: generateId("ROLE-", i),
    name: r.name,
    ...(r.description ? { description: r.description } : {}),
    ...(r.primary_goal ? { primary_goal: r.primary_goal } : {}),
  }));
}

function buildFeatures(spec: SpecSnapshot): FeatureEntity[] {
  return spec.must_have_features.map((f, i) => ({
    feature_id: generateId("FEAT-", i),
    name: f.name,
    ...(f.description ? { description: f.description } : {}),
    priority_tier: "must" as const,
    priority_rank: i + 1,
  }));
}

function buildWorkflows(spec: SpecSnapshot, roles: RoleEntity[]): WorkflowEntity[] {
  return spec.workflows.map((w, i) => {
    const matchedRole = roles.find(
      (r) => r.name.toLowerCase() === w.actor_role.toLowerCase()
    );
    const entry: WorkflowEntity = {
      workflow_id: generateId("WF-", i),
      name: w.name,
      actor_role_ref: matchedRole?.role_id ?? roles[0]?.role_id ?? "ROLE-001",
      steps: w.steps,
      success_outcome: w.success_outcome,
    };
    if (w.failure_states) entry.failure_states = w.failure_states;
    if (w.priority) entry.priority = w.priority;
    return entry;
  });
}

function buildPermissions(roles: RoleEntity[]): PermissionEntity[] {
  return roles.map((r, i) => ({
    perm_id: generateId("PERM-", i),
    role_ref: r.role_id,
    allowed_capabilities: r.primary_goal
      ? [r.primary_goal]
      : ["default_access"],
  }));
}

function buildIndex(
  roles: RoleEntity[],
  features: FeatureEntity[],
  workflows: WorkflowEntity[],
  permissions: PermissionEntity[]
): CanonicalSpec["index"] {
  const roles_by_id: Record<string, RoleEntity> = {};
  for (const r of roles) roles_by_id[r.role_id] = r;

  const features_by_id: Record<string, FeatureEntity> = {};
  for (const f of features) features_by_id[f.feature_id] = f;

  const workflows_by_id: Record<string, WorkflowEntity> = {};
  for (const w of workflows) workflows_by_id[w.workflow_id] = w;

  const role_to_workflows: Record<string, string[]> = {};
  const workflow_to_features: Record<string, string[]> = {};
  const feature_to_workflows: Record<string, string[]> = {};
  const role_to_permissions: Record<string, string[]> = {};

  for (const w of workflows) {
    if (!role_to_workflows[w.actor_role_ref]) {
      role_to_workflows[w.actor_role_ref] = [];
    }
    role_to_workflows[w.actor_role_ref].push(w.workflow_id);
    workflow_to_features[w.workflow_id] = [];
  }

  for (const f of features) {
    feature_to_workflows[f.feature_id] = [];
  }

  for (const p of permissions) {
    if (!role_to_permissions[p.role_ref]) {
      role_to_permissions[p.role_ref] = [];
    }
    role_to_permissions[p.role_ref].push(p.perm_id);
  }

  return {
    roles_by_id,
    features_by_id,
    workflows_by_id,
    cross_maps: {
      workflow_to_features,
      feature_to_workflows,
      feature_to_operations: {},
      role_to_workflows,
      role_to_permissions,
    },
  };
}

export function buildSpec(normalizedInput: unknown, _standardsSnapshot: unknown, repoRoot?: string): CanonicalSpec {
  const input = normalizedInput as NormalizedInputRecord;

  const roles = buildRoles(input.spec);
  const features = buildFeatures(input.spec);
  const workflows = buildWorkflows(input.spec, roles);
  const permissions = buildPermissions(roles);
  const index = buildIndex(roles, features, workflows, permissions);

  const routing: Record<string, string> = {
    skill_level: input.routing.skill_level,
    category: input.routing.category,
    type_preset: input.routing.type_preset,
    build_target: input.routing.build_target,
    audience_context: input.routing.audience_context,
  };

  const constraints: CanonicalSpec["constraints"] = {
    stack_constraints: (input.constraints as Record<string, unknown>).stack ?? {},
    security_constraints: (input.constraints as Record<string, unknown>).security ?? {},
    quality_constraints: (input.constraints as Record<string, unknown>).quality ?? {},
    design_constraints: (input.constraints as Record<string, unknown>).design ?? {},
    fixed_vs_configurable: {},
  };

  const rules: CanonicalSpec["rules"] = {
    definition_of_done: "All features implemented, all acceptance criteria met, all gates passed",
    must_always: ["Follow coding standards", "Write tests for new features"],
    must_never: ["Skip security checks", "Deploy without gate approval"],
    must_pass_checks: ["G1_INTAKE_VALIDITY", "G2_CANONICAL_INTEGRITY"],
    acceptance_criteria: features.map(
      (f) => `${f.feature_id}: ${f.name} is functional and tested`
    ),
  };

  const meta: CanonicalSpecMeta = {
    spec_id: `SPEC-${input.submission_id}`,
    submission_id: input.submission_id,
    schema_version_used: "1.0.0",
    standards_snapshot_id: "STD-SNAP-pending",
    standards_version_used: "1.0.0",
    spec_version: "1.0.0",
    created_at: isoNow(),
  };

  return {
    meta,
    routing,
    constraints,
    entities: {
      roles,
      features,
      workflows,
      permissions,
    },
    rules,
    unknowns: [],
    index,
  };
}
