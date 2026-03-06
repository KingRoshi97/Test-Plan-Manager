import * as path from "path";
import * as fs from "fs";
import type {
  BuildRequest,
  BuildState,
  BuildPlan,
  BuildManifest,
  BuildProgress,
  BuildFailureClass,
  EligibilityResult,
  VerificationReport,
} from "./types.js";
import { generateBuildId, isValidTransition } from "./types.js";
import { checkBuildEligibility } from "./eligibility.js";
import { createBuildPlan, writeBuildPlan } from "./planner.js";
import {
  initWorkspace,
  getWorkspaceStatus,
  type WorkspacePaths,
} from "./workspace.js";
import { generateRepo } from "./generator.js";
import { verifyBuild } from "./verifier.js";
import {
  createBuildManifest,
  recordLifecycleTransition,
  recordFailure,
  updateOutputRefs,
  updateTokenUsage,
  writeBuildManifest,
  createRepoManifest,
  writeRepoManifest,
  createFileIndex,
  writeFileIndex,
  writeAllManifests,
} from "./manifest.js";
import { createExportZip, isExportEligible } from "./packager.js";
import { getRunUsage } from "../usage/tracker.js";

const AXION_BASE = path.resolve("Axion");
const AXION_RUNS_DIR = path.join(AXION_BASE, ".axion", "runs");

export interface BuildResult {
  success: boolean;
  buildId: string;
  state: BuildState;
  runId: string;
  filesGenerated: number;
  verificationPassed: boolean;
  exported: boolean;
  zipPath?: string;
  errors: string[];
  manifest?: BuildManifest;
  verification?: VerificationReport;
}

export type BuildProgressCallback = (progress: BuildProgress) => void;

