import { existsSync, readFileSync, copyFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { sha256 } from "../../utils/hash.js";
import { ensureDir } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { canonicalJsonString } from "../../utils/canonicalJson.js";
import type { ReproSelection } from "./selector.js";

export interface ReproPackage {
  repro_id: string;
  run_id: string;
  created_at: string;
  output_path: string;
  artifacts_included: number;
  total_size_bytes: number;
  content_hash: string;
  manifest: ReproSelection;
}

function generateReproId(runId: string, timestamp: string): string {
  return `repro-${sha256(`${runId}:${timestamp}`).slice(0, 12)}`;
}

export function buildReproPackage(runDir: string, outputPath: string, selection: ReproSelection): ReproPackage {
  if (!existsSync(runDir)) {
    throw new Error(`ERR-REPRO-002: Run directory does not exist: ${runDir}`);
  }

  if (selection.selected_artifacts.length === 0) {
    throw new Error("ERR-REPRO-003: No artifacts selected for repro package");
  }

  ensureDir(outputPath);

  const hashes: string[] = [];
  let copiedCount = 0;

  for (const artifact of selection.selected_artifacts) {
    const srcPath = join(runDir, artifact.path);
    const destPath = join(outputPath, artifact.path);

    if (!existsSync(srcPath)) {
      continue;
    }

    ensureDir(dirname(destPath));
    copyFileSync(srcPath, destPath);
    hashes.push(artifact.hash);
    copiedCount++;
  }

  const createdAt = isoNow();
  const reproId = generateReproId(selection.run_id, createdAt);
  const contentHash = sha256(hashes.sort().join(":"));

  const reproManifest: ReproPackage = {
    repro_id: reproId,
    run_id: selection.run_id,
    created_at: createdAt,
    output_path: outputPath,
    artifacts_included: copiedCount,
    total_size_bytes: selection.total_size_bytes,
    content_hash: contentHash,
    manifest: selection,
  };

  const manifestPath = join(outputPath, "repro_manifest.json");
  writeFileSync(manifestPath, canonicalJsonString(reproManifest), "utf-8");

  return reproManifest;
}
