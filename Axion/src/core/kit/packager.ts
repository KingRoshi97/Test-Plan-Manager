import { join, dirname, relative, basename } from "node:path";
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { ensureDir } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { writeCanonicalJson, canonicalJsonString } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";

interface PackagedFile {
  path: string;
  hash: string;
  bytes: number;
}

function collectFiles(dir: string, base: string, result: PackagedFile[]): void {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = join(base, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      collectFiles(full, rel, result);
    } else {
      const content = readFileSync(full, "utf-8");
      result.push({ path: rel, hash: sha256(content), bytes: stat.size });
    }
  }
}

function copyDirRecursive(srcDir: string, destDir: string): void {
  if (!existsSync(srcDir)) return;
  ensureDir(destDir);
  for (const name of readdirSync(srcDir)) {
    const srcPath = join(srcDir, name);
    const destPath = join(destDir, name);
    const stat = statSync(srcPath);
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      ensureDir(dirname(destPath));
      copyFileSync(srcPath, destPath);
    }
  }
}

export function packageKit(runDir: string, outputPath: string): void {
  ensureDir(outputPath);

  const kitBundleDir = join(runDir, "kit", "bundle", "agent_kit");
  const destAgentKit = join(outputPath, "agent_kit");

  if (existsSync(kitBundleDir)) {
    copyDirRecursive(kitBundleDir, destAgentKit);
  }

  const startHerePath = join(destAgentKit, "00_START_HERE.md");
  if (!existsSync(startHerePath)) {
    ensureDir(dirname(startHerePath));
    writeFileSync(startHerePath, "# 00 — START HERE\n\nKit packaged from run directory.\n", "utf-8");
  }

  const allFiles: PackagedFile[] = [];
  collectFiles(destAgentKit, "agent_kit", allFiles);

  const now = isoNow();

  const runId = basename(runDir) || "unknown";

  const manifest = {
    kit_id: `KIT-${runId}`,
    run_id: runId,
    version: "1.0.0",
    created_at: now,
    file_count: allFiles.length,
    content_hash: sha256(canonicalJsonString(allFiles.map((f) => ({ path: f.path, sha256: f.hash })))),
    files: allFiles.map((f) => ({
      path: f.path,
      sha256: f.hash,
      bytes: f.bytes,
    })),
    metadata: {
      packaged_at: now,
      source_run_dir: runDir,
    },
  };

  writeCanonicalJson(join(outputPath, "manifest.json"), manifest);
}
