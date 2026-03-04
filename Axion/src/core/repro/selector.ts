import { join } from "node:path";
import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";

export interface ReproSelection {
  run_id: string;
  selected_artifacts: Array<{ path: string; reason: string }>;
  excluded_artifacts: Array<{ path: string; reason: string }>;
}

const REPRO_DIRS = [
  "intake",
  "canonical",
  "standards",
  "templates",
  "planning",
  "proof",
  "gates",
  "stage_reports",
  "kit",
];

const NOISE_FILES = new Set([
  "audit_log.jsonl",
  "run_log.jsonl",
  "icp_run_state.json",
]);

const NOISE_EXTENSIONS = new Set([".log", ".tmp"]);

function collectFiles(baseDir: string, relDir: string): string[] {
  const absDir = join(baseDir, relDir);
  if (!existsSync(absDir) || !statSync(absDir).isDirectory()) return [];
  const results: string[] = [];
  for (const name of readdirSync(absDir)) {
    const absPath = join(absDir, name);
    const relPath = `${relDir}/${name}`;
    if (statSync(absPath).isDirectory()) {
      results.push(...collectFiles(baseDir, relPath));
    } else {
      results.push(relPath);
    }
  }
  return results;
}

function isNoiseFile(relPath: string): boolean {
  const base = relPath.split("/").pop() ?? "";
  if (NOISE_FILES.has(base)) return true;
  for (const ext of NOISE_EXTENSIONS) {
    if (base.endsWith(ext)) return true;
  }
  return false;
}

export function selectReproArtifacts(runDir: string, options?: { minimal?: boolean }): ReproSelection {
  const manifestPath = join(runDir, "run_manifest.json");
  let runId = "unknown";
  if (existsSync(manifestPath)) {
    try {
      const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
      runId = manifest.run_id ?? "unknown";
    } catch {
      /* use default */
    }
  }

  const selected: Array<{ path: string; reason: string }> = [];
  const excluded: Array<{ path: string; reason: string }> = [];

  if (existsSync(manifestPath)) {
    selected.push({ path: "run_manifest.json", reason: "run manifest required for reproduction" });
  }

  const artifactIndexPath = join(runDir, "artifact_index.json");
  if (existsSync(artifactIndexPath)) {
    selected.push({ path: "artifact_index.json", reason: "artifact index required for integrity verification" });
  }

  const minimalDirs = options?.minimal
    ? ["intake", "canonical", "standards"]
    : REPRO_DIRS;

  for (const dir of minimalDirs) {
    const files = collectFiles(runDir, dir);
    for (const relPath of files) {
      if (isNoiseFile(relPath)) {
        excluded.push({ path: relPath, reason: "noise file excluded from repro" });
      } else {
        selected.push({ path: relPath, reason: `artifact from ${dir}` });
      }
    }
  }

  for (const noiseFile of ["audit_log.jsonl", "run_log.jsonl", "icp_run_state.json"]) {
    if (existsSync(join(runDir, noiseFile))) {
      excluded.push({ path: noiseFile, reason: "runtime noise excluded from deterministic comparison" });
    }
  }

  return { run_id: runId, selected_artifacts: selected, excluded_artifacts: excluded };
}
