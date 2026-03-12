import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQBuildQualityReport,
  BAQGenerationFailureReport,
  BAQSectionStatus,
  BAQSeverity,
  BAQApplicabilityStatus,
  GenerationFailureClass,
  BuildQualityGateId,
  BAQRunStatus,
} from "./types.js";

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: "error" | "warning";
}

const VALID_SECTION_STATUSES: BAQSectionStatus[] = ["consumed", "deferred", "not_applicable", "invalid", "missing"];
const VALID_SEVERITIES: BAQSeverity[] = ["info", "warning", "error", "critical"];
const VALID_APPLICABILITY: BAQApplicabilityStatus[] = ["required", "recommended", "optional", "not_applicable"];
const VALID_RUN_STATUSES: BAQRunStatus[] = [
  "not_started", "extraction_in_progress", "extraction_complete",
  "derivation_in_progress", "derivation_complete", "inventory_planned",
  "traceability_mapped", "sufficiency_evaluated", "generation_in_progress",
  "generation_complete", "verification_in_progress", "verification_complete",
  "packaging_in_progress", "packaging_complete", "failed",
];
const VALID_GATE_IDS: BuildQualityGateId[] = ["G-BQ-01", "G-BQ-02", "G-BQ-03", "G-BQ-04", "G-BQ-05", "G-BQ-06", "G-BQ-07"];
const VALID_FAILURE_CLASSES: GenerationFailureClass[] = [
  "extraction_failure", "planning_failure", "inventory_failure",
  "traceability_failure", "generation_failure", "placeholder_fulfillment_failure",
  "verification_failure", "packaging_failure",
];

function requireField(obj: Record<string, unknown>, field: string, errors: ValidationError[]): boolean {
  if (obj[field] === undefined || obj[field] === null) {
    errors.push({ field, message: `Required field '${field}' is missing`, severity: "error" });
    return false;
  }
  return true;
}

function requireString(obj: Record<string, unknown>, field: string, errors: ValidationError[]): boolean {
  if (!requireField(obj, field, errors)) return false;
  if (typeof obj[field] !== "string") {
    errors.push({ field, message: `Field '${field}' must be a string`, severity: "error" });
    return false;
  }
  return true;
}

function requireArray(obj: Record<string, unknown>, field: string, errors: ValidationError[]): boolean {
  if (!requireField(obj, field, errors)) return false;
  if (!Array.isArray(obj[field])) {
    errors.push({ field, message: `Field '${field}' must be an array`, severity: "error" });
    return false;
  }
  return true;
}

function requireEnum<T extends string>(obj: Record<string, unknown>, field: string, validValues: T[], errors: ValidationError[]): boolean {
  if (!requireString(obj, field, errors)) return false;
  if (!validValues.includes(obj[field] as T)) {
    errors.push({ field, message: `Field '${field}' must be one of: ${validValues.join(", ")}`, severity: "error" });
    return false;
  }
  return true;
}

