import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { isoNow } from "../../utils/time.js";
import { CanonicalSpecSchema } from "../schemas/index.js";
import type { CanonicalSpec } from "./specBuilder.js";

export interface CanonicalValidationIssue {
  field: string;
  message: string;
  code: string;
  severity: "error" | "warning";
}

export interface CanonicalValidationReport {
  run_id: string;
  spec_id: string;
  validated_at: string;
  valid: boolean;
  issues: CanonicalValidationIssue[];
  summary: {
    error_count: number;
    warning_count: number;
  };
}

interface IdRule {
  type: string;
  prefix: string;
  pattern: string;
}

interface RefIntegrityRule {
  field: string;
  must_match_type: string;
}

function loadIdRules(repoRoot?: string): { id_types: IdRule[]; ref_integrity: { required_refs: RefIntegrityRule[] } } {
  const defaultResult = { id_types: [], ref_integrity: { required_refs: [] } };
  if (!repoRoot) return defaultResult;

  const idRulesPath = join(repoRoot, "libraries", "canonical", "CAN-02.id_rules.v1.json");
  const refIntegrityPath = join(repoRoot, "libraries", "canonical", "CAN-02.reference_integrity_rules.v1.json");

  let id_types: IdRule[] = [];
  if (existsSync(idRulesPath)) {
    const raw = JSON.parse(readFileSync(idRulesPath, "utf-8"));
    id_types = raw.id_types ?? [];
  } else {
    const legacyPath = join(repoRoot, "libraries", "canonical", "id_rules.v1.json");
    if (existsSync(legacyPath)) {
      const raw = JSON.parse(readFileSync(legacyPath, "utf-8"));
      id_types = raw.id_types ?? [];
    }
  }

  let required_refs: RefIntegrityRule[] = [];
  if (existsSync(refIntegrityPath)) {
    const raw = JSON.parse(readFileSync(refIntegrityPath, "utf-8"));
    const refFields: Array<{ field_path: string; target_type: string; required: boolean }> = raw.reference_fields ?? [];
    required_refs = refFields
      .filter((r) => r.required === true)
      .map((r) => ({ field: r.field_path, must_match_type: r.target_type }));
  } else {
    const legacyPath = join(repoRoot, "libraries", "canonical", "id_rules.v1.json");
    if (existsSync(legacyPath)) {
      const raw = JSON.parse(readFileSync(legacyPath, "utf-8"));
      required_refs = raw.ref_integrity?.required_refs ?? [];
    }
  }

  return { id_types, ref_integrity: { required_refs } };
}

function validateIdFormat(id: string, rules: IdRule[]): CanonicalValidationIssue | null {
  for (const rule of rules) {
    if (id.startsWith(rule.prefix)) {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(id)) {
        return {
          field: id,
          message: `ID "${id}" does not match pattern ${rule.pattern} for type ${rule.type}`,
          code: "ID_FORMAT_INVALID",
          severity: "error",
        };
      }
      return null;
    }
  }
  return null;
}

function validateReferenceIntegrity(spec: CanonicalSpec): CanonicalValidationIssue[] {
  const issues: CanonicalValidationIssue[] = [];
  const roleIds = new Set(spec.entities.roles.map((r) => r.role_id));

  for (const wf of spec.entities.workflows) {
    if (!roleIds.has(wf.actor_role_ref)) {
      issues.push({
        field: `entities.workflows[${wf.workflow_id}].actor_role_ref`,
        message: `Workflow "${wf.name}" references role "${wf.actor_role_ref}" which does not exist`,
        code: "REF_INTEGRITY_ROLE_MISSING",
        severity: "error",
      });
    }
  }

  for (const perm of spec.entities.permissions) {
    if (!roleIds.has(perm.role_ref)) {
      issues.push({
        field: `entities.permissions[${perm.perm_id}].role_ref`,
        message: `Permission "${perm.perm_id}" references role "${perm.role_ref}" which does not exist`,
        code: "REF_INTEGRITY_ROLE_MISSING",
        severity: "error",
      });
    }
  }

  return issues;
}

export function validateCanonicalSpec(
  spec: CanonicalSpec,
  runId: string,
  repoRoot?: string
): CanonicalValidationReport {
  const issues: CanonicalValidationIssue[] = [];
  const idRulesData = loadIdRules(repoRoot);

  const zodResult = CanonicalSpecSchema.safeParse(spec);
  if (!zodResult.success) {
    for (const err of zodResult.error.issues) {
      issues.push({
        field: err.path.join("."),
        message: err.message,
        code: "ZOD_VALIDATION_FAILED",
        severity: "error",
      });
    }
  }

  if (!spec.meta?.spec_id) {
    issues.push({
      field: "meta.spec_id",
      message: "spec_id is required",
      code: "MISSING_REQUIRED_FIELD",
      severity: "error",
    });
  }

  if (!spec.meta?.submission_id) {
    issues.push({
      field: "meta.submission_id",
      message: "submission_id is required",
      code: "MISSING_REQUIRED_FIELD",
      severity: "error",
    });
  }

  for (const role of spec.entities.roles) {
    const idIssue = validateIdFormat(role.role_id, idRulesData.id_types);
    if (idIssue) issues.push(idIssue);
  }

  for (const feat of spec.entities.features) {
    const idIssue = validateIdFormat(feat.feature_id, idRulesData.id_types);
    if (idIssue) issues.push(idIssue);
  }

  for (const wf of spec.entities.workflows) {
    const idIssue = validateIdFormat(wf.workflow_id, idRulesData.id_types);
    if (idIssue) issues.push(idIssue);
  }

  for (const perm of spec.entities.permissions) {
    const idIssue = validateIdFormat(perm.perm_id, idRulesData.id_types);
    if (idIssue) issues.push(idIssue);
  }

  const refIssues = validateReferenceIntegrity(spec);
  issues.push(...refIssues);

  if (!spec.entities.roles || spec.entities.roles.length === 0) {
    issues.push({
      field: "entities.roles",
      message: "At least one role is required",
      code: "EMPTY_REQUIRED_COLLECTION",
      severity: "error",
    });
  }

  if (!spec.entities.features || spec.entities.features.length === 0) {
    issues.push({
      field: "entities.features",
      message: "At least one feature is required",
      code: "EMPTY_REQUIRED_COLLECTION",
      severity: "error",
    });
  }

  if (!spec.entities.workflows || spec.entities.workflows.length === 0) {
    issues.push({
      field: "entities.workflows",
      message: "At least one workflow is required",
      code: "EMPTY_REQUIRED_COLLECTION",
      severity: "warning",
    });
  }

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;

  return {
    run_id: runId,
    spec_id: spec.meta?.spec_id ?? "unknown",
    validated_at: isoNow(),
    valid: errorCount === 0,
    issues,
    summary: {
      error_count: errorCount,
      warning_count: warningCount,
    },
  };
}
