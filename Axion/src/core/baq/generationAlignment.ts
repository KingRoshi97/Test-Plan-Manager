import * as fs from "fs";
import * as path from "path";
import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
  BAQRepoFileEntry,
} from "./types.js";

export interface PreflightArtifactCheck {
  artifact_name: string;
  path: string;
  exists: boolean;
  valid_json: boolean;
  has_schema_version: boolean;
  has_run_id: boolean;
}

export interface PreflightResult {
  passed: boolean;
  checks: PreflightArtifactCheck[];
  missing: string[];
  invalid: string[];
  evaluated_at: string;
}

const REQUIRED_ARTIFACTS = [
  { name: "kit_extraction", file: "kit_extraction.json" },
  { name: "derived_build_inputs", file: "derived_build_inputs.json" },
  { name: "repo_inventory", file: "repo_inventory.json" },
  { name: "requirement_trace_map", file: "requirement_trace_map.json" },
  { name: "sufficiency_evaluation", file: "sufficiency_evaluation.json" },
];

export function runPreflightCheck(runDir: string): PreflightResult {
  const checks: PreflightArtifactCheck[] = [];
  const missing: string[] = [];
  const invalid: string[] = [];

  for (const artifact of REQUIRED_ARTIFACTS) {
    const filePath = path.join(runDir, artifact.file);
    const exists = fs.existsSync(filePath);
    let validJson = false;
    let hasSchemaVersion = false;
    let hasRunId = false;

    if (exists) {
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        validJson = true;
        hasSchemaVersion = typeof data.schema_version === "string";
        hasRunId = typeof data.run_id === "string";
        if (!hasSchemaVersion || !hasRunId) {
          invalid.push(artifact.name);
        }
      } catch {
        invalid.push(artifact.name);
      }
    } else {
      missing.push(artifact.name);
    }

    checks.push({
      artifact_name: artifact.name,
      path: filePath,
      exists,
      valid_json: validJson,
      has_schema_version: hasSchemaVersion,
      has_run_id: hasRunId,
    });
  }

  return {
    passed: missing.length === 0 && invalid.length === 0,
    checks,
    missing,
    invalid,
    evaluated_at: new Date().toISOString(),
  };
}

export interface TrackedFile {
  file_id: string;
  path: string;
  planned: boolean;
  generated: boolean;
  required: boolean;
  generation_method: "deterministic" | "ai_assisted";
  byte_count: number;
  trace_refs: string[];
  has_placeholder: boolean;
  generated_at: string | null;
}

export interface FileTracker {
  planned_files: Map<string, BAQRepoFileEntry>;
  generated_files: Map<string, TrackedFile>;
  violations: string[];
  placeholder_violations: string[];
}

export function createFileTracker(inventory: BAQRepoInventory): FileTracker {
  const planned = new Map<string, BAQRepoFileEntry>();
  for (const file of inventory.files) {
    planned.set(file.path, file);
  }
  return {
    planned_files: planned,
    generated_files: new Map(),
    violations: [],
    placeholder_violations: [],
  };
}