export function validateKitExtraction(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const obj = data as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: [{ field: "root", message: "Data must be an object", severity: "error" }], warnings };
  }

  requireString(obj, "extraction_id", errors);
  requireString(obj, "run_id", errors);
  requireString(obj, "kit_ref", errors);
  requireString(obj, "kit_version", errors);
  requireEnum(obj, "status", VALID_RUN_STATUSES, errors);
  requireArray(obj, "sections", errors);
  requireArray(obj, "critical_obligations", errors);
  requireArray(obj, "warnings", errors);

  if (Array.isArray(obj.sections)) {
    for (let i = 0; i < (obj.sections as unknown[]).length; i++) {
      const section = (obj.sections as Record<string, unknown>[])[i];
      if (!section || typeof section !== "object") {
        errors.push({ field: `sections[${i}]`, message: "Section must be an object", severity: "error" });
        continue;
      }
      requireString(section, "section_id", errors);
      requireEnum(section, "status", VALID_SECTION_STATUSES, errors);
      requireEnum(section, "applicability", VALID_APPLICABILITY, errors);
    }
  }

  if (Array.isArray(obj.critical_obligations)) {
    for (let i = 0; i < (obj.critical_obligations as unknown[]).length; i++) {
      const ob = (obj.critical_obligations as Record<string, unknown>[])[i];
      if (!ob || typeof ob !== "object") continue;
      requireString(ob, "obligation_id", errors);
      requireEnum(ob, "severity", VALID_SEVERITIES, errors);
    }
  }

  const summary = obj.summary as Record<string, unknown> | undefined;
  if (summary && typeof summary === "object") {
    validateExtractionSummaryCounts(summary, obj, errors, warnings);
  } else {
    errors.push({ field: "summary", message: "Summary object is required", severity: "error" });
  }

  requireEnum(obj, "extraction_result", ["passed", "failed", "partial"] as const, errors);
  requireEnum(obj, "gate_recommendation", ["allow", "block", "allow_with_warnings"] as const, errors);

  return { valid: errors.filter(e => e.severity === "error").length === 0, errors, warnings };
}

function validateExtractionSummaryCounts(
  summary: Record<string, unknown>,
  obj: Record<string, unknown>,
  errors: ValidationError[],
  warnings: string[],
): void {
  if (!Array.isArray(obj.sections)) return;
  const sections = obj.sections as Record<string, unknown>[];

  const actualConsumed = sections.filter(s => s.status === "consumed").length;
  const actualDeferred = sections.filter(s => s.status === "deferred").length;
  const actualNA = sections.filter(s => s.status === "not_applicable").length;
  const actualInvalid = sections.filter(s => s.status === "invalid").length;
  const actualMissing = sections.filter(s => s.status === "missing").length;
  const total = sections.length;

  if (typeof summary.total_sections === "number" && summary.total_sections !== total) {
    errors.push({ field: "summary.total_sections", message: `total_sections=${summary.total_sections} but actual section count=${total}`, severity: "error" });
  }
  if (typeof summary.consumed_count === "number" && summary.consumed_count !== actualConsumed) {
    warnings.push(`consumed_count=${summary.consumed_count} but actual=${actualConsumed}`);
  }
  if (typeof summary.deferred_count === "number" && summary.deferred_count !== actualDeferred) {
    warnings.push(`deferred_count=${summary.deferred_count} but actual=${actualDeferred}`);
  }
  if (typeof summary.not_applicable_count === "number" && summary.not_applicable_count !== actualNA) {
    warnings.push(`not_applicable_count=${summary.not_applicable_count} but actual=${actualNA}`);
  }
  if (typeof summary.invalid_count === "number" && summary.invalid_count !== actualInvalid) {
    warnings.push(`invalid_count=${summary.invalid_count} but actual=${actualInvalid}`);
  }
  if (typeof summary.missing_count === "number" && summary.missing_count !== actualMissing) {
    warnings.push(`missing_count=${summary.missing_count} but actual=${actualMissing}`);
  }

  const sumOfCounts = actualConsumed + actualDeferred + actualNA + actualInvalid + actualMissing;
  if (sumOfCounts !== total) {
    errors.push({ field: "summary", message: `Status counts sum (${sumOfCounts}) does not equal total_sections (${total})`, severity: "error" });
  }
}

export function validateDerivedBuildInputs(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const obj = data as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: [{ field: "root", message: "Data must be an object", severity: "error" }], warnings };
  }

  requireString(obj, "derivation_id", errors);
  requireString(obj, "run_id", errors);
  requireString(obj, "extraction_ref", errors);
  requireEnum(obj, "status", VALID_RUN_STATUSES, errors);
  requireArray(obj, "subsystem_map", errors);
  requireArray(obj, "feature_map", errors);
  requireField(obj, "domain_model", errors);
  requireField(obj, "storage_model", errors);
  requireField(obj, "api_surface", errors);
  requireField(obj, "auth_model", errors);
  requireArray(obj, "ui_surface_map", errors);
  requireArray(obj, "verification_obligations", errors);
  requireArray(obj, "ops_obligations", errors);
  requireArray(obj, "assumptions", errors);
  requireArray(obj, "risks", errors);

  const summary = obj.summary as Record<string, unknown> | undefined;
  if (summary && typeof summary === "object") {
    validateDerivedSummaryCounts(summary, obj, errors, warnings);
  } else {
    errors.push({ field: "summary", message: "Summary object is required", severity: "error" });
  }

  return { valid: errors.filter(e => e.severity === "error").length === 0, errors, warnings };
}

