import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { ENTITY_PREFIXES } from "../ids/idRules.js";
import type { NormalizedInputRecord, RoutingSnapshot, SpecSnapshot } from "../intake/normalizer.js";

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

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}

function makeEntityId(prefix: string, name: string, index: number): string {
  const slug = makeSlug(name);
  const padded = String(index + 1).padStart(3, "0");
  return `${prefix}${slug}_${padded}`;
}

function buildRoles(spec: SpecSnapshot): RoleEntity[] {
  return spec.roles.map((r, i) => {
    const role: RoleEntity = {
      role_id: makeEntityId(ENTITY_PREFIXES.role, r.name, i),
      name: r.name,
    };
    if (r.description) role.description = r.description;
    if (r.primary_goal) role.primary_goal = r.primary_goal;
    return role;
  });
}

function buildFeatures(spec: SpecSnapshot): FeatureEntity[] {
  return spec.must_have_features.map((f, i) => {
    const feature: FeatureEntity = {
      feature_id: makeEntityId(ENTITY_PREFIXES.feature, f.name, i),
      name: f.name,
      priority_tier: "must",
      priority_rank: i + 1,
    };
    if (f.description) feature.description = f.description;
    return feature;
  });
}

function buildWorkflows(spec: SpecSnapshot, roles: RoleEntity[]): WorkflowEntity[] {
  const roleNameToId: Record<string, string> = {};
  for (const r of roles) {
    roleNameToId[r.name.toLowerCase()] = r.role_id;
  }

  return spec.workflows.map((w, i) => {
    const actorKey = w.actor_role.toLowerCase();
    const actorRef = roleNameToId[actorKey] ?? w.actor_role;

    const wf: WorkflowEntity = {
      workflow_id: makeEntityId(ENTITY_PREFIXES.workflow, w.name, i),
      name: w.name,
      actor_role_ref: actorRef,
      steps: w.steps,
      success_outcome: w.success_outcome,
    };
    if (w.failure_states) wf.failure_states = w.failure_states;
    if (w.priority) wf.priority = w.priority;
    return wf;
  });
}

function buildPermissions(roles: RoleEntity[]): PermissionEntity[] {
  return roles.map((r, i) => ({
    perm_id: makeEntityId(ENTITY_PREFIXES.permission, r.name, i),
    role_ref: r.role_id,
    allowed_capabilities: ["read", "write"],
  }));
}

function buildConstraints(normalized: NormalizedInputRecord): CanonicalSpec["constraints"] {
  const c = normalized.constraints || {};

  const stackConstraints: Record<string, unknown> = {};
  if (normalized.routing.build_target) stackConstraints.build_target = normalized.routing.build_target;
  if (normalized.routing.type_preset) stackConstraints.type_preset = normalized.routing.type_preset;

  const securityConstraints: Record<string, unknown> = {};
  if (c.auth_required != null) securityConstraints.auth_required = c.auth_required;
  if (c.authorization_model) securityConstraints.authorization_model = c.authorization_model;
  if (c.compliance_flags) securityConstraints.compliance_flags = c.compliance_flags;

  const qualityConstraints: Record<string, unknown> = {};
  if (c.performance_targets) qualityConstraints.performance_targets = c.performance_targets;
  if (c.scale_assumptions) qualityConstraints.scale_assumptions = c.scale_assumptions;
  if (c.reliability_expectation) qualityConstraints.reliability_expectation = c.reliability_expectation;

  const fixedVsConfigurable: Record<string, "fixed" | "configurable"> = {};
  if (normalized.routing.build_target) fixedVsConfigurable["build_target"] = "fixed";
  if (normalized.routing.category) fixedVsConfigurable["category"] = "fixed";
  if (c.desired_scope) fixedVsConfigurable["desired_scope"] = "configurable";
  if (c.priority_bias) fixedVsConfigurable["priority_bias"] = "configurable";

  return {
    stack_constraints: stackConstraints,
    security_constraints: securityConstraints,
    quality_constraints: qualityConstraints,
    fixed_vs_configurable: fixedVsConfigurable,
  };
}

function buildCrossMaps(
  roles: RoleEntity[],
  features: FeatureEntity[],
  workflows: WorkflowEntity[],
  permissions: PermissionEntity[]
): CanonicalSpec["index"]["cross_maps"] {
  const workflow_to_features: Record<string, string[]> = {};
  const feature_to_workflows: Record<string, string[]> = {};
  const feature_to_operations: Record<string, string[]> = {};
  const role_to_workflows: Record<string, string[]> = {};
  const role_to_permissions: Record<string, string[]> = {};

  for (const wf of workflows) {
    workflow_to_features[wf.workflow_id] = features.map((f) => f.feature_id);
    if (!role_to_workflows[wf.actor_role_ref]) {
      role_to_workflows[wf.actor_role_ref] = [];
    }
    role_to_workflows[wf.actor_role_ref].push(wf.workflow_id);
  }

  for (const f of features) {
    feature_to_workflows[f.feature_id] = workflows.map((w) => w.workflow_id);
    feature_to_operations[f.feature_id] = [];
  }

  for (const p of permissions) {
    if (!role_to_permissions[p.role_ref]) {
      role_to_permissions[p.role_ref] = [];
    }
    role_to_permissions[p.role_ref].push(p.perm_id);
  }

  return {
    workflow_to_features,
    feature_to_workflows,
    feature_to_operations,
    role_to_workflows,
    role_to_permissions,
  };
}

export function buildSpec(normalizedInput: unknown, standardsSnapshot: unknown): CanonicalSpec {
  const normalized = normalizedInput as NormalizedInputRecord;
  const standards = (standardsSnapshot ?? {}) as Record<string, any>;

  const roles = buildRoles(normalized.spec);
  const features = buildFeatures(normalized.spec);
  const workflows = buildWorkflows(normalized.spec, roles);
  const permissions = buildPermissions(roles);

  const specContent = JSON.stringify({ normalized, standards });
  const specHash = sha256(specContent).slice(0, 12).toUpperCase();

  const standardsSnapshotId = String(standards.snapshot_id ?? standards.run_id ?? "STD-NONE");
  const standardsVersion = String(standards.resolver?.version ?? standards.version ?? "0.0.0");

  const meta: CanonicalSpecMeta = {
    spec_id: `SPEC-${specHash}`,
    submission_id: normalized.submission_id,
    schema_version_used: "1.0.0",
    standards_snapshot_id: standardsSnapshotId,
    standards_version_used: standardsVersion,
    spec_version: "1.0.0",
    created_at: isoNow(),
  };

  const constraints = buildConstraints(normalized);

  const roles_by_id: Record<string, RoleEntity> = {};
  for (const r of roles) roles_by_id[r.role_id] = r;

  const features_by_id: Record<string, FeatureEntity> = {};
  for (const f of features) features_by_id[f.feature_id] = f;

  const workflows_by_id: Record<string, WorkflowEntity> = {};
  for (const w of workflows) workflows_by_id[w.workflow_id] = w;

  const crossMaps = buildCrossMaps(roles, features, workflows, permissions);

  return {
    meta,
    routing: normalized.routing as unknown as Record<string, string>,
    constraints,
    entities: {
      roles,
      features,
      workflows,
      permissions,
    },
    rules: {
      definition_of_done: "All must-have features implemented with passing acceptance criteria",
      must_always: ["Validate all inputs", "Enforce authentication where required"],
      must_never: ["Expose internal errors to end users", "Skip required validations"],
    },
    unknowns: [],
    index: {
      roles_by_id,
      features_by_id,
      workflows_by_id,
      cross_maps: crossMaps,
    },
  };
}
