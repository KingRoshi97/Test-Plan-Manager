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
  const rawFunctional = (raw.functional ?? {}) as Record<string, unknown>;
  const rawAuth = (raw.auth ?? {}) as Record<string, unknown>;

  function parseFeatureString(s: string): { name: string; description: string } {
    const separatorIdx = Math.min(
      ...[s.indexOf(". "), s.indexOf(": "), s.indexOf(" - ")].filter((i) => i >= 0).concat([s.length])
    );
    if (separatorIdx < s.length) {
      const sep = s[separatorIdx] === " " ? 3 : (s[separatorIdx] === "." ? 2 : 2);
      return {
        name: s.slice(0, separatorIdx).trim(),
        description: s.slice(separatorIdx + (sep === 3 ? 3 : sep === 2 ? 2 : 1)).trim() || s.trim(),
      };
    }
    return { name: s.trim(), description: s.trim() };
  }

  function parseFeatureItem(f: unknown): { name: string; description?: string } {
    if (typeof f === "string") {
      const parsed = parseFeatureString(f);
      return { name: parsed.name, description: parsed.description };
    }
    const feat = f as Record<string, unknown>;
    return {
      name: String(feat.name ?? ""),
      ...(feat.description ? { description: String(feat.description) } : {}),
    };
  }

  let mustHaveFeatures: Array<{ name: string; description?: string }>;
  if (Array.isArray(rawSpec.must_have_features) && rawSpec.must_have_features.length > 0) {
    mustHaveFeatures = rawSpec.must_have_features.map(parseFeatureItem);
  } else if (Array.isArray(rawFunctional.must_have_features) && rawFunctional.must_have_features.length > 0) {
    mustHaveFeatures = rawFunctional.must_have_features.map(parseFeatureItem);
  } else {
    mustHaveFeatures = [{ name: "Core Feature", description: "Default feature placeholder" }];
  }

  function parseRoleItem(r: unknown): { name: string; description?: string; primary_goal?: string } {
    if (typeof r === "string") {
      return { name: r.trim(), description: r.trim() };
    }
    const role = r as Record<string, unknown>;
    const name = String(role.name ?? "");
    const desc = role.description ? String(role.description) : (role.permissions ? String(role.permissions) : undefined);
    return {
      name,
      ...(desc ? { description: desc } : {}),
      ...(role.primary_goal ? { primary_goal: String(role.primary_goal) } : {}),
    };
  }

  let roles: Array<{ name: string; description?: string; primary_goal?: string }>;
  if (Array.isArray(rawSpec.roles) && rawSpec.roles.length > 0) {
    roles = rawSpec.roles.map(parseRoleItem);
  } else if (Array.isArray(rawFunctional.roles) && (rawFunctional.roles as unknown[]).length > 0) {
    roles = (rawFunctional.roles as unknown[]).map(parseRoleItem);
  } else if (rawAuth.authorization_model && typeof rawAuth.authorization_model === "string" && rawAuth.authorization_model.trim()) {
    const authModel = rawAuth.authorization_model as string;
    const roleMatches = authModel.match(/\b(?:admin|administrator|moderator|editor|viewer|manager|owner|member|operator|analyst|reviewer|supervisor|contributor)\b/gi);
    if (roleMatches && roleMatches.length > 0) {
      const uniqueRoles = [...new Set(roleMatches.map((r: string) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase()))];
      roles = uniqueRoles.map((name: string) => ({ name, description: `${name} role extracted from authorization model` }));
      if (!roles.some((r) => r.name.toLowerCase() === "user")) {
        roles.unshift({ name: "User", description: "Default user role" });
      }
    } else {
      roles = [{ name: "User", description: "Default user role" }];
    }
  } else {
    roles = [{ name: "User", description: "Default user role" }];
  }

  function parseWorkflowsFromText(text: string, actorRole: string): SpecSnapshot["workflows"] {
    const lines = text.split(/\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) return [];
    const workflows: SpecSnapshot["workflows"] = [];
    let currentWorkflow: { name: string; steps: string[] } | null = null;
    for (const line of lines) {
      const headerMatch = line.match(/^(?:\d+[\.\)]\s*)?(?:[-*]\s*)?(.+?)(?:\s*[:]\s*(.*))?$/);
      if (headerMatch && !line.match(/^\s*[-*]\s/) && !line.match(/^\s+/)) {
        if (currentWorkflow && currentWorkflow.steps.length > 0) {
          workflows.push({
            name: currentWorkflow.name,
            actor_role: actorRole,
            steps: currentWorkflow.steps,
            success_outcome: `${currentWorkflow.name} completes successfully`,
          });
        }
        currentWorkflow = { name: headerMatch[1].trim(), steps: [] };
        if (headerMatch[2]) {
          currentWorkflow.steps.push(headerMatch[2].trim());
        }
      } else if (currentWorkflow) {
        currentWorkflow.steps.push(line.replace(/^[-*]\s*/, "").replace(/^\d+[\.\)]\s*/, ""));
      } else {
        workflows.push({
          name: line.replace(/^[-*]\s*/, "").replace(/^\d+[\.\)]\s*/, ""),
          actor_role: actorRole,
          steps: [line],
          success_outcome: `${line} completes successfully`,
        });
      }
    }
    if (currentWorkflow && currentWorkflow.steps.length > 0) {
      workflows.push({
        name: currentWorkflow.name,
        actor_role: actorRole,
        steps: currentWorkflow.steps,
        success_outcome: `${currentWorkflow.name} completes successfully`,
      });
    }
    return workflows;
  }

  let workflows: SpecSnapshot["workflows"];
  if (Array.isArray(rawSpec.workflows) && rawSpec.workflows.length > 0) {
    workflows = rawSpec.workflows.map((w: unknown) => {
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
    });
  } else if (typeof rawFunctional.core_workflows === "string" && rawFunctional.core_workflows.trim()) {
    workflows = parseWorkflowsFromText(rawFunctional.core_workflows as string, roles[0]?.name ?? "User");
  } else if (Array.isArray(rawFunctional.core_workflows) && (rawFunctional.core_workflows as unknown[]).length > 0) {
    workflows = (rawFunctional.core_workflows as unknown[]).map((w: unknown) => {
      if (typeof w === "string") {
        return {
          name: w.trim(),
          actor_role: roles[0]?.name ?? "User",
          steps: [w.trim()],
          success_outcome: `${w.trim()} completes successfully`,
        };
      }
      const wf = w as Record<string, unknown>;
      return {
        name: String(wf.name ?? ""),
        actor_role: String(wf.actor_role ?? roles[0]?.name ?? "User"),
        steps: Array.isArray(wf.steps) ? wf.steps.map(String) : [],
        success_outcome: String(wf.success_outcome ?? ""),
      };
    });
  } else {
    workflows = [
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
  }

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