function validateDerivedSummaryCounts(
  summary: Record<string, unknown>,
  obj: Record<string, unknown>,
  errors: ValidationError[],
  warnings: string[],
): void {
  const checks: Array<[string, string]> = [
    ["subsystem_count", "subsystem_map"],
    ["feature_count", "feature_map"],
    ["page_count", "ui_surface_map"],
    ["verification_obligation_count", "verification_obligations"],
    ["ops_obligation_count", "ops_obligations"],
    ["assumption_count", "assumptions"],
    ["risk_count", "risks"],
  ];

  for (const [summaryKey, arrayKey] of checks) {
    if (typeof summary[summaryKey] === "number" && Array.isArray(obj[arrayKey])) {
      const actual = (obj[arrayKey] as unknown[]).length;
      if (summary[summaryKey] !== actual) {
        warnings.push(`${summaryKey}=${summary[summaryKey]} but actual ${arrayKey}.length=${actual}`);
      }
    }
  }

  if (typeof summary.derivation_completeness === "number") {
    const comp = summary.derivation_completeness as number;
    if (comp < 0 || comp > 100) {
      errors.push({ field: "summary.derivation_completeness", message: `derivation_completeness must be 0-100, got ${comp}`, severity: "error" });
    }
  }
}

export function validateBuildQualityReport(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const obj = data as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: [{ field: "root", message: "Data must be an object", severity: "error" }], warnings };
  }

  requireString(obj, "report_id", errors);
  requireString(obj, "run_id", errors);
  requireString(obj, "build_id", errors);
  requireEnum(obj, "status", VALID_RUN_STATUSES, errors);
  requireArray(obj, "gates", errors);

  if (Array.isArray(obj.gates)) {
    for (let i = 0; i < (obj.gates as unknown[]).length; i++) {
      const gate = (obj.gates as Record<string, unknown>[])[i];
      if (!gate || typeof gate !== "object") continue;
      requireEnum(gate, "gate_id", VALID_GATE_IDS, errors);
      requireEnum(gate, "status", ["pass", "fail", "skip"] as const, errors);
    }
  }

  const gateSummary = obj.gate_summary as Record<string, unknown> | undefined;
  if (gateSummary && typeof gateSummary === "object" && Array.isArray(obj.gates)) {
    const gates = obj.gates as Record<string, unknown>[];
    const actualPassed = gates.filter(g => g.status === "pass").length;
    const actualFailed = gates.filter(g => g.status === "fail").length;
    const actualSkipped = gates.filter(g => g.status === "skip").length;
    if (typeof gateSummary.passed === "number" && gateSummary.passed !== actualPassed) {
      warnings.push(`gate_summary.passed=${gateSummary.passed} but actual=${actualPassed}`);
    }
    if (typeof gateSummary.failed === "number" && gateSummary.failed !== actualFailed) {
      warnings.push(`gate_summary.failed=${gateSummary.failed} but actual=${actualFailed}`);
    }
    if (typeof gateSummary.skipped === "number" && gateSummary.skipped !== actualSkipped) {
      warnings.push(`gate_summary.skipped=${gateSummary.skipped} but actual=${actualSkipped}`);
    }
  }

  return { valid: errors.filter(e => e.severity === "error").length === 0, errors, warnings };
}

