import { existsSync, readFileSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, relative } from "node:path";
import { ensureDir, readJson, writeJson } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { isoNow } from "../../utils/time.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { scanDirectory } from "../scanner/scan.js";
import { getDefaultPacks } from "../scanner/packs.js";
import type { KitManifest, KitArtifactEntry } from "./schemas.js";
import { validateKit } from "./validate.js";

export type KitVariant = "internal" | "external";

interface PackagingProfile {
  profile_id: string;
  description: string;
  includes: string[];
  excludes?: string[];
}

const RESTRICTED_PATHS_EXTERNAL = [
  "intake/raw_submission",
  "intake/normalized_payload.json",
  "proof/proof_ledger.jsonl",
  "stage_reports/",
];

const RESTRICTED_PATTERNS_EXTERNAL = [
  /knowledge\//,
  /\.env/,
  /secrets?\./,
  /credentials?\./,
];

function shouldExcludeForExternal(relPath: string): boolean {
  for (const restricted of RESTRICTED_PATHS_EXTERNAL) {
    if (relPath.startsWith(restricted)) return true;
  }
  for (const pattern of RESTRICTED_PATTERNS_EXTERNAL) {
    if (pattern.test(relPath)) return true;
  }
  return false;
}

function collectAllFiles(dirPath: string): string[] {
  const result: string[] = [];
  if (!existsSync(dirPath)) return result;
  const entries = readdirSync(dirPath);
  for (const entry of entries) {
    const full = join(dirPath, entry);
    try {
      const stat = statSync(full);
      if (stat.isDirectory()) {
        result.push(...collectAllFiles(full));
      } else if (stat.isFile()) {
        result.push(full);
      }
    } catch {
      continue;
    }
  }
  return result;
}

function loadPackagingProfile(baseDir: string, variant: KitVariant): PackagingProfile | null {
  const profilesPath = join(baseDir, "registries", "PACKAGING_PROFILES.json");
  if (!existsSync(profilesPath)) return null;
  try {
    const data = readJson<{ profiles: PackagingProfile[] }>(profilesPath);
    const profileId = variant === "external" ? "external" : "internal";
    return data.profiles.find((p) => p.profile_id === profileId) ?? null;
  } catch {
    return null;
  }
}

export function packageKit(runDir: string, outputPath: string, variant: KitVariant = "internal", baseDir?: string): void {
  const effectiveBaseDir = baseDir ?? join(runDir, "..", "..", "..");
  ensureDir(outputPath);

  const packs = getDefaultPacks();
  const scanResult = scanDirectory(runDir, packs);
  writeCanonicalJson(join(runDir, "kit", "scan_result.json"), scanResult);

  if (!scanResult.passed) {
    const criticalFindings = scanResult.findings.filter((f) => f.severity === "critical" || f.severity === "high");
    const msg = criticalFindings.map((f) => `[${f.severity}] ${f.file_path}:${f.line ?? "?"} - ${f.description}`).join("\n");
    throw new Error(`Secrets/PII scan FAILED. ${scanResult.summary.critical} critical, ${scanResult.summary.high} high findings:\n${msg}`);
  }

  const _profile = loadPackagingProfile(effectiveBaseDir, variant);

  const artifactDirs = ["intake", "canonical", "standards", "templates", "planning", "proof", "gates", "stage_reports", "kit"];
  const artifacts: KitArtifactEntry[] = [];

  for (const dir of artifactDirs) {
    const dirPath = join(runDir, dir);
    if (!existsSync(dirPath)) continue;

    const files = collectAllFiles(dirPath);
    for (const file of files) {
      const relPath = relative(runDir, file);

      if (variant === "external" && shouldExcludeForExternal(relPath)) {
        continue;
      }

      try {
        const content = readFileSync(file, "utf-8");
        const destPath = join(outputPath, relPath);
        ensureDir(join(destPath, ".."));
        copyFileSync(file, destPath);

        artifacts.push({
          artifact_id: relPath.replace(/[/\\]/g, "_").replace(/\./g, "_"),
          path: relPath,
          type: dir,
          hash: sha256(content),
        });
      } catch {
        continue;
      }
    }
  }

  const manifestPath = join(runDir, "run_manifest.json");
  let runId = "unknown";
  if (existsSync(manifestPath)) {
    try {
      const manifest = readJson<{ run_id: string }>(manifestPath);
      runId = manifest.run_id;
    } catch { /* use default */ }
  }

  const kitManifest: KitManifest = {
    kit_id: `kit_${runId}`,
    run_id: runId,
    version: "1.0.0",
    created_at: isoNow(),
    artifacts,
    metadata: {
      variant,
      files_included: artifacts.length,
      scan_passed: scanResult.passed,
      scan_files_scanned: scanResult.files_scanned,
    },
  };

  const validation = validateKit(kitManifest);
  if (!validation.valid) {
    throw new Error(`Kit manifest validation failed: ${validation.errors.join(", ")}`);
  }

  writeJson(join(outputPath, "kit_manifest.json"), kitManifest);
}
