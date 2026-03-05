import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { deepSortKeys, canonicalJsonString } from "../../utils/canonicalJson.js";

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

function loadEnums(repoRoot: string): Record<string, { values?: string[]; values_by_category?: Record<string, string[]> }> {
  const enumPath = join(repoRoot, "libraries", "intake", "enums.v1.json");
  if (!existsSync(enumPath)) {
    return {};
  }
  const raw = JSON.parse(readFileSync(enumPath, "utf-8"));
  return raw.enums ?? {};
}

function normalizeEnumValue(value: string, enumDef: { values?: string[] }): string {
  if (!enumDef.values) return value;
  const lower = value.toLowerCase().trim();
  const match = enumDef.values.find((v: string) => v.toLowerCase() === lower);
  return match ?? value;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function normalizeSubmission(rawSubmission: unknown, repoRoot?: string): NormalizedInputRecord {
  const raw = rawSubmission as Record<string, unknown>;
  const rawHash = sha256(canonicalJsonString(raw));
  const enums = repoRoot ? loadEnums(repoRoot) : {};

  const rawRouting = (raw.routing ?? {}) as Record<string, unknown>;
  const routing: RoutingSnapshot = {
    skill_level: normalizeEnumValue(
      String(rawRouting.skill_level ?? "beginner"),
      enums.SkillLevel ?? {}
    ),
    category: normalizeEnumValue(
      String(rawRouting.category ?? "application"),
      enums.ProjectCategory ?? {}
    ),
    type_preset: String(rawRouting.type_preset ?? "web_app"),
    build_target: normalizeEnumValue(
      String(rawRouting.build_target ?? "new"),
      enums.BuildTarget ?? {}
    ),
    audience_context: normalizeEnumValue(
      String(rawRouting.audience_context ?? "internal"),
      enums.AudienceContext ?? {}
    ),
  };

  const rawProject = (raw.project ?? {}) as Record<string, unknown>;
  const project: ProjectInfo = {
    project_name: String(rawProject.project_name ?? "Untitled Project"),
    project_overview: String(rawProject.project_overview ?? "No overview provided."),
  };

  const rawSpec = (raw.spec ?? {}) as Record<string, unknown>;

  const mustHaveFeatures = Array.isArray(rawSpec.must_have_features)
    ? rawSpec.must_have_features.map((f: unknown) => {
        const feat = f as Record<string, unknown>;
        return {
          name: String(feat.name ?? ""),
          ...(feat.description ? { description: String(feat.description) } : {}),
        };
      })
    : [{ name: "Core Feature", description: "Default feature placeholder" }];

  const roles = Array.isArray(rawSpec.roles)
    ? rawSpec.roles.map((r: unknown) => {
        const role = r as Record<string, unknown>;
        return {
          name: String(role.name ?? ""),
          ...(role.description ? { description: String(role.description) } : {}),
          ...(role.primary_goal ? { primary_goal: String(role.primary_goal) } : {}),
        };
      })
    : [{ name: "User", description: "Default user role" }];

  const workflows = Array.isArray(rawSpec.workflows)
    ? rawSpec.workflows.map((w: unknown) => {
        const wf = w as Record<string, unknown>;
        const entry: SpecSnapshot["workflows"][0] = {
          name: String(wf.name ?? ""),
          actor_role: String(wf.actor_role ?? ""),
          steps: Array.isArray(wf.steps) ? wf.steps.map(String) : [],
          success_outcome: String(wf.success_outcome ?? ""),
        };
        if (wf.failure_states) entry.failure_states = String(wf.failure_states);
        if (wf.priority) {
          entry.priority = normalizeEnumValue(
            String(wf.priority),
            enums.WorkflowPriority ?? {}
          );
        }
        return entry;
      })
    : [
        {
          name: "Default Workflow",
          actor_role: roles[0]?.name ?? "User",
          steps: ["Step 1", "Step 2", "Step 3"],
          success_outcome: "Workflow completes successfully",
        },
        {
          name: "Error Handling Workflow",
          actor_role: roles[0]?.name ?? "User",
          steps: ["Encounter error", "Display error message", "Retry or cancel"],
          success_outcome: "Error is handled gracefully",
        },
        {
          name: "Setup Workflow",
          actor_role: roles[0]?.name ?? "User",
          steps: ["Configure settings", "Verify configuration", "Save"],
          success_outcome: "System is configured correctly",
        },
      ];

  const spec: SpecSnapshot = {
    must_have_features: mustHaveFeatures,
    roles,
    workflows,
  };

  const constraints: Record<string, unknown> = {};
  if (raw.constraints && typeof raw.constraints === "object") {
    Object.assign(constraints, raw.constraints);
  }
  if (raw.delivery && typeof raw.delivery === "object") {
    constraints.delivery = raw.delivery;
  }
  if (raw.nfr && typeof raw.nfr === "object") {
    constraints.nfr = raw.nfr;
  }
  if (raw.auth && typeof raw.auth === "object") {
    constraints.auth = raw.auth;
  }

  const submissionId = String(raw.submission_id ?? `SUB-${Date.now()}`);

  const normalized: NormalizedInputRecord = {
    submission_id: submissionId,
    normalized_at: isoNow(),
    routing,
    project,
    spec,
    constraints,
    raw_hash: rawHash,
  };

  return deepSortKeys(normalized) as NormalizedInputRecord;
}
