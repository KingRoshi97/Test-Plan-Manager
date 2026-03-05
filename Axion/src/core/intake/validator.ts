import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { isoNow } from "../../utils/time.js";
import { SubmissionSchema, NormalizedInputSchema } from "../schemas/index.js";
import type { NormalizedInputRecord } from "./normalizer.js";

export interface ValidationIssue {
  issue_id: string;
  severity: "error" | "warning";
  error_code: ValidationErrorCode;
  rule_id: string;
  field_path: string;
  message: string;
  meta?: Record<string, unknown>;
}

export type ValidationErrorCode =
  | "REQUIRED"
  | "DEPENDENCY_MISSING"
  | "MIN_ITEMS"
  | "INVALID_ENUM"
  | "INVALID_ENUM_FOR_CONTEXT"
  | "INVALID_FORMAT"
  | "INVALID_URL"
  | "INVALID_FILETYPE"
  | "INVALID_REFERENCE"
  | "DUPLICATE_VALUE"
  | "WARNING_INCOMPLETE";

export interface ValidationSummary {
  error_count: number;
  warning_count: number;
  blocking_rule_ids: string[];
}

export interface ValidationResult {
  submission_id: string;
  validated_at: string;
  is_valid: boolean;
  schema_version_used: string;
  form_version_used: string;
  ruleset_version_used: string;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: ValidationSummary;
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

function loadEnums(repoRoot: string): Record<string, { values?: string[]; values_by_category?: Record<string, string[]> }> {
  const enumPath = join(repoRoot, "libraries", "intake", "enums.v1.json");
  if (!existsSync(enumPath)) return {};
  const raw = JSON.parse(readFileSync(enumPath, "utf-8"));
  return raw.enums ?? {};
}

function loadRules(repoRoot: string): Array<Record<string, unknown>> {
  const rulesPath = join(repoRoot, "libraries", "intake", "rules.v1.json");
  if (!existsSync(rulesPath)) return [];
  const raw = JSON.parse(readFileSync(rulesPath, "utf-8"));
  return raw.rules ?? [];
}

export function validateIntake(
  submission: unknown,
  schemaVersion: string,
  repoRoot?: string
): ValidationResult {
  const sub = submission as Record<string, unknown>;
  const submissionId = String(sub.submission_id ?? "unknown");
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  let issueCounter = 0;

  const makeIssue = (
    severity: "error" | "warning",
    errorCode: ValidationErrorCode,
    ruleId: string,
    fieldPath: string,
    message: string
  ): ValidationIssue => ({
    issue_id: `VI-${String(++issueCounter).padStart(4, "0")}`,
    severity,
    error_code: errorCode,
    rule_id: ruleId,
    field_path: fieldPath,
    message,
  });

  const zodResult = NormalizedInputSchema.safeParse(submission);
  if (!zodResult.success) {
    for (const issue of zodResult.error.issues) {
      const fieldPath = issue.path.join(".");
      errors.push(
        makeIssue("error", "REQUIRED", "ZOD-SCHEMA", fieldPath, issue.message)
      );
    }
  }

  const routing = (sub.routing ?? {}) as Record<string, unknown>;
  const spec = (sub.spec ?? {}) as Record<string, unknown>;

  if (!routing.skill_level) {
    errors.push(makeIssue("error", "REQUIRED", "FIELD-REQUIRED", "routing.skill_level", "skill_level is required"));
  }
  if (!routing.category) {
    errors.push(makeIssue("error", "REQUIRED", "FIELD-REQUIRED", "routing.category", "category is required"));
  }

  const project = (sub.project ?? {}) as Record<string, unknown>;
  if (!project.project_name) {
    errors.push(makeIssue("error", "REQUIRED", "FIELD-REQUIRED", "project.project_name", "project_name is required"));
  }
  if (!project.project_overview) {
    errors.push(makeIssue("error", "REQUIRED", "FIELD-REQUIRED", "project.project_overview", "project_overview is required"));
  }

  if (!Array.isArray(spec.must_have_features) || spec.must_have_features.length === 0) {
    errors.push(makeIssue("error", "MIN_ITEMS", "FIELD-REQUIRED", "spec.must_have_features", "At least one must-have feature is required"));
  }
  if (!Array.isArray(spec.roles) || spec.roles.length === 0) {
    errors.push(makeIssue("error", "MIN_ITEMS", "FIELD-REQUIRED", "spec.roles", "At least one role is required"));
  }
  if (!Array.isArray(spec.workflows) || spec.workflows.length === 0) {
    errors.push(makeIssue("error", "MIN_ITEMS", "FIELD-REQUIRED", "spec.workflows", "At least one workflow is required"));
  }

  if (repoRoot) {
    const enums = loadEnums(repoRoot);

    if (routing.skill_level && enums.SkillLevel?.values) {
      if (!enums.SkillLevel.values.includes(String(routing.skill_level))) {
        errors.push(makeIssue("error", "INVALID_ENUM", "ENUM-CHECK", "routing.skill_level",
          `Invalid skill_level: ${routing.skill_level}. Valid: ${enums.SkillLevel.values.join(", ")}`));
      }
    }

    if (routing.category && enums.ProjectCategory?.values) {
      if (!enums.ProjectCategory.values.includes(String(routing.category))) {
        errors.push(makeIssue("error", "INVALID_ENUM", "ENUM-CHECK", "routing.category",
          `Invalid category: ${routing.category}. Valid: ${enums.ProjectCategory.values.join(", ")}`));
      }
    }

    if (routing.build_target && enums.BuildTarget?.values) {
      if (!enums.BuildTarget.values.includes(String(routing.build_target))) {
        errors.push(makeIssue("error", "INVALID_ENUM", "ENUM-CHECK", "routing.build_target",
          `Invalid build_target: ${routing.build_target}. Valid: ${enums.BuildTarget.values.join(", ")}`));
      }
    }

    if (routing.audience_context && enums.AudienceContext?.values) {
      if (!enums.AudienceContext.values.includes(String(routing.audience_context))) {
        errors.push(makeIssue("error", "INVALID_ENUM", "ENUM-CHECK", "routing.audience_context",
          `Invalid audience_context: ${routing.audience_context}. Valid: ${enums.AudienceContext.values.join(", ")}`));
      }
    }

    if (routing.category && routing.type_preset && enums.TypePreset?.values_by_category) {
      const validPresets = enums.TypePreset.values_by_category[String(routing.category)];
      if (validPresets && !validPresets.includes(String(routing.type_preset))) {
        errors.push(makeIssue("error", "INVALID_ENUM_FOR_CONTEXT", "INT3-ROUTING-01", "routing.type_preset",
          `type_preset '${routing.type_preset}' is not valid for category '${routing.category}'. Valid: ${validPresets.join(", ")}`));
      }
    }

    if (Array.isArray(spec.roles)) {
      const roleNames = spec.roles.map((r: unknown) => String((r as Record<string, unknown>).name ?? ""));
      const seen = new Set<string>();
      for (const name of roleNames) {
        if (seen.has(name)) {
          errors.push(makeIssue("error", "DUPLICATE_VALUE", "INT3-REF-01", "spec.roles",
            `Duplicate role name: ${name}`));
        }
        seen.add(name);
      }

      if (Array.isArray(spec.workflows)) {
        for (let i = 0; i < spec.workflows.length; i++) {
          const wf = spec.workflows[i] as Record<string, unknown>;
          const actorRole = String(wf.actor_role ?? "");
          if (actorRole && !roleNames.includes(actorRole)) {
            errors.push(makeIssue("error", "INVALID_REFERENCE", "INT3-REF-03", `spec.workflows[${i}].actor_role`,
              `Workflow actor_role '${actorRole}' does not match any defined role`));
          }
        }
      }
    }
  }

  const is_valid = errors.length === 0;

  const result: ValidationResult = {
    submission_id: submissionId,
    validated_at: isoNow(),
    is_valid,
    schema_version_used: schemaVersion,
    form_version_used: "1.0.0",
    ruleset_version_used: "1.0.0",
    errors,
    warnings,
    summary: {
      error_count: errors.length,
      warning_count: warnings.length,
      blocking_rule_ids: errors.map((e) => e.rule_id),
    },
  };

  return result;
}
