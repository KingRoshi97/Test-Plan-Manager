import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import type { KitManifest, KitArtifactEntry } from "./schemas.js";

export interface KitBuildResult {
  manifest: KitManifest;
  outputDir: string;
}

export function buildKit(runId: string, runDir: string): KitBuildResult {
  const artifactDirs = ["intake", "canonical", "standards", "templates", "planning", "proof", "gates", "stage_reports"];
  const artifacts: KitArtifactEntry[] = [];

  for (const dir of artifactDirs) {
    const dirPath = join(runDir, dir);
    if (!existsSync(dirPath)) continue;
    try {
      const files = readdirSync(dirPath).filter((f) => f.endsWith(".json") || f.endsWith(".jsonl"));
      for (const file of files) {
        const filePath = join(dirPath, file);
        const content = readFileSync(filePath, "utf-8");
        artifacts.push({
          artifact_id: `${dir}_${file}`.replace(/\./g, "_"),
          path: `${dir}/${file}`,
          type: dir,
          hash: sha256(content),
        });
      }
    } catch {
      continue;
    }
  }

  const manifest: KitManifest = {
    kit_id: `kit_${runId}`,
    run_id: runId,
    version: "1.0.0",
    created_at: isoNow(),
    artifacts,
    metadata: {
      total_artifacts: artifacts.length,
    },
  };

  const outputDir = join(runDir, "kit");

  return { manifest, outputDir };
}
