import { readdirSync, statSync, rmSync, existsSync, copyFileSync } from "node:fs";
import { join } from "node:path";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";

export interface RetentionPolicy {
  max_runs: number;
  max_age_days: number;
  keep_categories: string[];
  prune_categories: string[];
  keep_statuses: string[];
}

export interface DocEnvelope {
  doc_id: string;
  template_id: string;
  rendered_at: string;
  content_hash: string;
  byte_size: number;
  path: string;
}

export interface PruneResult {
  pruned_run_ids: string[];
  retained_run_ids: string[];
  pruned_at: string;
  bytes_freed: number;
  errors: string[];
}

const DEFAULT_POLICY: RetentionPolicy = {
  max_runs: 50,
  max_age_days: 90,
  keep_categories: [
    "run_manifest.json",
    "stage_reports",
    "gates",
    "proof",
    "state",
    "audit_log.jsonl",
    "icp_run_state.json",
    "artifact_index.json",
  ],
  prune_categories: [
    "templates/rendered",
  ],
  keep_statuses: ["completed"],
};

const GOLDEN_DIR = "golden_runs";
const RUNTIME_DIR = "runs";

export function loadRetentionPolicy(configPath?: string): RetentionPolicy {
  if (configPath && existsSync(configPath)) {
    const loaded = readJson<Partial<RetentionPolicy>>(configPath);
    return { ...DEFAULT_POLICY, ...loaded };
  }
  return { ...DEFAULT_POLICY };
}

export function saveRetentionPolicy(outputPath: string, policy: RetentionPolicy): void {
  writeJson(outputPath, policy);
}

export function isGoldenRun(axionDir: string, runId: string): boolean {
  const goldenPath = join(axionDir, GOLDEN_DIR, runId);
  return existsSync(goldenPath);
}

export function promoteToGolden(axionDir: string, runId: string): void {
  const runPath = join(axionDir, RUNTIME_DIR, runId);
  const goldenPath = join(axionDir, GOLDEN_DIR, runId);
  if (!existsSync(runPath)) {
    throw new Error(`Run not found: ${runId}`);
  }
  ensureDir(join(axionDir, GOLDEN_DIR));
  copyDirRecursive(runPath, goldenPath);
}

function copyDirRecursive(src: string, dest: string): void {
  ensureDir(dest);
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export function createDocEnvelope(
  docId: string,
  templateId: string,
  content: string,
  filePath: string,
): DocEnvelope {
  return {
    doc_id: docId,
    template_id: templateId,
    rendered_at: isoNow(),
    content_hash: sha256(content),
    byte_size: Buffer.byteLength(content, "utf-8"),
    path: filePath,
  };
}

export function writeDocEnvelopes(outputPath: string, envelopes: DocEnvelope[]): void {
  writeJson(outputPath, { envelopes, created_at: isoNow() });
}

function getRunAge(runDir: string): number {
  try {
    const manifest = readJson<{ created_at?: string }>(join(runDir, "run_manifest.json"));
    if (manifest.created_at) {
      const created = new Date(manifest.created_at).getTime();
      return (Date.now() - created) / (1000 * 60 * 60 * 24);
    }
  } catch {
    /* fall through to stat */
  }
  try {
    return (Date.now() - statSync(runDir).mtimeMs) / (1000 * 60 * 60 * 24);
  } catch {
    return 0;
  }
}

function getRunStatus(runDir: string): string {
  try {
    const manifest = readJson<{ status?: string }>(join(runDir, "run_manifest.json"));
    return manifest.status ?? "unknown";
  } catch {
    return "unknown";
  }
}

function dirSize(dirPath: string): number {
  let total = 0;
  if (!existsSync(dirPath)) return 0;
  for (const entry of readdirSync(dirPath)) {
    const full = join(dirPath, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      total += dirSize(full);
    } else {
      total += st.size;
    }
  }
  return total;
}

export function listRuns(axionDir: string): string[] {
  const runsDir = join(axionDir, RUNTIME_DIR);
  if (!existsSync(runsDir)) return [];
  return readdirSync(runsDir)
    .filter((name) => {
      const full = join(runsDir, name);
      return statSync(full).isDirectory() && name.startsWith("RUN-");
    })
    .sort();
}

export function identifyPrunableRuns(
  axionDir: string,
  policy: RetentionPolicy,
): string[] {
  const allRuns = listRuns(axionDir);
  const prunable: string[] = [];

  const sortedByAge = allRuns
    .map((runId) => ({
      runId,
      ageDays: getRunAge(join(axionDir, RUNTIME_DIR, runId)),
      status: getRunStatus(join(axionDir, RUNTIME_DIR, runId)),
    }))
    .sort((a, b) => a.ageDays - b.ageDays);

  for (const run of sortedByAge) {
    if (isGoldenRun(axionDir, run.runId)) continue;

    const tooOld = run.ageDays > policy.max_age_days;
    const overLimit = allRuns.length - prunable.length > policy.max_runs;

    if (tooOld || overLimit) {
      prunable.push(run.runId);
    }
  }

  return prunable;
}

export function pruneRenderedDocs(runDir: string): number {
  let freed = 0;
  for (const category of DEFAULT_POLICY.prune_categories) {
    const target = join(runDir, category);
    if (existsSync(target)) {
      freed += dirSize(target);
      rmSync(target, { recursive: true, force: true });
    }
  }
  return freed;
}

export function pruneRun(axionDir: string, runId: string): number {
  const runDir = join(axionDir, RUNTIME_DIR, runId);
  if (!existsSync(runDir)) return 0;
  if (isGoldenRun(axionDir, runId)) {
    throw new Error(`Cannot prune golden run: ${runId}`);
  }
  const size = dirSize(runDir);
  rmSync(runDir, { recursive: true, force: true });
  return size;
}

export function pruneByPolicy(axionDir: string, policy?: RetentionPolicy): PruneResult {
  const effectivePolicy = policy ?? loadRetentionPolicy();
  const prunable = identifyPrunableRuns(axionDir, effectivePolicy);
  const allRuns = listRuns(axionDir);

  const result: PruneResult = {
    pruned_run_ids: [],
    retained_run_ids: [],
    pruned_at: isoNow(),
    bytes_freed: 0,
    errors: [],
  };

  for (const runId of prunable) {
    try {
      const freed = pruneRun(axionDir, runId);
      result.pruned_run_ids.push(runId);
      result.bytes_freed += freed;
    } catch (err) {
      result.errors.push(`${runId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  result.retained_run_ids = allRuns.filter(
    (id) => !result.pruned_run_ids.includes(id),
  );

  return result;
}

export function pruneRenderedDocsByPolicy(axionDir: string): PruneResult {
  const allRuns = listRuns(axionDir);
  const result: PruneResult = {
    pruned_run_ids: [],
    retained_run_ids: [...allRuns],
    pruned_at: isoNow(),
    bytes_freed: 0,
    errors: [],
  };

  for (const runId of allRuns) {
    if (isGoldenRun(axionDir, runId)) continue;
    try {
      const runDir = join(axionDir, RUNTIME_DIR, runId);
      const freed = pruneRenderedDocs(runDir);
      if (freed > 0) {
        result.bytes_freed += freed;
      }
    } catch (err) {
      result.errors.push(`${runId}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return result;
}
