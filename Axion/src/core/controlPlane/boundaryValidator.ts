import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import type { StageId } from "../../types/run.js";

export interface BoundaryValidationError {
  artifact: string;
  field: string;
  message: string;
  severity: "hard" | "soft";
}

export interface BoundaryValidationResult {
  stage_id: StageId;
  valid: boolean;
  errors: BoundaryValidationError[];
  validated_at: string;
}

type ArtifactSchema = {
  path: string;
  required_fields: string[];
  field_types?: Record<string, string>;
  ref_checks?: RefCheck[];
};

type RefCheck = {
  pointer: string;
  registry: string;
  registry_field: string;
  description: string;
};

const STAGE_ARTIFACT_SCHEMAS: Partial<Record<StageId, ArtifactSchema[]>> = {
  S1_INGEST_NORMALIZE: [
    {
      path: "intake/normalized_payload.json",
      required_fields: ["submission_id", "normalized_at", "routing", "project", "spec", "raw_hash"],
      field_types: { submission_id: "string", normalized_at: "string", routing: "object", project: "object", spec: "object", raw_hash: "string" },
    },
    {
      path: "intake/validation_result.json",
      required_fields: ["submission_id", "is_valid", "validated_at", "schema_version_used", "errors", "warnings", "summary"],
      field_types: { submission_id: "string", is_valid: "boolean", validated_at: "string", schema_version_used: "string", errors: "object", warnings: "object", summary: "object" },
    },
    {
      path: "intake/submission_record.json",
      required_fields: ["submission_id", "received_at", "schema_version", "payload_hash"],
      field_types: { submission_id: "string", received_at: "string", schema_version: "string", payload_hash: "string" },
    },
  ],
  S3_BUILD_CANONICAL: [
    {
      path: "canonical/canonical_spec.json",
      required_fields: ["meta"],
      field_types: { meta: "object" },
    },
  ],
  S5_RESOLVE_STANDARDS: [
    {
      path: "standards/resolved_standards_snapshot.json",
      required_fields: ["resolved_standards_id", "created_at", "rules", "selected_packs"],
      field_types: { resolved_standards_id: "string", created_at: "string", rules: "object", selected_packs: "object" },
    },
  ],
  S6_SELECT_TEMPLATES: [
    {
      path: "templates/selection_result.json",
      required_fields: ["run_id", "selected_templates"],
      field_types: { run_id: "string", selected_templates: "object" },
    },
  ],
  S7_RENDER_DOCS: [
    {
      path: "templates/render_report.json",
      required_fields: ["run_id"],
      field_types: { run_id: "string" },
    },
    {
      path: "templates/template_completeness_report.json",
      required_fields: ["run_id"],
      field_types: { run_id: "string" },
    },
  ],
  S8_BUILD_PLAN: [
    {
      path: "planning/work_breakdown.json",
      required_fields: ["run_id", "created_at", "tasks"],
      field_types: { run_id: "string", created_at: "string", tasks: "object" },
    },
    {
      path: "planning/acceptance_map.json",
      required_fields: ["run_id", "created_at", "entries"],
      field_types: { run_id: "string", created_at: "string", entries: "object" },
    },
    {
      path: "planning/coverage_report.json",
      required_fields: ["run_id", "generated_at", "coverage_percent", "summary"],
      field_types: { run_id: "string", generated_at: "string", coverage_percent: "number", summary: "object" },
    },
  ],
  S10_PACKAGE: [
    {
      path: "kit/packaging_manifest.json",
      required_fields: ["algorithm", "files"],
      field_types: { algorithm: "string", files: "object" },
    },
  ],
};

function resolveField(obj: unknown, field: string): { found: boolean; value: unknown } {
  if (obj === null || typeof obj !== "object") {
    return { found: false, value: undefined };
  }
  const parts = field.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || typeof current !== "object") {
      return { found: false, value: undefined };
    }
    const rec = current as Record<string, unknown>;
    if (!(part in rec)) {
      return { found: false, value: undefined };
    }
    current = rec[part];
  }
  return { found: true, value: current };
}

function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "object";
  return typeof value;
}

function validateArtifact(
  runDir: string,
  schema: ArtifactSchema,
): BoundaryValidationError[] {
  const errors: BoundaryValidationError[] = [];
  const filePath = join(runDir, schema.path);

  if (!existsSync(filePath)) {
    errors.push({
      artifact: schema.path,
      field: "",
      message: `Required artifact missing: ${schema.path}`,
      severity: "hard",
    });
    return errors;
  }

  let data: unknown;
  try {
    data = JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    errors.push({
      artifact: schema.path,
      field: "",
      message: `Artifact is not valid JSON: ${schema.path}`,
      severity: "hard",
    });
    return errors;
  }

  for (const field of schema.required_fields) {
    const { found, value } = resolveField(data, field);
    if (!found) {
      errors.push({
        artifact: schema.path,
        field,
        message: `Required field "${field}" missing in ${schema.path}`,
        severity: "hard",
      });
      continue;
    }

    if (schema.field_types && field in schema.field_types) {
      const expectedType = schema.field_types[field];
      const actualType = typeOf(value);
      if (actualType !== expectedType) {
        errors.push({
          artifact: schema.path,
          field,
          message: `Field "${field}" in ${schema.path}: expected type "${expectedType}", got "${actualType}"`,
          severity: "hard",
        });
      }
    }
  }

  return errors;
}

