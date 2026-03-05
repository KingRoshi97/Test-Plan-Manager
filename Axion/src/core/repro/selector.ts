import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, basename, relative } from "node:path";
import { sha256 } from "../../utils/hash.js";

export interface ReproSelection {
  run_id: string;
  selected_artifacts: Array<{ path: string; reason: string; hash: string }>;
  excluded_artifacts: Array<{ path: string; reason: string }>;
  total_size_bytes: number;
}

interface SelectionOptions {
  minimal?: boolean;
  include_stage_reports?: boolean;
  include_gate_reports?: boolean;
  include_proof_ledger?: boolean;
  stages?: string[];
}

const CORE_ARTIFACTS = [
  "run_manifest.json",
  "artifact_index.json",
  "canonical/canonical_spec.json",
  "standards/resolved_standards_snapshot.json",
];

const PLANNING_ARTIFACTS = [
  "planning/work_breakdown.json",
  "planning/acceptance_map.json",
  "planning/sequencing_report.json",
];

const VERIFICATION_ARTIFACTS = [
  "proof/proof_ledger.jsonl",
  "verification/completion_report.json",
];

const STATE_ARTIFACTS = [
  "state/state_snapshot.json",
  "state/resume_plan.json",
];

const SENSITIVE_PATTERNS = [
  /\.env$/i,
  /secret/i,
  /credentials/i,
  /private_key/i,
];

function isSensitive(filePath: string): boolean {
  return SENSITIVE_PATTERNS.some((p) => p.test(filePath));
}

function collectFiles(dir: string, base: string = ""): Array<{ relativePath: string; absolutePath: string; size: number }> {
  const results: Array<{ relativePath: string; absolutePath: string; size: number }> = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = base ? `${base}/${entry}` : entry;
    const stat = statSync(abs);
    if (stat.isDirectory()) {
      results.push(...collectFiles(abs, rel));
    } else {
      results.push({ relativePath: rel, absolutePath: abs, size: stat.size });
    }
  }
  return results;
}

function hashFile(filePath: string): string {
  const content = readFileSync(filePath, "utf-8");
  return sha256(content);
}

function extractRunId(runDir: string): string {
  const manifestPath = join(runDir, "run_manifest.json");
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      if (manifest.run_id) return manifest.run_id;
    } catch {
    }
  }
  return basename(runDir);
}

function isRelevantForMinimal(relPath: string, options: SelectionOptions): boolean {
  if (CORE_ARTIFACTS.includes(relPath)) return true;

  if (options.include_stage_reports !== false && relPath.startsWith("stage_reports/")) return true;
  if (options.include_gate_reports !== false && relPath.startsWith("gates/")) return true;
  if (options.include_proof_ledger !== false && VERIFICATION_ARTIFACTS.includes(relPath)) return true;

  if (options.stages && options.stages.length > 0) {
    for (const stage of options.stages) {
      if (relPath.includes(stage)) return true;
    }
  }

  return false;
}

function isRelevantForFull(relPath: string): boolean {
  if (isSensitive(relPath)) return false;
  return true;
}

export function selectReproArtifacts(runDir: string, options?: SelectionOptions): ReproSelection {
  if (!existsSync(runDir)) {
    throw new Error(`ERR-REPRO-001: Run directory does not exist: ${runDir}`);
  }

  const resolvedOptions: SelectionOptions = {
    minimal: true,
    include_stage_reports: true,
    include_gate_reports: true,
    include_proof_ledger: true,
    ...options,
  };

  const runId = extractRunId(runDir);
  const allFiles = collectFiles(runDir);
  const selected: ReproSelection["selected_artifacts"] = [];
  const excluded: ReproSelection["excluded_artifacts"] = [];
  let totalSize = 0;

  for (const file of allFiles) {
    if (isSensitive(file.relativePath)) {
      excluded.push({ path: file.relativePath, reason: "sensitive_content" });
      continue;
    }

    const isMinimalMode = resolvedOptions.minimal !== false;
    const relevant = isMinimalMode
      ? isRelevantForMinimal(file.relativePath, resolvedOptions)
      : isRelevantForFull(file.relativePath);

    if (relevant) {
      const hash = hashFile(file.absolutePath);
      let reason = "core_artifact";
      if (file.relativePath.startsWith("stage_reports/")) reason = "stage_report";
      else if (file.relativePath.startsWith("gates/")) reason = "gate_report";
      else if (VERIFICATION_ARTIFACTS.includes(file.relativePath)) reason = "verification";
      else if (PLANNING_ARTIFACTS.includes(file.relativePath)) reason = "planning";
      else if (STATE_ARTIFACTS.includes(file.relativePath)) reason = "state";
      else if (!CORE_ARTIFACTS.includes(file.relativePath)) reason = "supplementary";

      selected.push({ path: file.relativePath, reason, hash });
      totalSize += file.size;
    } else {
      const reason = isMinimalMode ? "not_required_for_minimal_repro" : "excluded_by_filter";
      excluded.push({ path: file.relativePath, reason });
    }
  }

  return {
    run_id: runId,
    selected_artifacts: selected,
    excluded_artifacts: excluded,
    total_size_bytes: totalSize,
  };
}
