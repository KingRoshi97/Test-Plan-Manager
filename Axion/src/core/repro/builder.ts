import { join, dirname } from "node:path";
import { existsSync, readFileSync, copyFileSync } from "node:fs";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { ensureDir, writeJson } from "../../utils/fs.js";
import { deepSortKeys, canonicalJsonString } from "../../utils/canonicalJson.js";
import type { ReproSelection } from "./selector.js";
import { selectReproArtifacts } from "./selector.js";

export interface ReproPackage {
  repro_id: string;
  run_id: string;
  created_at: string;
  output_path: string;
  artifacts_included: number;
  manifest: ReproSelection;
}

export interface ReproComparisonResult {
  repro_id: string;
  source_run_id: string;
  replay_run_id: string;
  created_at: string;
  deterministic: boolean;
  matches: Array<{ path: string; sha256_source: string; sha256_replay: string }>;
  mismatches: Array<{ path: string; sha256_source: string; sha256_replay: string; diff_summary: string }>;
  missing_in_replay: string[];
  extra_in_replay: string[];
}

const TIMESTAMP_FIELDS = new Set([
  "normalized_at",
  "created_at",
  "updated_at",
  "generated_at",
  "started_at",
  "finished_at",
  "timestamp",
  "resolved_at",
]);

function stripNoise(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(stripNoise);
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (TIMESTAMP_FIELDS.has(key)) {
        result[key] = "__STRIPPED_TIMESTAMP__";
      } else if (key === "submission_id" && typeof value === "string" && value.startsWith("SUB-")) {
        result[key] = value;
      } else if (key === "resolved_standards_id" && typeof value === "string") {
        result[key] = "__STRIPPED_ID__";
      } else {
        result[key] = stripNoise(value);
      }
    }
    return result;
  }
  return data;
}

function normalizedHash(filePath: string): string {
  if (!existsSync(filePath)) return "FILE_NOT_FOUND";
  const content = readFileSync(filePath, "utf-8");
  try {
    const parsed = JSON.parse(content);
    const stripped = stripNoise(parsed);
    const canonical = canonicalJsonString(deepSortKeys(stripped));
    return sha256(canonical);
  } catch {
    return sha256(content);
  }
}

function rawHash(filePath: string): string {
  if (!existsSync(filePath)) return "FILE_NOT_FOUND";
  return sha256(readFileSync(filePath, "utf-8"));
}

export function buildReproPackage(runDir: string, outputPath: string, selection: ReproSelection): ReproPackage {
  const now = isoNow();
  const reproId = `REPRO-${sha256(selection.run_id + now).slice(0, 12).toUpperCase()}`;

  ensureDir(outputPath);

  for (const artifact of selection.selected_artifacts) {
    const srcPath = join(runDir, artifact.path);
    if (!existsSync(srcPath)) continue;

    const destPath = join(outputPath, artifact.path);
    ensureDir(dirname(destPath));
    copyFileSync(srcPath, destPath);
  }

  const reproManifest: ReproPackage = {
    repro_id: reproId,
    run_id: selection.run_id,
    created_at: now,
    output_path: outputPath,
    artifacts_included: selection.selected_artifacts.length,
    manifest: selection,
  };

  writeJson(join(outputPath, "repro_manifest.json"), reproManifest);

  return reproManifest;
}

export function compareRuns(sourceRunDir: string, replayRunDir: string): ReproComparisonResult {
  const sourceSelection = selectReproArtifacts(sourceRunDir);
  const replaySelection = selectReproArtifacts(replayRunDir);

  const now = isoNow();
  const reproId = `CMP-${sha256(sourceSelection.run_id + replaySelection.run_id + now).slice(0, 12).toUpperCase()}`;

  const sourcePaths = new Set(sourceSelection.selected_artifacts.map((a) => a.path));
  const replayPaths = new Set(replaySelection.selected_artifacts.map((a) => a.path));

  const matches: ReproComparisonResult["matches"] = [];
  const mismatches: ReproComparisonResult["mismatches"] = [];
  const missingInReplay: string[] = [];
  const extraInReplay: string[] = [];

  for (const path of sourcePaths) {
    if (!replayPaths.has(path)) {
      missingInReplay.push(path);
      continue;
    }

    const sourceHash = normalizedHash(join(sourceRunDir, path));
    const replayHash = normalizedHash(join(replayRunDir, path));

    if (sourceHash === replayHash) {
      matches.push({ path, sha256_source: sourceHash, sha256_replay: replayHash });
    } else {
      mismatches.push({
        path,
        sha256_source: sourceHash,
        sha256_replay: replayHash,
        diff_summary: `Normalized content differs for ${path}`,
      });
    }
  }

  for (const path of replayPaths) {
    if (!sourcePaths.has(path)) {
      extraInReplay.push(path);
    }
  }

  return {
    repro_id: reproId,
    source_run_id: sourceSelection.run_id,
    replay_run_id: replaySelection.run_id,
    created_at: now,
    deterministic: mismatches.length === 0 && missingInReplay.length === 0,
    matches,
    mismatches,
    missing_in_replay: missingInReplay,
    extra_in_replay: extraInReplay,
  };
}

export function reproduceRun(
  baseDir: string,
  sourceRunId: string,
  outputPath?: string,
): { reproPackage: ReproPackage; comparison: ReproComparisonResult | null } {
  const sourceRunDir = join(baseDir, ".axion", "runs", sourceRunId);
  if (!existsSync(sourceRunDir)) {
    throw new Error(`Source run not found: ${sourceRunId} (expected at ${sourceRunDir})`);
  }

  const manifestPath = join(sourceRunDir, "run_manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`Run manifest not found for ${sourceRunId}`);
  }

  const selection = selectReproArtifacts(sourceRunDir);

  const resolvedOutput = outputPath ?? join(baseDir, ".axion", "repro", sourceRunId);
  const reproPackage = buildReproPackage(sourceRunDir, resolvedOutput, selection);

  let comparison: ReproComparisonResult | null = null;
  const reproArtifactsDir = resolvedOutput;
  if (existsSync(reproArtifactsDir)) {
    comparison = compareRuns(sourceRunDir, reproArtifactsDir);
    writeJson(join(resolvedOutput, "repro_comparison.json"), comparison);
  }

  return { reproPackage, comparison };
}
