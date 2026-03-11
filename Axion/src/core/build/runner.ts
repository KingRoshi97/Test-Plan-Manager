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
  KitExtraction,
  RepoBlueprint,
  GenerationStrategyPlan,
  BuildFidelityReport,
} from "./types.js";
import { generateBuildId, isValidTransition } from "./types.js";
import { checkBuildEligibility } from "./eligibility.js";
import { createBuildPlan, writeBuildPlan } from "./planner.js";
import { extractKit, checkExtractionGate } from "./extractor.js";
import { buildRepoBlueprint, checkBlueprintGate } from "./blueprint.js";
import {
  initWorkspace,
  getWorkspaceStatus,
  type WorkspacePaths,
} from "./workspace.js";
import { generateRepo, generateUnitsForRemediation, type RemediationFileContext } from "./generator.js";
import { runGSE } from "./gse.js";
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
import { getRunUsage, setActiveRun } from "../usage/tracker.js";

const AXION_BASE = fs.existsSync(path.resolve("Axion", ".axion"))
  ? path.resolve("Axion")
  : path.resolve(".");
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

  setActiveRun(runId);

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

    console.log("  [BUILD] Eligibility passed. Extracting kit...");

    let extraction: KitExtraction | null = null;
    let blueprint: RepoBlueprint | null = null;

    try {
      extraction = await extractKit(runDir);
      const extractionGate = checkExtractionGate(extraction);
      if (!extractionGate.passed) {
        console.log(`  [BUILD] Kit extraction gate did not pass: ${extractionGate.blockers.join("; ")} — falling back to legacy planning`);
        extraction = null;
      } else {
        const extractionPath = path.join(runDir, "build", "kit_extraction.json");
        manifest = updateOutputRefs(manifest, { kitExtractionPath: extractionPath });
        console.log(`  [BUILD] Kit extraction passed: ${extraction.extraction_coverage_summary.total_extracted_files}/${extraction.extraction_coverage_summary.total_kit_files} files, ${extraction.derived_build_implications.derived_expected_total_file_count} expected repo files`);
      }
    } catch (err: any) {
      console.log(`  [BUILD] Kit extraction error: ${err.message} — falling back to legacy planning`);
      extraction = null;
    }

    if (extraction) {
      console.log("  [BUILD] Building repo blueprint...");
      try {
        blueprint = await buildRepoBlueprint(extraction, runDir);
        const blueprintGate = checkBlueprintGate(blueprint);
        if (!blueprintGate.passed) {
          console.log(`  [BUILD] Blueprint gate did not pass: ${blueprintGate.blockers.join("; ")} — falling back to legacy planning`);
          blueprint = null;
        } else {
          const blueprintPath = path.join(runDir, "build", "repo_blueprint.json");
          manifest = updateOutputRefs(manifest, { repoBlueprintPath: blueprintPath });
          console.log(`  [BUILD] Blueprint ready: ${blueprint.file_inventory.length} files in inventory, ${blueprint.module_map.length} modules, ${blueprint.subsystems.length} subsystems`);
        }
      } catch (err: any) {
        console.log(`  [BUILD] Blueprint derivation error: ${err.message} — falling back to legacy planning`);
        blueprint = null;
      }
    }

    console.log(`  [BUILD] Planning${blueprint ? " from blueprint" : " (legacy mode)"}...`);

    let plan: BuildPlan;
    try {
      plan = await createBuildPlan(runDir, blueprint ?? undefined);
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

    let gsePlan: GenerationStrategyPlan | undefined;
    if (blueprint) {
      try {
        console.log("  [BUILD] Running Generation Strategy Engine (GSE)...");
        gsePlan = await runGSE(blueprint, plan, runDir);

        const unitTypeCounts: Record<string, number> = {};
        for (const u of gsePlan.build_units) {
          unitTypeCounts[u.unit_type] = (unitTypeCounts[u.unit_type] ?? 0) + 1;
        }
        const classCounts: Record<string, number> = { C0: 0, C1: 0, C2: 0, C3: 0, C4: 0 };
        for (const p of gsePlan.complexity_profiles) classCounts[p.complexity_class]++;

        console.log(`  [BUILD] GSE Summary:`);
        console.log(`  [BUILD]   Total units: ${gsePlan.build_units.length}`);
        console.log(`  [BUILD]   Units by type: ${Object.entries(unitTypeCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
        console.log(`  [BUILD]   Complexity: ${Object.entries(classCounts).map(([k, v]) => `${k}=${v}`).join(", ")}`);
        console.log(`  [BUILD]   Waves: ${gsePlan.wave_plan.waves.length}`);
        console.log(`  [BUILD]   Estimated cost: $${gsePlan.cost_forecast.estimated_cost_usd} (~${gsePlan.cost_forecast.total_estimated_tokens.toLocaleString()} tokens)`);
      } catch (err: any) {
        console.log(`  [BUILD] GSE error: ${err.message} — continuing without strategy plan`);
        gsePlan = undefined;
      }
    }

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
    let filesGenCount = 0;
    const genResult = await generateRepo(runDir, plan, paths, (progress) => {
      if (progress.status === "generated" || progress.status === "failed") {
        if (progress.status === "generated") filesGenCount++;
        const completed = plan.slices.filter(s => s.status === "completed").length;
        slicesCompleted = completed;
        emitProgress("building", {
          currentSlice: progress.sliceName,
          slicesCompleted: completed,
          totalSlices: plan.totalSlices,
          filesGenerated: filesGenCount,
          totalFiles: plan.totalFiles,
        });
      }
    }, gsePlan);

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
      verification = await verifyBuild(paths, buildId, runId, gsePlan);
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

    if (verification.fidelity) {
      logBuildSummary(verification.fidelity, blueprint, gsePlan, usage);
    }

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

function logBuildSummary(
  fidelity: BuildFidelityReport,
  blueprint: RepoBlueprint | null,
  gsePlan?: GenerationStrategyPlan,
  usage?: { total_tokens: number; total_cost_usd: number } | null,
): void {
  const profileLabel = blueprint?.build_profile?.profile ?? "unknown";
  const planned = fidelity.planned_files.toLocaleString();
  const generated = fidelity.generated_files.toLocaleString();
  const verified = fidelity.verified_files.toLocaleString();
  const failed = fidelity.failed_files.toLocaleString();
  const fidelityPct = fidelity.fidelity_pct.toFixed(1);
  const deterministicPct = fidelity.deterministic_pct.toFixed(1);
  const deterministicCount = Math.round(fidelity.deterministic_pct * fidelity.generated_files / 100);
  const llmPct = fidelity.llm_usage_pct.toFixed(1);
  const llmCount = fidelity.llm_file_count;

  let miniCount = 0;
  let miniPct = "0.0";
  let fullCount = 0;
  let fullPct = "0.0";

  if (gsePlan) {
    for (const strategy of gsePlan.strategies) {
      const unit = gsePlan.build_units.find(u => u.id === strategy.build_unit_id);
      const fc = unit?.file_ids.length ?? 0;
      if (strategy.generation_mode === "cheap_model") {
        miniCount += fc;
      } else if (strategy.generation_mode === "full_model") {
        fullCount += fc;
      }
    }
    const total = fidelity.generated_files || 1;
    miniPct = ((miniCount / total) * 100).toFixed(1);
    fullPct = ((fullCount / total) * 100).toFixed(1);
  }

  const tokenStr = usage?.total_tokens
    ? `~${Math.round(usage.total_tokens / 1000)}K tokens`
    : "N/A";
  const costStr = usage?.total_cost_usd
    ? `~$${usage.total_cost_usd.toFixed(2)}`
    : gsePlan?.cost_forecast
      ? `~$${gsePlan.cost_forecast.estimated_cost_usd.toFixed(2)} (est.)`
      : "N/A";

  console.log("");
  console.log("  \u2550\u2550\u2550 BUILD SUMMARY \u2550\u2550\u2550");
  console.log(`  Profile:             ${profileLabel}`);
  console.log(`  Planned files:       ${planned}`);
  console.log(`  Generated files:     ${generated}`);
  console.log(`  Verified files:      ${verified}`);
  console.log(`  Failed files:        ${failed}`);
  console.log(`  Generation Fidelity: ${fidelityPct}%`);
  console.log(`  Deterministic:       ${deterministicPct}%  (${deterministicCount} files)`);
  if (gsePlan) {
    console.log(`  LLM (mini):          ${miniPct}%  (${miniCount} files)`);
    console.log(`  LLM (full):          ${fullPct}%  (${fullCount} files)`);
  } else {
    console.log(`  LLM:                 ${llmPct}%  (${llmCount} files)`);
  }
  console.log(`  Est. Token Cost:     ${tokenStr}`);
  console.log(`  Est. Build Cost:     ${costStr}`);
  if (fidelity.structural_violations > 0) {
    console.log(`  Structural Violations: ${fidelity.structural_violations}`);
  }
  console.log("");
}

export interface RemediationResult {
  success: boolean;
  filesRegenerated: number;
  filesFailed: number;
  errors: string[];
  remediationLog: {
    certRunId: string;
    startedAt: string;
    completedAt: string;
    findings: Array<{ id: string; title: string; severity: string }>;
    unitsRemediated: string[];
    filesRegenerated: string[];
    filesFailed: string[];
  };
}

export async function remediateFromReport(
  runId: string,
  certReportPath: string,
  onProgress?: BuildProgressCallback,
): Promise<RemediationResult> {
  const runDir = path.join(AXION_RUNS_DIR, runId);
  const startedAt = new Date().toISOString();

  const result: RemediationResult = {
    success: false,
    filesRegenerated: 0,
    filesFailed: 0,
    errors: [],
    remediationLog: {
      certRunId: "",
      startedAt,
      completedAt: "",
      findings: [],
      unitsRemediated: [],
      filesRegenerated: [],
      filesFailed: [],
    },
  };

  let report: any;
  try {
    report = JSON.parse(fs.readFileSync(certReportPath, "utf-8"));
  } catch (err: any) {
    result.errors.push(`Failed to read certification report: ${err.message}`);
    return result;
  }

  result.remediationLog.certRunId = report.run_id || "";

  const manifest = report.remediation_manifest;
  if (!manifest || !manifest.affected_unit_ids || manifest.affected_unit_ids.length === 0) {
    result.errors.push("No remediation manifest or no affected units found in report");
    return result;
  }

  const buildDir = path.join(runDir, "build");
  const planPath = path.join(buildDir, "build_plan.json");
  const gsePath = path.join(buildDir, "generation_strategy", "generation_strategy.json");

  let plan: BuildPlan;
  let gsePlan: GenerationStrategyPlan;
  try {
    plan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
  } catch (err: any) {
    result.errors.push(`Failed to read build plan: ${err.message}`);
    return result;
  }
  try {
    gsePlan = JSON.parse(fs.readFileSync(gsePath, "utf-8"));
  } catch (err: any) {
    result.errors.push(`Failed to read GSE strategy: ${err.message}`);
    return result;
  }

  const repoDir = path.join(buildDir, "repo");
  const paths: WorkspacePaths = {
    root: buildDir,
    repo: repoDir,
    buildManifest: path.join(buildDir, "manifests", "build_manifest.json"),
    repoManifest: path.join(buildDir, "manifests", "repo_manifest.json"),
    verificationReport: path.join(buildDir, "manifests", "verification_report.json"),
    buildPlan: path.join(buildDir, "build_plan.json"),
    fileIndex: path.join(buildDir, "manifests", "file_index.json"),
    exportZip: path.join(buildDir, "project_repo.zip"),
  };

  const fileRemediationContext = new Map<string, RemediationFileContext[]>();
  const findings = report.findings || [];
  const openFindings = findings.filter((f: any) => f.status === "open" || f.status === "acknowledged");

  for (const finding of openFindings) {
    result.remediationLog.findings.push({
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
    });

    const affectedFiles: string[] = finding.affected_files || [];
    for (const filePath of affectedFiles) {
      const existing = fileRemediationContext.get(filePath) || [];
      existing.push({
        findingTitle: finding.title,
        findingDescription: finding.description || "",
        remediationGuidance: finding.remediation || "Fix the identified issue",
        severity: finding.severity,
      });
      fileRemediationContext.set(filePath, existing);
    }
  }

  const unitIds: string[] = manifest.affected_unit_ids;
  result.remediationLog.unitsRemediated = unitIds;

  console.log(`  [REMEDIATION] Starting remediation for ${unitIds.length} units, driven by ${openFindings.length} findings`);

  onProgress?.({
    buildId: "REMEDIATION",
    state: "building",
    currentSlice: "Remediation",
    slicesCompleted: 0,
    totalSlices: unitIds.length,
    filesGenerated: 0,
    totalFiles: manifest.total_files || 0,
    startedAt,
    updatedAt: new Date().toISOString(),
  });

  try {
    const genResult = await generateUnitsForRemediation(
      runDir,
      plan,
      paths,
      gsePlan,
      unitIds,
      fileRemediationContext,
      (progress) => {
        onProgress?.({
          buildId: "REMEDIATION",
          state: "building",
          currentSlice: `Remediation: ${progress.sliceName}`,
          slicesCompleted: 0,
          totalSlices: unitIds.length,
          filesGenerated: progress.fileIndex,
          totalFiles: manifest.total_files || 0,
          startedAt,
          updatedAt: new Date().toISOString(),
        });
      },
    );

    result.filesRegenerated = genResult.filesGenerated;
    result.filesFailed = genResult.filesFailed;
    result.errors.push(...genResult.errors);
    result.success = genResult.success;

    for (const ur of genResult.unitResults) {
      for (const fp of ur.files_produced) {
        result.remediationLog.filesRegenerated.push(fp.path);
      }
    }
  } catch (err: any) {
    result.errors.push(`Remediation generation failed: ${err.message}`);
  }

  result.remediationLog.completedAt = new Date().toISOString();

  const logPath = path.join(buildDir, "remediation_log.json");
  try {
    fs.writeFileSync(logPath, JSON.stringify(result.remediationLog, null, 2), "utf-8");
    console.log(`  [REMEDIATION] Log written to ${logPath}`);
  } catch {}

  console.log(`  [REMEDIATION] Complete: ${result.filesRegenerated} files regenerated, ${result.filesFailed} failed`);
  return result;
}