export async function runBuild(
  request: BuildRequest,
  onProgress?: BuildProgressCallback,
): Promise<BuildResult> {
  const { runId, outputMode } = request;
  const runDir = path.join(AXION_RUNS_DIR, runId);
  const buildId = generateBuildId();

  const result: BuildResult = {
    success: false,
    buildId,
    state: "requested",
    runId,
    filesGenerated: 0,
    verificationPassed: false,
    exported: false,
    errors: [],
  };

  function emitProgress(
    state: BuildState,
    extra: Partial<BuildProgress> = {},
  ): void {
    const progress: BuildProgress = {
      buildId,
      state,
      slicesCompleted: extra.slicesCompleted ?? 0,
      totalSlices: extra.totalSlices ?? 0,
      filesGenerated: extra.filesGenerated ?? 0,
      totalFiles: extra.totalFiles ?? 0,
      startedAt: request.requestedAt,
      updatedAt: new Date().toISOString(),
      ...extra,
    };
    console.log(`BUILD_PROGRESS: ${JSON.stringify(progress)}`);
    onProgress?.(progress);
  }

  if (!fs.existsSync(runDir)) {
    result.errors.push(`Run directory not found: ${runDir}`);
    result.state = "failed";
    emitProgress("failed", { error: result.errors[0], failureClass: "missing_kit" });
    return result;
  }

  console.log(`  [BUILD] Starting build ${buildId} for ${runId} (mode=${outputMode})`);
  emitProgress("requested");

  let manifest = createBuildManifest(
    buildId,
    runId,
    request,
    path.join(runDir, "kit"),
    "",
    "1.0.0",
    { framework: "", language: "typescript", runtime: "node", packageManager: "npm" },
  );

  let paths: WorkspacePaths | null = null;

  try {
    manifest = recordLifecycleTransition(manifest, "approved", "eligibility", "Checking eligibility");
    emitProgress("approved");

    console.log("  [BUILD] Checking eligibility...");
    const eligibility: EligibilityResult = checkBuildEligibility(runId);

    if (!eligibility.eligible) {
      const reason = `Eligibility failed: ${eligibility.blockers.join("; ")}`;
      manifest = recordFailure(manifest, "eligibility", "eligibility", reason, eligibility.blockers);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifestSafe(runDir, manifest);
      emitProgress("failed", { error: reason, failureClass: "eligibility" });
      return result;
    }

    console.log("  [BUILD] Eligibility passed. Planning...");

    let plan: BuildPlan;
    try {
      plan = await createBuildPlan(runDir);
      plan.buildId = buildId;
    } catch (err: any) {
      const reason = `Planning failed: ${err.message}`;
      manifest = recordFailure(manifest, "planning", "planning", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifestSafe(runDir, manifest);
      emitProgress("failed", { error: reason, failureClass: "planning" });
      return result;
    }

    manifest = {
      ...manifest,
      buildProfile: plan.stackProfile,
      sourceKit: {
        ...manifest.sourceKit,
        specId: plan.kitRef,
      },
    };

    console.log(`  [BUILD] Plan ready: ${plan.totalSlices} slices, ${plan.totalFiles} files`);
    manifest = recordLifecycleTransition(manifest, "building", "generation", "Starting repo generation");
    emitProgress("building", { totalSlices: plan.totalSlices, totalFiles: plan.totalFiles });

    try {
      const wsResult = initWorkspace(AXION_BASE, runId);
      paths = wsResult.paths;
    } catch (err: any) {
      const reason = `Workspace init failed: ${err.message}`;
      manifest = recordFailure(manifest, "workspace", "workspace", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifestSafe(runDir, manifest);
      emitProgress("failed", { error: reason, failureClass: "workspace" });
      return result;
    }

    manifest = updateOutputRefs(manifest, {
      repoPath: paths.repo,
      buildPlanPath: paths.buildPlan,
    });

    await writeBuildPlan(runDir, plan);

    let slicesCompleted = 0;
    const genResult = await generateRepo(runDir, plan, paths, (progress) => {
      if (progress.status === "generated" || progress.status === "failed") {
        const completed = plan.slices.filter(s => s.status === "completed").length;
        slicesCompleted = completed;
        emitProgress("building", {
          currentSlice: progress.sliceName,
          slicesCompleted: completed,
          totalSlices: plan.totalSlices,
          filesGenerated: result.filesGenerated + (progress.status === "generated" ? 1 : 0),
          totalFiles: plan.totalFiles,
        });
      }
    });

    result.filesGenerated = genResult.filesGenerated;

    if (!genResult.success) {
      const reason = `Generation had failures: ${genResult.errors.join("; ")}`;
      console.log(`  [BUILD] ${reason}`);
      result.errors.push(...genResult.errors);

      if (genResult.filesGenerated === 0 || genResult.filesFailed > genResult.filesGenerated) {
        manifest = recordFailure(manifest, "generation", "generation", reason, genResult.errors);
        result.state = "failed";
        writeBuildManifest(paths.buildManifest, manifest);
        emitProgress("failed", { error: reason, failureClass: "generation" });
        return result;
      }
    }

    console.log(`  [BUILD] Generation complete: ${genResult.filesGenerated} files generated, ${genResult.filesFailed} failed`);

    console.log("  [BUILD] Writing manifests...");
    const deps = extractDependencies(paths);
    const commands = extractCommands(paths);
    const repoManifest = createRepoManifest(buildId, runId, paths.repo, plan, deps, commands);
    const fileIndex = createFileIndex(buildId, runId, paths.repo, plan);
    manifest = writeAllManifests(paths.root, manifest, repoManifest, fileIndex);

    const usage = getRunUsage(runId);
    if (usage) {
      manifest = updateTokenUsage(manifest, {
        total_prompt_tokens: usage.total_prompt_tokens,
        total_completion_tokens: usage.total_completion_tokens,
        total_tokens: usage.total_tokens,
        total_cost_usd: usage.total_cost_usd,
        api_calls: usage.api_calls,
      });
    }

    manifest = recordLifecycleTransition(manifest, "verifying", "verification", "Running verification");
    emitProgress("verifying", {
      slicesCompleted: plan.totalSlices,
      totalSlices: plan.totalSlices,
      filesGenerated: genResult.filesGenerated,
      totalFiles: plan.totalFiles,
    });

    console.log("  [BUILD] Running verification...");
    let verification: VerificationReport;
    try {
      verification = await verifyBuild(paths, buildId, runId);
      result.verification = verification;
      manifest = updateOutputRefs(manifest, { verificationReportPath: paths.verificationReport });
    } catch (err: any) {
      const reason = `Verification failed: ${err.message}`;
      manifest = recordFailure(manifest, "verification", "verification", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifest(paths.buildManifest, manifest);
      emitProgress("failed", { error: reason, failureClass: "verification" });
      return result;
    }

    result.verificationPassed = verification.overallResult === "pass";

    if (verification.overallResult !== "pass") {
      const failedCategories = verification.categories
        .filter(c => c.result === "fail")
        .map(c => c.name);
      const reason = `Verification did not pass: ${failedCategories.join(", ")}`;
      manifest = recordFailure(manifest, "verification", "verification", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifest(paths.buildManifest, manifest);
      emitProgress("failed", { error: reason, failureClass: "verification" });
      return result;
    }

    manifest = recordLifecycleTransition(manifest, "passed", "verification", "Verification passed");
    emitProgress("passed", {
      slicesCompleted: plan.totalSlices,
      totalSlices: plan.totalSlices,
      filesGenerated: genResult.filesGenerated,
      totalFiles: plan.totalFiles,
    });

    console.log("  [BUILD] Verification passed!");

    if (outputMode === "build_and_export") {
      console.log("  [BUILD] Creating export zip...");
      const exportResult = await createExportZip(paths);

      if (!exportResult.success) {
        const reason = `Export failed: ${exportResult.error}`;
        manifest = recordFailure(manifest, "packaging", "export", reason);
        result.errors.push(reason);
        result.state = "failed";
        writeBuildManifest(paths.buildManifest, manifest);
        emitProgress("failed", { error: reason, failureClass: "packaging" });
        return result;
      }

      manifest = updateOutputRefs(manifest, { exportZipPath: paths.exportZip });
      manifest = recordLifecycleTransition(manifest, "exported", "export", `Zip created: ${exportResult.sizeBytes} bytes, ${exportResult.fileCount} files`);
      result.exported = true;
      result.zipPath = paths.exportZip;
      result.state = "exported";

      console.log(`  [BUILD] Export complete: ${exportResult.sizeBytes} bytes`);
      emitProgress("exported", {
        slicesCompleted: plan.totalSlices,
        totalSlices: plan.totalSlices,
        filesGenerated: genResult.filesGenerated,
        totalFiles: plan.totalFiles,
      });
    } else {
      result.state = "passed";
    }

    result.success = true;
    result.manifest = manifest;
    writeBuildManifest(paths.buildManifest, manifest);

    console.log(`  [BUILD] Build ${buildId} complete: state=${result.state}`);
    return result;
  } catch (err: any) {
    const reason = `Unexpected error: ${err.message}`;
    manifest = recordFailure(manifest, "records", "unknown", reason);
    result.errors.push(reason);
    result.state = "failed";
    if (paths) {
      writeBuildManifest(paths.buildManifest, manifest);
    } else {
      writeBuildManifestSafe(runDir, manifest);
    }
    emitProgress("failed", { error: reason });
    return result;
  }
}

function writeBuildManifestSafe(runDir: string, manifest: BuildManifest): void {
  try {
    const buildDir = path.join(runDir, "build");
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }
    writeBuildManifest(path.join(buildDir, "build_manifest.json"), manifest);
  } catch {}
}

function extractDependencies(paths: WorkspacePaths): Record<string, string> {
  try {
    const pkgPath = path.join(paths.repo, "package.json");
    if (!fs.existsSync(pkgPath)) return {};
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return { ...pkg.dependencies, ...pkg.devDependencies };
  } catch {
    return {};
  }
}

function extractCommands(paths: WorkspacePaths): { install?: string; dev?: string; build?: string; test?: string } {
  try {
    const pkgPath = path.join(paths.repo, "package.json");
    if (!fs.existsSync(pkgPath)) return {};
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const scripts = pkg.scripts ?? {};
    return {
      install: "npm install",
      dev: scripts.dev ? `npm run dev` : undefined,
      build: scripts.build ? `npm run build` : undefined,
      test: scripts.test ? `npm test` : undefined,
    };
  } catch {
    return {};
  }
}
