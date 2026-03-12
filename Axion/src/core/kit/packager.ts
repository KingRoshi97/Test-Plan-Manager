import { join, dirname, relative, basename } from "node:path";
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { ensureDir } from "../../utils/fs.js";
import { sha256 } from "../../utils/hash.js";
import { writeCanonicalJson, canonicalJsonString } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";
import { runPackagingPreflight, writePackagingDecision } from "../baq/packagingEnforcement.js";
import { updateQualityReportWithPackagingDecision } from "../baq/qualityReport.js";
import { BuildQualityHookRunner, createHookContext } from "../baq/hooks.js";

interface PackagedFile {
  path: string;
  hash: string;
  bytes: number;
}

export interface PackageKitOptions {
  hookRunner?: BuildQualityHookRunner;
  runId?: string;
  buildId?: string;
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

export async function packageKit(
  runDir: string,
  outputPath: string,
  options: PackageKitOptions = {},
): Promise<void> {
  ensureDir(outputPath);

  const kitBundleDir = join(runDir, "kit", "bundle", "agent_kit");
  const resolvedRunId = options.runId ?? basename(runDir) ?? "unknown";
  const resolvedBuildId = options.buildId ?? `BUILD-${resolvedRunId}`;

  if (options.hookRunner) {
    const beforeCtx = createHookContext("beforePackaging", resolvedRunId, resolvedBuildId, {
      metadata: { stage: "S10_PACKAGE", kit_bundle_dir: kitBundleDir },
    });
    const beforeResult = await options.hookRunner.run("beforePackaging", beforeCtx);
    if (beforeResult.blocking && !beforeResult.success) {
      throw new Error(`beforePackaging hook blocked: ${beforeResult.errors.join("; ")}`);
    }
  }

  const preflightDecision = runPackagingPreflight(runDir, kitBundleDir);
  writePackagingDecision(runDir, preflightDecision);

  updateQualityReportWithPackagingDecision(runDir, {
    packaging_allowed: preflightDecision.allowed,
    block_reasons: preflightDecision.block_reasons,
    evaluated_at: preflightDecision.evaluated_at,
  });

  if (!preflightDecision.allowed) {
    if (options.hookRunner) {
      const decisionCtx = createHookContext("onPackagingDecision", resolvedRunId, resolvedBuildId, {
        metadata: {
          packaging_allowed: false,
          block_reasons: preflightDecision.block_reasons,
          gate_evidence: preflightDecision.gate_evidence,
        },
      });
      await options.hookRunner.run("onPackagingDecision", decisionCtx);
    }

    throw new Error(
      `Packaging blocked by preflight gate: ${preflightDecision.block_reasons.join("; ")}`,
    );
  }

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

  if (options.hookRunner) {
    const decisionCtx = createHookContext("onPackagingDecision", resolvedRunId, resolvedBuildId, {
      metadata: {
        packaging_allowed: true,
        block_reasons: [],
        kit_file_count: allFiles.length,
        kit_content_hash: manifest.content_hash,
      },
    });
    await options.hookRunner.run("onPackagingDecision", decisionCtx);
  }
}
