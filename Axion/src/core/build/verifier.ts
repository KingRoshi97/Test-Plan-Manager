import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type {
  BuildPlan,
  BuildManifest,
  RepoManifest,
  VerificationReport,
  VerificationCategory,
  VerificationCheck,
} from "./types.js";
import type { WorkspacePaths } from "./workspace.js";
import {
  listRepoFiles,
  getRepoDirectories,
  readBuildManifest,
  readRepoManifest,
  readBuildPlan,
  writeVerificationReport,
} from "./workspace.js";

const PLACEHOLDER_PATTERNS = [
  /\bUNKNOWN\b/,
  /\bTODO\b/,
  /\bPLACEHOLDER\b/,
  /\bFIXME\b/,
  /\bXXX\b/,
  /\bHACK\b/,
];

const SYNTAX_CHECKABLE_EXTENSIONS = new Set([".json"]);

export async function verifyBuild(paths: WorkspacePaths, buildId: string, runId: string): Promise<VerificationReport> {
  const plan = readBuildPlan(paths);
  const buildManifest = readBuildManifest(paths);
  const repoManifest = readRepoManifest(paths);
  const repoFiles = listRepoFiles(paths);
  const repoDirs = getRepoDirectories(paths);

  const categories: VerificationCategory[] = [];

  categories.push(checkRequiredOutputPresence(plan, repoFiles));
  categories.push(checkRepoStructure(plan, repoDirs));
  categories.push(checkPlaceholderScan(paths, repoFiles));
  categories.push(checkManifestCompleteness(buildManifest, repoManifest));
  categories.push(checkFileIntegrity(paths, repoFiles));
  categories.push(checkOutputConsistency(buildManifest, plan, repoFiles));

  const totalChecks = categories.reduce((sum, c) => sum + c.checks.length, 0);
  const passed = categories.reduce((sum, c) => sum + c.checks.filter(ch => ch.result === "pass").length, 0);
  const failed = categories.reduce((sum, c) => sum + c.checks.filter(ch => ch.result === "fail").length, 0);
  const warnings = categories.reduce((sum, c) => sum + c.checks.filter(ch => ch.result === "warn").length, 0);

  const overallResult = failed > 0 ? "fail" : "pass";
  const exportEligible = overallResult === "pass";

  const report: VerificationReport = {
    buildId,
    runId,
    verifiedAt: isoNow(),
    overallResult,
    categories,
    summary: {
      totalChecks,
      passed,
      failed,
      warnings,
    },
    exportEligible,
  };

  writeVerificationReport(paths, report);

  return report;
}

function checkRequiredOutputPresence(
  plan: BuildPlan | null,
  repoFiles: { relativePath: string; sizeBytes: number }[]
): VerificationCategory {
  const checks: VerificationCheck[] = [];
  const existingPaths = new Set(repoFiles.map(f => f.relativePath));

  if (!plan) {
    checks.push({
      checkId: "rop-001",
      description: "Build plan exists",
      result: "fail",
      detail: "No build plan found — cannot verify required outputs",
    });
    return {
      categoryId: "required_output_presence",
      name: "Required Output Presence",
      result: "fail",
      checks,
    };
  }

  for (const slice of plan.slices) {
    for (const file of slice.files) {
      const exists = existingPaths.has(file.relativePath);
      checks.push({
        checkId: `rop-${file.relativePath}`,
        description: `File exists: ${file.relativePath}`,
        result: exists ? "pass" : "fail",
        detail: exists ? undefined : `Missing required file from ${slice.name} slice`,
      });
    }
  }

  const anyFailed = checks.some(c => c.result === "fail");
  return {
    categoryId: "required_output_presence",
    name: "Required Output Presence",
    result: anyFailed ? "fail" : "pass",
    checks,
  };
}