export function validateGenerationFailureReport(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const obj = data as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: [{ field: "root", message: "Data must be an object", severity: "error" }], warnings };
  }

  requireString(obj, "report_id", errors);
  requireString(obj, "run_id", errors);
  requireArray(obj, "failures", errors);

  if (Array.isArray(obj.failures)) {
    for (let i = 0; i < (obj.failures as unknown[]).length; i++) {
      const f = (obj.failures as Record<string, unknown>[])[i];
      if (!f || typeof f !== "object") continue;
      requireString(f, "failure_id", errors);
      requireEnum(f, "failure_class", VALID_FAILURE_CLASSES, errors);
      requireEnum(f, "severity", VALID_SEVERITIES, errors);
    }
  }

  const summary = obj.summary as Record<string, unknown> | undefined;
  if (summary && typeof summary === "object" && Array.isArray(obj.failures)) {
    const failures = obj.failures as Record<string, unknown>[];
    if (typeof summary.total_failures === "number" && summary.total_failures !== failures.length) {
      errors.push({ field: "summary.total_failures", message: `total_failures=${summary.total_failures} but actual failures.length=${failures.length}`, severity: "error" });
    }
    const resolved = failures.filter(f => f.resolved === true).length;
    if (typeof summary.resolved_count === "number" && summary.resolved_count !== resolved) {
      warnings.push(`resolved_count=${summary.resolved_count} but actual=${resolved}`);
    }
  }

  return { valid: errors.filter(e => e.severity === "error").length === 0, errors, warnings };
}

export function validateRepoInventory(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const obj = data as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: [{ field: "root", message: "Data must be an object", severity: "error" }], warnings };
  }

  requireString(obj, "inventory_id", errors);
  requireString(obj, "run_id", errors);
  requireArray(obj, "directories", errors);
  requireArray(obj, "modules", errors);
  requireArray(obj, "files", errors);

  if (Array.isArray(obj.files)) {
    const paths = new Set<string>();
    for (let i = 0; i < (obj.files as unknown[]).length; i++) {
      const f = (obj.files as Record<string, unknown>[])[i];
      if (!f || typeof f !== "object") continue;
      requireString(f, "file_id", errors);
      requireString(f, "path", errors);
      if (typeof f.path === "string") {
        if (paths.has(f.path)) {
          errors.push({ field: `files[${i}].path`, message: `Duplicate file path: ${f.path}`, severity: "error" });
        }
        paths.add(f.path);
      }
    }
  }

  return { valid: errors.filter(e => e.severity === "error").length === 0, errors, warnings };
}

export function validateRequirementTraceMap(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const obj = data as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: [{ field: "root", message: "Data must be an object", severity: "error" }], warnings };
  }

  requireString(obj, "trace_map_id", errors);
  requireString(obj, "run_id", errors);
  requireArray(obj, "traces", errors);

  if (Array.isArray(obj.traces)) {
    for (let i = 0; i < (obj.traces as unknown[]).length; i++) {
      const t = (obj.traces as Record<string, unknown>[])[i];
      if (!t || typeof t !== "object") continue;
      requireString(t, "trace_id", errors);
      requireString(t, "requirement_id", errors);
      requireEnum(t, "coverage_status", ["fully_covered", "partially_covered", "not_covered"] as const, errors);
    }
  }

  const summary = obj.summary as Record<string, unknown> | undefined;
  if (summary && typeof summary === "object" && Array.isArray(obj.traces)) {
    const traces = obj.traces as Record<string, unknown>[];
    if (typeof summary.coverage_percent === "number") {
      const pct = summary.coverage_percent as number;
      if (pct < 0 || pct > 100) {
        errors.push({ field: "summary.coverage_percent", message: `coverage_percent must be 0-100, got ${pct}`, severity: "error" });
      }
    }
    const fullyCovered = traces.filter(t => t.coverage_status === "fully_covered").length;
    if (typeof summary.fully_covered === "number" && summary.fully_covered !== fullyCovered) {
      warnings.push(`fully_covered=${summary.fully_covered} but actual=${fullyCovered}`);
    }
  }

  return { valid: errors.filter(e => e.severity === "error").length === 0, errors, warnings };
}

