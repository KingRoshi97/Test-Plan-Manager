import { join } from "node:path";
import { existsSync, readdirSync, copyFileSync, mkdirSync, statSync } from "node:fs";
import { readJson, writeJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";

export type BundleProfile = "thin" | "full" | "audit" | "public" | "internal" | "repro";

const PROFILE_INCLUDE: Record<BundleProfile, string[]> = {
  thin: ["canonical", "templates"],
  full: ["intake", "canonical", "standards", "templates", "planning", "gates", "verification", "proof", "kit", "state", "stage_reports"],
  audit: ["gates", "verification", "proof", "canonical", "stage_reports"],
  public: ["canonical", "templates", "kit"],
  internal: ["intake", "canonical", "standards", "templates", "planning", "kit"],
  repro: ["intake", "canonical", "standards", "templates", "planning", "gates"],
};

function copyDirRecursive(src: string, dest: string): number {
  if (!existsSync(src)) return 0;
  mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDirRecursive(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

export function cmdExportBundle(runDir: string, profile?: BundleProfile, outputPath?: string): void {
  if (!existsSync(runDir)) {
    console.error(`Run directory not found: ${runDir}`);
    process.exit(1);
  }

  const selectedProfile = profile ?? "full";
  const includeDirs = PROFILE_INCLUDE[selectedProfile];
  if (!includeDirs) {
    console.error(`Unknown bundle profile: ${selectedProfile}. Valid profiles: ${Object.keys(PROFILE_INCLUDE).join(", ")}`);
    process.exit(1);
  }

  const outDir = outputPath ?? join(runDir, `bundle_${selectedProfile}`);
  mkdirSync(outDir, { recursive: true });

  let totalFiles = 0;

  for (const dir of includeDirs) {
    const srcDir = join(runDir, dir);
    if (existsSync(srcDir) && statSync(srcDir).isDirectory()) {
      totalFiles += copyDirRecursive(srcDir, join(outDir, dir));
    }
  }

  const topLevelFiles = ["run_manifest.json", "artifact_index.json"];
  for (const f of topLevelFiles) {
    const srcFile = join(runDir, f);
    if (existsSync(srcFile)) {
      copyFileSync(srcFile, join(outDir, f));
      totalFiles++;
    }
  }

  const bundleManifest = {
    profile: selectedProfile,
    exported_at: isoNow(),
    source_run_dir: runDir,
    included_directories: includeDirs,
    file_count: totalFiles,
    content_hash: sha256(JSON.stringify({ profile: selectedProfile, files: totalFiles, ts: Date.now() })),
  };
  writeJson(join(outDir, "bundle_manifest.json"), bundleManifest);

  console.log(`Exported ${selectedProfile} bundle: ${totalFiles} files → ${outDir}`);
}
