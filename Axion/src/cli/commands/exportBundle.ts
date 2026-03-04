import { join, resolve } from "node:path";
import { existsSync, readFileSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { ensureDir, readJson, writeJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { scanDirectory } from "../../core/scanner/scan.js";
import { getDefaultPacks } from "../../core/scanner/packs.js";

export type BundleProfile = "thin" | "full" | "audit" | "public" | "internal" | "repro";

interface ProfileConfig {
  includeDirs: string[];
  excludePatterns: RegExp[];
  runScan: boolean;
}

const PROFILE_CONFIGS: Record<BundleProfile, ProfileConfig> = {
  full: {
    includeDirs: ["intake", "canonical", "standards", "templates", "planning", "proof", "gates", "stage_reports", "kit"],
    excludePatterns: [],
    runScan: true,
  },
  thin: {
    includeDirs: ["canonical", "templates", "kit"],
    excludePatterns: [/stage_reports\//, /proof\//],
    runScan: false,
  },
  audit: {
    includeDirs: ["intake", "canonical", "standards", "planning", "proof", "gates", "stage_reports"],
    excludePatterns: [],
    runScan: true,
  },
  public: {
    includeDirs: ["canonical", "templates", "kit"],
    excludePatterns: [/intake\//, /proof\//, /stage_reports\//, /knowledge\//, /\.env/, /secrets?\./, /credentials?\./],
    runScan: true,
  },
  internal: {
    includeDirs: ["intake", "canonical", "standards", "templates", "planning", "proof", "gates", "stage_reports", "kit"],
    excludePatterns: [],
    runScan: true,
  },
  repro: {
    includeDirs: ["intake", "canonical", "standards", "templates", "planning"],
    excludePatterns: [/kit\//, /proof\//],
    runScan: false,
  },
};

function collectFiles(dirPath: string): string[] {
  const result: string[] = [];
  if (!existsSync(dirPath)) return result;
  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    const full = join(dirPath, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        result.push(...collectFiles(full));
      } else if (stat.isFile()) {
        result.push(full);
      }
    } catch {
      continue;
    }
  }
  return result;
}

export function cmdExportBundle(runDir: string, profile?: BundleProfile, outputPath?: string): void {
  const resolvedRunDir = resolve(runDir);
  if (!existsSync(resolvedRunDir)) {
    console.error(`Run directory not found: ${resolvedRunDir}`);
    process.exit(1);
  }

  const effectiveProfile = profile ?? "full";
  const config = PROFILE_CONFIGS[effectiveProfile];
  const output = outputPath ? resolve(outputPath) : join(resolvedRunDir, "bundle", effectiveProfile);
  ensureDir(output);

  if (config.runScan) {
    const packs = getDefaultPacks();
    const scanResult = scanDirectory(resolvedRunDir, packs);
    writeJson(join(output, "scan_result.json"), scanResult);

    if (!scanResult.passed) {
      const critFindings = scanResult.findings.filter((f) => f.severity === "critical" || f.severity === "high");
      console.error(`Secrets/PII scan FAILED for profile "${effectiveProfile}".`);
      for (const f of critFindings) {
        console.error(`  [${f.severity}] ${f.file_path}:${f.line ?? "?"} - ${f.description}`);
      }
      process.exit(1);
    }
  }

  const bundleFiles: Array<{ path: string; sha256: string }> = [];

  for (const dir of config.includeDirs) {
    const dirPath = join(resolvedRunDir, dir);
    if (!existsSync(dirPath)) continue;

    const files = collectFiles(dirPath);
    for (const file of files) {
      const relPath = file.slice(resolvedRunDir.length + 1);

      let excluded = false;
      for (const pattern of config.excludePatterns) {
        if (pattern.test(relPath)) {
          excluded = true;
          break;
        }
      }
      if (excluded) continue;

      try {
        const content = readFileSync(file, "utf-8");
        const destPath = join(output, relPath);
        ensureDir(join(destPath, ".."));
        copyFileSync(file, destPath);
        bundleFiles.push({ path: relPath, sha256: sha256(content) });
      } catch {
        continue;
      }
    }
  }

  let runId = "unknown";
  const manifestPath = join(resolvedRunDir, "run_manifest.json");
  if (existsSync(manifestPath)) {
    try {
      const manifest = readJson<{ run_id: string }>(manifestPath);
      runId = manifest.run_id;
    } catch { /* use default */ }
  }

  const bundleManifest = {
    bundle_id: `BUNDLE-${runId}-${effectiveProfile}`,
    run_id: runId,
    profile: effectiveProfile,
    generated_at: isoNow(),
    files_count: bundleFiles.length,
    files: bundleFiles,
  };

  writeJson(join(output, "bundle_manifest.json"), bundleManifest);
  console.log(`Bundle exported: ${output}`);
  console.log(`  Profile: ${effectiveProfile}`);
  console.log(`  Files: ${bundleFiles.length}`);
}
