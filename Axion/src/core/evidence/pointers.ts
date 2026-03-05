import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "../../utils/hash.js";

export interface PointerRef {
  path: string;
  expected_hash?: string;
}

export interface PointerResult {
  path: string;
  exists: boolean;
  hash_match: boolean | null;
  actual_hash?: string;
  error?: string;
}

export interface PointerValidationReport {
  run_id: string;
  validated_at: string;
  total: number;
  resolved: number;
  failed: number;
  pass: boolean;
  results: PointerResult[];
}

export function resolvePointer(runDir: string, ref: PointerRef): PointerResult {
  const fullPath = join(runDir, ref.path);

  if (!existsSync(fullPath)) {
    return {
      path: ref.path,
      exists: false,
      hash_match: null,
      error: "file not found",
    };
  }

  let content: string;
  try {
    content = readFileSync(fullPath, "utf-8");
  } catch {
    return {
      path: ref.path,
      exists: true,
      hash_match: null,
      error: "file unreadable",
    };
  }

  const actualHash = sha256(content);

  if (ref.expected_hash) {
    const match = actualHash === ref.expected_hash;
    return {
      path: ref.path,
      exists: true,
      hash_match: match,
      actual_hash: actualHash,
      error: match ? undefined : "hash mismatch",
    };
  }

  return {
    path: ref.path,
    exists: true,
    hash_match: null,
    actual_hash: actualHash,
  };
}

export function validatePointers(
  runDir: string,
  pointers: PointerRef[],
  runId: string,
  validatedAt: string,
): PointerValidationReport {
  const results = pointers.map((p) => resolvePointer(runDir, p));
  const resolved = results.filter((r) => r.exists && r.error === undefined).length;
  const failed = results.filter((r) => !r.exists || r.error !== undefined).length;

  return {
    run_id: runId,
    validated_at: validatedAt,
    total: pointers.length,
    resolved,
    failed,
    pass: failed === 0,
    results,
  };
}

export function collectRunPointers(runDir: string): PointerRef[] {
  const pointers: PointerRef[] = [];
  const criticalFiles = [
    "intake/submission.json",
    "intake/normalized_input.json",
    "intake/validation_result.json",
    "canonical/canonical_spec.json",
    "standards/resolved_standards_snapshot.json",
    "templates/selection_result.json",
    "planning/work_breakdown.json",
    "planning/acceptance_map.json",
    "planning/coverage_report.json",
  ];

  for (const file of criticalFiles) {
    pointers.push({ path: file });
  }

  return pointers;
}