function detectPlaceholder(content: string): boolean {
  const placeholderPatterns = [
    /\/\/\s*TODO:\s*\[AXION\]/,
    /\{\/\*\s*TODO:\s*\[AXION\]/,
    /placeholder/i,
    /FIXME:\s*\[AXION\]/,
  ];
  return placeholderPatterns.some(p => p.test(content));
}

export function trackGeneratedFile(
  tracker: FileTracker,
  filePath: string,
  content: string,
): void {
  const planned = tracker.planned_files.get(filePath);
  const hasPlaceholder = detectPlaceholder(content);

  if (!planned) {
    tracker.violations.push(`Unplanned file generated: ${filePath}`);
    tracker.generated_files.set(filePath, {
      file_id: `unplanned-${filePath}`,
      path: filePath,
      planned: false,
      generated: true,
      required: false,
      generation_method: "ai_assisted",
      byte_count: Buffer.byteLength(content, "utf-8"),
      trace_refs: [],
      has_placeholder: hasPlaceholder,
      generated_at: new Date().toISOString(),
    });
    return;
  }

  if (hasPlaceholder && planned.required) {
    tracker.placeholder_violations.push(`Required file contains placeholders: ${filePath}`);
  }

  tracker.generated_files.set(filePath, {
    file_id: planned.file_id,
    path: filePath,
    planned: true,
    generated: true,
    required: planned.required,
    generation_method: planned.generation_method,
    byte_count: Buffer.byteLength(content, "utf-8"),
    trace_refs: planned.trace_refs,
    has_placeholder: hasPlaceholder,
    generated_at: new Date().toISOString(),
  });
}

export interface InventoryVariance {
  expected_files: number;
  produced_files: number;
  missing_files: number;
  unplanned_files: number;
  required_missing: number;
  optional_missing: number;
  placeholder_count: number;
  placeholder_in_required: number;
  trace_linked_generated: number;
  trace_linked_total: number;
}

export interface ReconciliationResult {
  total_planned: number;
  total_generated: number;
  total_missing: number;
  total_unplanned: number;
  coverage_percent: number;
  missing_files: string[];
  missing_required_files: string[];
  missing_optional_files: string[];
  unplanned_files: string[];
  violations: string[];
  placeholder_violations: string[];
  inventory_variance: InventoryVariance;
  passed: boolean;
  evaluated_at: string;
}

export function reconcileGeneration(tracker: FileTracker): ReconciliationResult {
  const totalPlanned = tracker.planned_files.size;
  const generatedPaths = new Set(tracker.generated_files.keys());
  const missingFiles: string[] = [];
  const missingRequiredFiles: string[] = [];
  const missingOptionalFiles: string[] = [];

  let traceLinkedTotal = 0;
  let traceLinkedGenerated = 0;

  for (const [filePath, entry] of tracker.planned_files) {
    const hasTraceRefs = entry.trace_refs.length > 0;
    if (hasTraceRefs) traceLinkedTotal++;

    if (!generatedPaths.has(filePath)) {
      missingFiles.push(filePath);
      if (entry.required) {
        missingRequiredFiles.push(filePath);
      } else {
        missingOptionalFiles.push(filePath);
      }
    } else {
      if (hasTraceRefs) traceLinkedGenerated++;
    }
  }

  const unplannedFiles: string[] = [];
  let placeholderCount = 0;
  let placeholderInRequired = 0;

  for (const [filePath, tracked] of tracker.generated_files) {
    if (!tracked.planned) {
      unplannedFiles.push(filePath);
    }
    if (tracked.has_placeholder) {
      placeholderCount++;
      if (tracked.required) placeholderInRequired++;
    }
  }

  let plannedGenerated = 0;
  for (const [, tracked] of tracker.generated_files) {
    if (tracked.planned) plannedGenerated++;
  }
  const totalGenerated = tracker.generated_files.size;
  const coveragePercent = totalPlanned > 0
    ? Math.min(Math.round((plannedGenerated / totalPlanned) * 10000) / 100, 100)
    : 0;

  const passed = missingRequiredFiles.length === 0
    && tracker.violations.length === 0
    && tracker.placeholder_violations.length === 0;

  const variance: InventoryVariance = {
    expected_files: totalPlanned,
    produced_files: totalGenerated,
    missing_files: missingFiles.length,
    unplanned_files: unplannedFiles.length,
    required_missing: missingRequiredFiles.length,
    optional_missing: missingOptionalFiles.length,
    placeholder_count: placeholderCount,
    placeholder_in_required: placeholderInRequired,
    trace_linked_generated: traceLinkedGenerated,
    trace_linked_total: traceLinkedTotal,
  };

  return {
    total_planned: totalPlanned,
    total_generated: totalGenerated,
    total_missing: missingFiles.length,
    total_unplanned: unplannedFiles.length,
    coverage_percent: coveragePercent,
    missing_files: missingFiles,
    missing_required_files: missingRequiredFiles,
    missing_optional_files: missingOptionalFiles,
    unplanned_files: unplannedFiles,
    violations: [...tracker.violations],
    placeholder_violations: [...tracker.placeholder_violations],
    inventory_variance: variance,
    passed,
    evaluated_at: new Date().toISOString(),
  };
}

export interface AlignmentSummary {
  preflight: PreflightResult;
  reconciliation: ReconciliationResult | null;
  overall_passed: boolean;
}

export function buildAlignmentSummary(
  preflight: PreflightResult,
  reconciliation: ReconciliationResult | null,
): AlignmentSummary {
  const overallPassed = preflight.passed && (reconciliation === null || reconciliation.passed);
  return {
    preflight,
    reconciliation,
    overall_passed: overallPassed,
  };
}