function checkRepoStructure(
  plan: BuildPlan | null,
  repoDirs: string[]
): VerificationCategory {
  const checks: VerificationCheck[] = [];

  if (!plan) {
    checks.push({
      checkId: "rs-001",
      description: "Build plan available for structure check",
      result: "skip",
      detail: "No build plan — skipping structure verification",
    });
    return {
      categoryId: "repo_structure",
      name: "Repo Structure Correctness",
      result: "skip",
      checks,
    };
  }

  const dirSet = new Set(repoDirs);

  for (const rootDir of plan.repoShape.rootDirs) {
    const exists = dirSet.has(rootDir);
    checks.push({
      checkId: `rs-root-${rootDir}`,
      description: `Root directory exists: ${rootDir}`,
      result: exists ? "pass" : "warn",
      detail: exists ? undefined : `Expected root directory "${rootDir}" not found`,
    });
  }

  for (const [parentDir, subDirs] of Object.entries(plan.repoShape.srcLayout)) {
    const parentExists = dirSet.has(parentDir);
    checks.push({
      checkId: `rs-src-${parentDir}`,
      description: `Source directory exists: ${parentDir}`,
      result: parentExists ? "pass" : "warn",
      detail: parentExists ? undefined : `Expected source directory "${parentDir}" not found`,
    });

    for (const sub of subDirs) {
      const fullSub = `${parentDir}/${sub}`;
      const subExists = dirSet.has(fullSub);
      checks.push({
        checkId: `rs-sub-${fullSub}`,
        description: `Sub-directory exists: ${fullSub}`,
        result: subExists ? "pass" : "warn",
        detail: subExists ? undefined : `Expected sub-directory "${fullSub}" not found`,
      });
    }
  }

  const anyFailed = checks.some(c => c.result === "fail");
  return {
    categoryId: "repo_structure",
    name: "Repo Structure Correctness",
    result: anyFailed ? "fail" : "pass",
    checks,
  };
}

function checkPlaceholderScan(
  paths: WorkspacePaths,
  repoFiles: { relativePath: string; sizeBytes: number }[]
): VerificationCategory {
  const checks: VerificationCheck[] = [];
  const textExtensions = new Set([
    ".ts", ".tsx", ".js", ".jsx", ".json", ".md", ".yml", ".yaml",
    ".css", ".html", ".env", ".toml", ".cfg",
  ]);

  let filesScanned = 0;
  let violationsFound = 0;

  for (const file of repoFiles) {
    const ext = extname(file.relativePath);
    if (!textExtensions.has(ext) && !file.relativePath.includes(".")) continue;

    const fullPath = join(paths.repo, file.relativePath);
    let content: string;
    try {
      content = readFileSync(fullPath, "utf-8");
    } catch {
      continue;
    }

    filesScanned++;
    const violations: string[] = [];

    for (const pattern of PLACEHOLDER_PATTERNS) {
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          const isComment = /^\s*(\/\/|\/\*|\*|#|<!--)/.test(lines[i]);
          if (!isComment) {
            violations.push(`Line ${i + 1}: ${pattern.source} found`);
          }
        }
      }
    }

    if (violations.length > 0) {
      violationsFound++;
      checks.push({
        checkId: `ps-${file.relativePath}`,
        description: `Placeholder scan: ${file.relativePath}`,
        result: "warn",
        detail: `${violations.length} placeholder(s) found: ${violations.slice(0, 3).join("; ")}`,
      });
    }
  }

  checks.push({
    checkId: "ps-summary",
    description: `Scanned ${filesScanned} files for placeholders`,
    result: violationsFound > 0 ? "warn" : "pass",
    detail: violationsFound > 0
      ? `${violationsFound} file(s) contain placeholder markers`
      : "No placeholder violations found",
  });

  return {
    categoryId: "placeholder_scan",
    name: "Placeholder Scan",
    result: violationsFound > 0 ? "warn" : "pass",
    checks,
  };
}

function checkManifestCompleteness(
  buildManifest: BuildManifest | null,
  repoManifest: RepoManifest | null
): VerificationCategory {
  const checks: VerificationCheck[] = [];

  checks.push({
    checkId: "mc-build-manifest-exists",
    description: "build_manifest.json exists",
    result: buildManifest ? "pass" : "fail",
    detail: buildManifest ? undefined : "build_manifest.json not found",
  });

  if (buildManifest) {
    checks.push({
      checkId: "mc-build-id",
      description: "Build manifest has buildId",
      result: buildManifest.buildId ? "pass" : "fail",
    });
    checks.push({
      checkId: "mc-build-runid",
      description: "Build manifest has runId",
      result: buildManifest.runId ? "pass" : "fail",
    });
    checks.push({
      checkId: "mc-build-source-kit",
      description: "Build manifest has source kit reference",
      result: buildManifest.sourceKit?.kitRoot ? "pass" : "fail",
    });
    checks.push({
      checkId: "mc-build-lifecycle",
      description: "Build manifest has lifecycle events",
      result: buildManifest.lifecycle && buildManifest.lifecycle.length > 0 ? "pass" : "warn",
      detail: buildManifest.lifecycle ? `${buildManifest.lifecycle.length} lifecycle event(s)` : "No lifecycle events",
    });
    checks.push({
      checkId: "mc-build-status",
      description: "Build manifest has status",
      result: buildManifest.status ? "pass" : "fail",
    });
  }

  checks.push({
    checkId: "mc-repo-manifest-exists",
    description: "repo_manifest.json exists",
    result: repoManifest ? "pass" : "fail",
    detail: repoManifest ? undefined : "repo_manifest.json not found",
  });

  if (repoManifest) {
    checks.push({
      checkId: "mc-repo-structure",
      description: "Repo manifest has structure info",
      result: repoManifest.structure?.totalFiles > 0 ? "pass" : "fail",
    });
    checks.push({
      checkId: "mc-repo-inventory",
      description: "Repo manifest has file inventory",
      result: repoManifest.fileInventory && repoManifest.fileInventory.length > 0 ? "pass" : "fail",
    });
    checks.push({
      checkId: "mc-repo-commands",
      description: "Repo manifest has build commands",
      result: repoManifest.commands ? "pass" : "warn",
    });
  }

  const anyFailed = checks.some(c => c.result === "fail");
  return {
    categoryId: "manifest_completeness",
    name: "Manifest Completeness",
    result: anyFailed ? "fail" : "pass",
    checks,
  };
}

