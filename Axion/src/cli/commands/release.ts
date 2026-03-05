import { existsSync } from "node:fs";
import { join } from "node:path";
import { readJson } from "../../utils/fs.js";
import {
  createRelease,
  signRelease,
  publishRelease,
  revokeRelease,
  getRelease,
  listReleases,
} from "../../core/controlPlane/releases.js";
import type { Release } from "../../core/controlPlane/releases.js";
import { sha256 } from "../../utils/hash.js";
import { readFileSync, readdirSync } from "node:fs";

function collectArtifacts(
  runDir: string,
): Array<{ artifact_id: string; path: string; hash: string }> {
  const indexPath = join(runDir, "artifact_index.json");
  if (!existsSync(indexPath)) {
    return [];
  }
  const index = readJson<
    Array<{ artifact_id: string; path: string; sha256?: string }>
  >(indexPath);
  return index.map((entry) => {
    const absPath = join(runDir, entry.path);
    const hash =
      entry.sha256 ||
      (existsSync(absPath)
        ? sha256(readFileSync(absPath, "utf-8"))
        : "unknown");
    return { artifact_id: entry.artifact_id, path: entry.path, hash };
  });
}

function resolveRunDir(baseDir: string, runId?: string): string {
  const runsDir = join(baseDir, ".axion", "runs");
  if (runId) {
    return join(runsDir, runId);
  }
  if (!existsSync(runsDir)) {
    throw new Error(`No runs directory found at ${runsDir}`);
  }
  const entries = readdirSync(runsDir).sort();
  if (entries.length === 0) {
    throw new Error("No runs found");
  }
  return join(runsDir, entries[entries.length - 1]);
}

function resolveRunId(baseDir: string, runId?: string): string {
  const runsDir = join(baseDir, ".axion", "runs");
  if (runId) {
    return runId;
  }
  if (!existsSync(runsDir)) {
    throw new Error(`No runs directory found at ${runsDir}`);
  }
  const entries = readdirSync(runsDir).sort();
  if (entries.length === 0) {
    throw new Error("No runs found");
  }
  return entries[entries.length - 1];
}

function printRelease(release: Release): void {
  console.log(`  ID:      ${release.release_id}`);
  console.log(`  Run:     ${release.run_id}`);
  console.log(`  Version: ${release.version}`);
  console.log(`  Status:  ${release.status}`);
  console.log(`  Created: ${release.created_at}`);
  console.log(`  Updated: ${release.updated_at}`);
  console.log(`  Artifacts: ${release.artifacts.length}`);
  console.log(`  Signatures: ${release.signatures.length}`);
  if (release.notes) {
    console.log(`  Notes: ${release.notes}`);
  }
  if (release.revocation_reason) {
    console.log(`  Revocation: ${release.revocation_reason}`);
  }
}

export function cmdRelease(
  baseDir: string,
  version: string,
  runId?: string,
  notes?: string,
): Release {
  const resolvedRunId = resolveRunId(baseDir, runId);
  const runDir = resolveRunDir(baseDir, runId);
  if (!existsSync(runDir)) {
    throw new Error(`Run directory not found: ${runDir}`);
  }

  const artifacts = collectArtifacts(runDir);
  const basePath = join(baseDir, ".axion");
  const release = createRelease(resolvedRunId, version, basePath, artifacts, notes);

  console.log(`[release] Created release ${release.release_id} (v${version})`);
  printRelease(release);
  return release;
}

export function cmdReleaseSign(
  baseDir: string,
  releaseId: string,
  signer: string,
): Release {
  const basePath = join(baseDir, ".axion");
  const release = signRelease(releaseId, signer, basePath);
  console.log(`[release] Signed release ${releaseId} by ${signer}`);
  printRelease(release);
  return release;
}

export function cmdReleasePublish(
  baseDir: string,
  releaseId: string,
): Release {
  const basePath = join(baseDir, ".axion");
  const release = publishRelease(releaseId, basePath);
  console.log(`[release] Published release ${releaseId}`);
  printRelease(release);
  return release;
}

export function cmdReleaseRevoke(
  baseDir: string,
  releaseId: string,
  reason: string,
): Release {
  const basePath = join(baseDir, ".axion");
  const release = revokeRelease(releaseId, reason, basePath);
  console.log(`[release] Revoked release ${releaseId}`);
  printRelease(release);
  return release;
}

export function cmdReleaseGet(
  baseDir: string,
  releaseId: string,
): Release | null {
  const basePath = join(baseDir, ".axion");
  const release = getRelease(releaseId, basePath);
  if (!release) {
    console.log(`[release] Release ${releaseId} not found`);
    return null;
  }
  printRelease(release);
  return release;
}

export function cmdReleaseList(baseDir: string): Release[] {
  const basePath = join(baseDir, ".axion");
  const releases = listReleases(basePath);
  console.log(`[release] ${releases.length} release(s) found`);
  for (const release of releases) {
    console.log(`\n  --- ${release.release_id} ---`);
    printRelease(release);
  }
  return releases;
}