function checkRefIntegrity(
  runDir: string,
  baseDir: string,
  stageId: StageId,
): BoundaryValidationError[] {
  const errors: BoundaryValidationError[] = [];

  if (stageId === "S6_SELECT_TEMPLATES") {
    const selectionPath = join(runDir, "templates", "selection_result.json");
    if (existsSync(selectionPath)) {
      try {
        const selection = JSON.parse(readFileSync(selectionPath, "utf-8")) as Record<string, unknown>;
        const templates = selection.selected_templates;
        if (Array.isArray(templates)) {
          const libraryIndexPath = join(baseDir, "libraries", "templates", "template_index.json");
          if (existsSync(libraryIndexPath)) {
            const index = JSON.parse(readFileSync(libraryIndexPath, "utf-8")) as Record<string, unknown>;
            const entries = index.templates;
            if (Array.isArray(entries)) {
              const registeredIds = new Set(entries.map((e: Record<string, unknown>) => e.template_id));
              for (const tmpl of templates) {
                const t = tmpl as Record<string, unknown>;
                const tid = t.template_id as string;
                if (tid && !registeredIds.has(tid)) {
                  errors.push({
                    artifact: "templates/selection_result.json",
                    field: `selected_templates[].template_id`,
                    message: `Template ID "${tid}" not found in TEMPLATE_INDEX registry`,
                    severity: "hard",
                  });
                }
              }
            }
          }
        }
      } catch { /* handled by schema validation */ }
    }
  }

  if (stageId === "S5_RESOLVE_STANDARDS") {
    const snapshotPath = join(runDir, "standards", "resolved_standards_snapshot.json");
    if (existsSync(snapshotPath)) {
      try {
        const snapshot = JSON.parse(readFileSync(snapshotPath, "utf-8")) as Record<string, unknown>;
        const resolved = snapshot.resolved;
        if (Array.isArray(resolved)) {
          for (const item of resolved) {
            const r = item as Record<string, unknown>;
            const packId = r.pack_id as string;
            if (packId && typeof packId === "string" && packId.length === 0) {
              errors.push({
                artifact: "standards/resolved_standards_snapshot.json",
                field: "resolved[].pack_id",
                message: `Empty pack_id in resolved standards`,
                severity: "hard",
              });
            }
          }
        }
      } catch { /* handled by schema validation */ }
    }
  }

  if (stageId === "S10_PACKAGE") {
    const manifestPath = join(runDir, "kit", "packaging_manifest.json");
    if (existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf-8")) as Record<string, unknown>;
        if (manifest.algorithm !== "sha256") {
          errors.push({
            artifact: "kit/packaging_manifest.json",
            field: "algorithm",
            message: `Packaging manifest algorithm must be "sha256", got "${String(manifest.algorithm)}"`,
            severity: "hard",
          });
        }
        const files = manifest.files;
        if (Array.isArray(files)) {
          for (let i = 0; i < files.length; i++) {
            const entry = files[i] as Record<string, unknown>;
            if (typeof entry.path !== "string" || entry.path.length === 0) {
              errors.push({
                artifact: "kit/packaging_manifest.json",
                field: `files[${i}].path`,
                message: `File entry ${i} has invalid or empty path`,
                severity: "hard",
              });
            }
            if (typeof entry.sha256 !== "string" || !/^[0-9a-f]{64}$/.test(entry.sha256)) {
              errors.push({
                artifact: "kit/packaging_manifest.json",
                field: `files[${i}].sha256`,
                message: `File entry ${i} has invalid SHA-256 hash`,
                severity: "hard",
              });
            }
          }
        }
      } catch { /* handled by schema validation */ }
    }
  }

  if (stageId === "S8_BUILD_PLAN") {
    const wbPath = join(runDir, "planning", "work_breakdown.json");
    const canonPath = join(runDir, "canonical", "canonical_spec.json");
    if (existsSync(wbPath) && existsSync(canonPath)) {
      try {
        const wb = JSON.parse(readFileSync(wbPath, "utf-8")) as Record<string, unknown>;
        const items = wb.tasks ?? wb.items;
        if (Array.isArray(items)) {
          const seenTargets = new Set<string>();
          for (const item of items) {
            const w = item as Record<string, unknown>;
            const target = (w.target_ref ?? w.task_id) as string;
            if (target) {
              if (seenTargets.has(target)) {
                errors.push({
                  artifact: "planning/work_breakdown.json",
                  field: "items[].target_ref",
                  message: `Duplicate target_ref "${target}" violates 1-target-per-unit rule`,
                  severity: "hard",
                });
              }
              seenTargets.add(target);
            }
          }
        }
      } catch { /* handled by schema validation */ }
    }
  }

  return errors;
}

export function validateStageBoundary(
  runDir: string,
  baseDir: string,
  stageId: StageId,
): BoundaryValidationResult {
  const schemas = STAGE_ARTIFACT_SCHEMAS[stageId];
  const allErrors: BoundaryValidationError[] = [];

  if (schemas) {
    for (const schema of schemas) {
      const errs = validateArtifact(runDir, schema);
      allErrors.push(...errs);
    }
  }

  const refErrors = checkRefIntegrity(runDir, baseDir, stageId);
  allErrors.push(...refErrors);

  const hardErrors = allErrors.filter((e) => e.severity === "hard");

  return {
    stage_id: stageId,
    valid: hardErrors.length === 0,
    errors: allErrors,
    validated_at: new Date().toISOString(),
  };
}