function checkFileIntegrity(
  paths: WorkspacePaths,
  repoFiles: { relativePath: string; sizeBytes: number }[]
): VerificationCategory {
  const checks: VerificationCheck[] = [];

  for (const file of repoFiles) {
    const fullPath = join(paths.repo, file.relativePath);

    if (file.sizeBytes === 0) {
      checks.push({
        checkId: `fi-empty-${file.relativePath}`,
        description: `File is non-empty: ${file.relativePath}`,
        result: "fail",
        detail: "File is empty (0 bytes)",
      });
      continue;
    }

    const ext = extname(file.relativePath);
    if (SYNTAX_CHECKABLE_EXTENSIONS.has(ext)) {
      try {
        const content = readFileSync(fullPath, "utf-8");
        JSON.parse(content);
        checks.push({
          checkId: `fi-syntax-${file.relativePath}`,
          description: `Valid syntax: ${file.relativePath}`,
          result: "pass",
        });
      } catch (err: any) {
        checks.push({
          checkId: `fi-syntax-${file.relativePath}`,
          description: `Valid syntax: ${file.relativePath}`,
          result: "fail",
          detail: `JSON parse error: ${err.message}`,
        });
      }
    } else {
      checks.push({
        checkId: `fi-nonempty-${file.relativePath}`,
        description: `File is non-empty: ${file.relativePath}`,
        result: "pass",
      });
    }
  }

  const anyFailed = checks.some(c => c.result === "fail");
  return {
    categoryId: "file_integrity",
    name: "File Integrity",
    result: anyFailed ? "fail" : "pass",
    checks,
  };
}

function checkOutputConsistency(
  buildManifest: BuildManifest | null,
  plan: BuildPlan | null,
  repoFiles: { relativePath: string; sizeBytes: number }[]
): VerificationCategory {
  const checks: VerificationCheck[] = [];

  if (!plan) {
    checks.push({
      checkId: "oc-plan",
      description: "Build plan available for consistency check",
      result: "skip",
      detail: "No build plan — skipping consistency verification",
    });
    return {
      categoryId: "output_consistency",
      name: "Output Consistency",
      result: "skip",
      checks,
    };
  }

  const expectedCount = plan.totalFiles;
  const actualCount = repoFiles.length;
  checks.push({
    checkId: "oc-file-count",
    description: "Generated file count matches plan",
    result: actualCount >= expectedCount ? "pass" : "warn",
    detail: `Expected ${expectedCount} files, found ${actualCount}`,
  });

  if (buildManifest) {
    const requestedMode = buildManifest.request?.outputMode;
    if (requestedMode === "kit_only") {
      checks.push({
        checkId: "oc-mode-kit",
        description: "Output mode is kit_only — repo generation is optional",
        result: "pass",
      });
    } else {
      checks.push({
        checkId: "oc-mode-build",
        description: `Output mode "${requestedMode}" — repo must be generated`,
        result: actualCount > 0 ? "pass" : "fail",
        detail: actualCount > 0 ? undefined : "No files generated for build mode",
      });
    }
  }

  const sliceNames = plan.slices.map(s => s.name);
  checks.push({
    checkId: "oc-slices",
    description: "All build slices present in plan",
    result: sliceNames.length === plan.totalSlices ? "pass" : "warn",
    detail: `${sliceNames.length} slices in plan, expected ${plan.totalSlices}`,
  });

  const anyFailed = checks.some(c => c.result === "fail");
  return {
    categoryId: "output_consistency",
    name: "Output Consistency",
    result: anyFailed ? "fail" : "pass",
    checks,
  };
}
