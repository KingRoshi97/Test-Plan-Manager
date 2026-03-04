import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";

export interface NormalizedInputRecord {
  submission_id: string;
  normalized_at: string;
  routing: RoutingSnapshot;
  project: ProjectInfo;
  spec: SpecSnapshot;
  constraints: Record<string, unknown>;
  raw_hash: string;
}

export interface RoutingSnapshot {
  skill_level: string;
  category: string;
  type_preset: string;
  build_target: string;
  audience_context: string;
}

export interface ProjectInfo {
  project_name: string;
  project_overview: string;
}

export interface SpecSnapshot {
  must_have_features: Array<{ name: string; description?: string }>;
  roles: Array<{ name: string; description?: string; primary_goal?: string }>;
  workflows: Array<{
    name: string;
    actor_role: string;
    steps: string[];
    success_outcome: string;
    failure_states?: string;
    priority?: string;
  }>;
}

function canonicalJson(obj: unknown): string {
  return JSON.stringify(sortKeys(obj));
}

function sortKeys(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(sortKeys);
  if (typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      sorted[key] = sortKeys((value as Record<string, unknown>)[key]);
    }
    return sorted;
  }
  return value;
}

function normalizeEnum(val: unknown): string {
  if (typeof val !== "string") return String(val ?? "");
  return val.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function extractRouting(raw: Record<string, unknown>): RoutingSnapshot {
  const routing = (raw.routing ?? {}) as Record<string, unknown>;
  return {
    skill_level: normalizeEnum(routing.skill_level),
    category: normalizeEnum(routing.category),
    type_preset: normalizeEnum(routing.type_preset),
    build_target: normalizeEnum(routing.build_target),
    audience_context: normalizeEnum(routing.audience_context),
  };
}

function extractProject(raw: Record<string, unknown>): ProjectInfo {
  const project = (raw.project ?? {}) as Record<string, unknown>;
  return {
    project_name: String(project.project_name ?? "").trim(),
    project_overview: String(project.project_overview ?? "").trim(),
  };
}

function extractSpec(raw: Record<string, unknown>): SpecSnapshot {
  const spec = (raw.spec ?? {}) as Record<string, unknown>;

  const mustHave = normalizeFeatureArray(spec.must_have_features);
  const roles = normalizeRoleArray(spec.roles);
  const workflows = normalizeWorkflowArray(spec.workflows);

  return {
    must_have_features: mustHave,
    roles,
    workflows,
  };
}

function normalizeFeatureArray(
  arr: unknown
): Array<{ name: string; description?: string }> {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return { name: item.trim() };
    const obj = item as Record<string, unknown>;
    const result: { name: string; description?: string } = {
      name: String(obj.name ?? "").trim(),
    };
    if (obj.description != null) {
      result.description = String(obj.description).trim();
    }
    return result;
  });
}

function normalizeRoleArray(
  arr: unknown
): Array<{ name: string; description?: string; primary_goal?: string }> {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    if (typeof item === "string") return { name: item.trim() };
    const obj = item as Record<string, unknown>;
    const result: { name: string; description?: string; primary_goal?: string } =
      {
        name: String(obj.name ?? "").trim(),
      };
    if (obj.description != null) {
      result.description = String(obj.description).trim();
    }
    if (obj.primary_goal != null) {
      result.primary_goal = String(obj.primary_goal).trim();
    }
    return result;
  });
}

function normalizeWorkflowArray(arr: unknown): SpecSnapshot["workflows"] {
  if (!Array.isArray(arr)) return [];
  return arr.map((item) => {
    const obj = item as Record<string, unknown>;
    const result: SpecSnapshot["workflows"][number] = {
      name: String(obj.name ?? "").trim(),
      actor_role: String(obj.actor_role ?? "").trim(),
      steps: Array.isArray(obj.steps)
        ? obj.steps.map((s: unknown) => String(s).trim())
        : [],
      success_outcome: String(obj.success_outcome ?? "").trim(),
    };
    if (obj.failure_states != null) {
      result.failure_states = String(obj.failure_states).trim();
    }
    if (obj.priority != null) {
      result.priority = normalizeEnum(obj.priority);
    }
    return result;
  });
}

function extractConstraints(raw: Record<string, unknown>): Record<string, unknown> {
  const constraints: Record<string, unknown> = {};

  const delivery = raw.delivery as Record<string, unknown> | undefined;
  if (delivery) {
    constraints.desired_scope = normalizeEnum(delivery.desired_scope);
    constraints.priority_bias = normalizeEnum(delivery.priority_bias);
  }

  const nfr = raw.nfr as Record<string, unknown> | undefined;
  if (nfr) {
    if (nfr.performance_targets != null)
      constraints.performance_targets = nfr.performance_targets;
    if (nfr.scale_assumptions != null)
      constraints.scale_assumptions = nfr.scale_assumptions;
    if (nfr.reliability_expectation != null)
      constraints.reliability_expectation = normalizeEnum(
        nfr.reliability_expectation
      );
    if (nfr.offline_required != null)
      constraints.offline_required = nfr.offline_required;
    if (nfr.compliance_flags != null)
      constraints.compliance_flags = (nfr.compliance_flags as unknown[]).map(
        normalizeEnum
      );
  }

  const auth = raw.auth as Record<string, unknown> | undefined;
  if (auth) {
    if (auth.required != null) constraints.auth_required = auth.required;
    if (auth.authorization_model != null)
      constraints.authorization_model = normalizeEnum(auth.authorization_model);
  }

  return sortKeys(constraints) as Record<string, unknown>;
}

export function normalizeSubmission(rawSubmission: unknown): NormalizedInputRecord {
  if (rawSubmission === null || rawSubmission === undefined || typeof rawSubmission !== "object") {
    throw new Error("normalizeSubmission: input must be a non-null object");
  }

  const raw = rawSubmission as Record<string, unknown>;

  const routing = extractRouting(raw);
  const project = extractProject(raw);
  const spec = extractSpec(raw);
  const constraints = extractConstraints(raw);

  const canonicalPayload = canonicalJson(rawSubmission);
  const rawHash = sha256(canonicalPayload);

  const submissionId = `SUB-${rawHash.slice(0, 12).toUpperCase()}`;
  const normalizedAt = isoNow();

  return {
    submission_id: submissionId,
    normalized_at: normalizedAt,
    routing,
    project,
    spec,
    constraints,
    raw_hash: rawHash,
  };
}