export function validateSufficiencyEvaluation(data: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  const obj = data as Record<string, unknown>;

  if (!obj || typeof obj !== "object") {
    return { valid: false, errors: [{ field: "root", message: "Data must be an object", severity: "error" }], warnings };
  }

  requireString(obj, "schema_version", errors);
  requireString(obj, "evaluation_id", errors);
  requireString(obj, "run_id", errors);
  requireString(obj, "inventory_ref", errors);
  requireString(obj, "trace_map_ref", errors);
  requireEnum(obj, "status", ["sufficient", "marginal", "insufficient"] as const, errors);
  requireArray(obj, "dimensions", errors);
  requireArray(obj, "gaps", errors);
  requireString(obj, "created_at", errors);
  requireString(obj, "updated_at", errors);

  if (typeof obj.overall_score === "number") {
    const score = obj.overall_score as number;
    if (score < 0 || score > 100) {
      errors.push({ field: "overall_score", message: `overall_score must be 0-100, got ${score}`, severity: "error" });
    }
  } else {
    errors.push({ field: "overall_score", message: "overall_score is required and must be a number", severity: "error" });
  }

  if (Array.isArray(obj.dimensions)) {
    for (let i = 0; i < (obj.dimensions as unknown[]).length; i++) {
      const dim = (obj.dimensions as Record<string, unknown>[])[i];
      if (!dim || typeof dim !== "object") continue;
      requireString(dim, "dimension_id", errors);
      requireString(dim, "name", errors);
      if (typeof dim.score === "number") {
        const s = dim.score as number;
        if (s < 0 || s > 100) {
          errors.push({ field: `dimensions[${i}].score`, message: `Score must be 0-100, got ${s}`, severity: "error" });
        }
      }
    }
  }

  if (Array.isArray(obj.gaps)) {
    for (let i = 0; i < (obj.gaps as unknown[]).length; i++) {
      const gap = (obj.gaps as Record<string, unknown>[])[i];
      if (!gap || typeof gap !== "object") continue;
      requireString(gap, "gap_id", errors);
      requireEnum(gap, "severity", ["critical", "warning", "info"] as const, errors);
    }
  }

  const summary = obj.summary as Record<string, unknown> | undefined;
  if (summary && typeof summary === "object") {
    if (Array.isArray(obj.dimensions)) {
      const dims = obj.dimensions as unknown[];
      if (typeof summary.total_dimensions === "number" && summary.total_dimensions !== dims.length) {
        errors.push({ field: "summary.total_dimensions", message: `total_dimensions=${summary.total_dimensions} but actual dimensions.length=${dims.length}`, severity: "error" });
      }
      const passingDims = (obj.dimensions as Record<string, unknown>[]).filter(d => d.passed === true).length;
      if (typeof summary.passing_dimensions === "number" && summary.passing_dimensions !== passingDims) {
        warnings.push(`passing_dimensions=${summary.passing_dimensions} but actual=${passingDims}`);
      }
    }
    if (Array.isArray(obj.gaps)) {
      const gapArr = obj.gaps as Record<string, unknown>[];
      if (typeof summary.total_gaps === "number" && summary.total_gaps !== gapArr.length) {
        errors.push({ field: "summary.total_gaps", message: `total_gaps=${summary.total_gaps} but actual gaps.length=${gapArr.length}`, severity: "error" });
      }
      const criticalGaps = gapArr.filter(g => g.severity === "critical").length;
      if (typeof summary.critical_gaps === "number" && summary.critical_gaps !== criticalGaps) {
        warnings.push(`critical_gaps=${summary.critical_gaps} but actual=${criticalGaps}`);
      }
    }
  } else {
    errors.push({ field: "summary", message: "Summary object is required", severity: "error" });
  }

  return { valid: errors.filter(e => e.severity === "error").length === 0, errors, warnings };
}
