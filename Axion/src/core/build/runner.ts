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
import { generateRepo, fixUnitsFromFindings, type RemediationFileContext, type FixUnitResult } from "./generator.js";
import { BuildAgent, type ResultArtifact } from "../agents/build.js";
import { AVCSStore } from "../avcs/store.js";
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
import { createExportZip, isExportEligible, repackageExportZip } from "./packager.js";
import { getRunUsage, setActiveRun } from "../usage/tracker.js";
import {
  runBAQExtraction,
  checkBAQExtractionGate,
  buildDerivedInputs,
  checkBAQDerivedInputsGate,
  buildRepoInventory,
  checkBAQInventoryGate,
  buildRequirementTraceMap,
  checkBAQTraceabilityGate,
  evaluateSufficiency,
  checkBAQSufficiencyGate,
  validateKitExtraction,
  validateDerivedBuildInputs,
  validateRepoInventory,
  validateRequirementTraceMap,
  validateSufficiencyEvaluation,
  BuildQualityHookRunner,
  createHookContext,
  runPreflightCheck,
  createFileTracker,
  trackGeneratedFile,
  reconcileGeneration,
  evaluateAllGates,
  buildQualityReport,
  writeQualityReport,
  writeFailureReport,
  FailureCollector,
} from "../baq/index.js";
import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
  BAQBuildQualityReport,
  BAQGenerationFailureReport,
  BAQRunStatus,
  FileTracker,
  ReconciliationResult,
  VerificationSignals,
  PackagingSignals,
} from "../baq/index.js";

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
  let baqExtraction: BAQKitExtraction | null = null;
  let baqDerivedInputs: BAQDerivedBuildInputs | null = null;
  let baqInventory: BAQRepoInventory | null = null;
  let baqTraceMap: BAQRequirementTraceMap | null = null;
  let baqSufficiency: BAQSufficiencyEvaluation | null = null;
  let baqFileTracker: FileTracker | null = null;
  let baqReconciliation: ReconciliationResult | null = null;
  let baqVerificationSignals: VerificationSignals | null = null;
  let baqPackagingSignals: PackagingSignals | null = null;
  const baqFailureCollector = new FailureCollector();
  const baqHookRunner = new BuildQualityHookRunner();

  try {
    manifest = recordLifecycleTransition(manifest, "approved", "eligibility", "Checking eligibility");
    emitProgress("approved");

    console.log("  [BUILD] Checking eligibility...");
    const eligibility: EligibilityResult = checkBuildEligibility(runId);

    if (!eligibility.eligible) {
      const reason = `Eligibility failed: ${eligibility.blockers.join("; ")}`;
      baqFailureCollector.addFromError("eligibility", "generation_failure", reason, "critical", {
        failingUnit: "eligibility_check",
        retryClassification: "repair_then_retry" as const,
        repairHints: eligibility.blockers,
      });
      manifest = recordFailure(manifest, "eligibility", "eligibility", reason, eligibility.blockers);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifestSafe(runDir, manifest);
      emitProgress("failed", { error: reason, failureClass: "eligibility" });
      emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, null, null, baqFailureCollector, "failed", baqHookRunner);
      return result;
    }

    console.log("  [BUILD] Eligibility passed. Initializing workspace...");

    try {
      const wsResult = initWorkspace(AXION_BASE, runId);
      paths = wsResult.paths;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const reason = `Workspace init failed: ${message}`;
      baqFailureCollector.addFromError("workspace", "generation_failure", reason, "critical", {
        failingUnit: "workspace_init",
        retryClassification: "safe_retry" as const,
        repairHints: ["Check disk space and permissions"],
      });
      manifest = recordFailure(manifest, "workspace", "workspace", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifestSafe(runDir, manifest);
      emitProgress("failed", { error: reason, failureClass: "workspace" });
      emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, null, null, baqFailureCollector, "failed", baqHookRunner);
      return result;
    }

    console.log("  [BUILD] Extracting kit...");

    let extraction: KitExtraction | null = null;
    let blueprint: RepoBlueprint | null = null;

    baqHookRunner.register("onBuildAuthorityLoaded", (ctx) => ({
      hook_name: "onBuildAuthorityLoaded",
      success: true,
      blocking: false,
      evidence: [{ evidence_id: "auth-loaded", type: "build_authority", path: runDir, detail: { run_id: runId, build_id: buildId } }],
      warnings: [],
      errors: [],
      timestamp: new Date().toISOString(),
    }));

    baqHookRunner.register("onKitExtractionStart", (ctx) => ({
      hook_name: "onKitExtractionStart",
      success: true,
      blocking: false,
      evidence: [{ evidence_id: "extraction-start", type: "extraction_lifecycle", path: runDir, detail: { phase: "start" } }],
      warnings: [],
      errors: [],
      timestamp: new Date().toISOString(),
    }));

    baqHookRunner.register("onKitExtractionComplete", (ctx) => {
      const ext = ctx.extraction;
      if (!ext) {
        return {
          hook_name: "onKitExtractionComplete",
          success: false,
          blocking: true,
          evidence: [],
          warnings: [],
          errors: ["BAQ extraction artifact is null"],
          timestamp: new Date().toISOString(),
        };
      }
      const gate = checkBAQExtractionGate(ext);
      return {
        hook_name: "onKitExtractionComplete",
        success: gate.passed,
        blocking: !gate.passed,
        evidence: [{
          evidence_id: "extraction-gate",
          type: "gate_result",
          path: path.join(runDir, "kit_extraction.json"),
          detail: {
            gate_id: gate.gate_id,
            passed: gate.passed,
            blockers: gate.blockers,
            consumed: ext.summary.consumed_count,
            total: ext.summary.total_sections,
          },
        }],
        warnings: gate.blockers.length > 0 ? gate.blockers : [],
        errors: gate.passed ? [] : gate.blockers,
        timestamp: new Date().toISOString(),
      };
    });

    baqHookRunner.register("onDerivedInputsBuild", (ctx) => {
      const derived = ctx.derived_inputs;
      if (!derived) {
        return {
          hook_name: "onDerivedInputsBuild",
          success: false,
          blocking: true,
          evidence: [],
          warnings: [],
          errors: ["BAQ derived inputs artifact is null"],
          timestamp: new Date().toISOString(),
        };
      }
      const gate = checkBAQDerivedInputsGate(derived);
      return {
        hook_name: "onDerivedInputsBuild",
        success: gate.passed,
        blocking: !gate.passed,
        evidence: [{
          evidence_id: "derived-inputs-gate",
          type: "gate_result",
          path: path.join(runDir, "derived_build_inputs.json"),
          detail: {
            gate_id: gate.gate_id,
            passed: gate.passed,
            blockers: gate.blockers,
            completeness: derived.summary.derivation_completeness,
          },
        }],
        warnings: gate.blockers.length > 0 ? gate.blockers : [],
        errors: gate.passed ? [] : gate.blockers,
        timestamp: new Date().toISOString(),
      };
    });

    baqHookRunner.register("onRepoInventoryPlan", (ctx) => {
      const inv = ctx.inventory;
      if (!inv) {
        return {
          hook_name: "onRepoInventoryPlan",
          success: false,
          blocking: true,
          evidence: [],
          warnings: [],
          errors: ["BAQ repo inventory artifact is null"],
          timestamp: new Date().toISOString(),
        };
      }
      const gate = checkBAQInventoryGate(inv);
      return {
        hook_name: "onRepoInventoryPlan",
        success: gate.passed,
        blocking: !gate.passed,
        evidence: [{
          evidence_id: "inventory-gate",
          type: "gate_result",
          path: path.join(runDir, "repo_inventory.json"),
          detail: {
            gate_id: gate.gate_id,
            passed: gate.passed,
            blockers: gate.blockers,
            total_files: inv.summary.total_files,
            total_modules: inv.summary.total_modules,
          },
        }],
        warnings: gate.blockers.length > 0 ? gate.blockers : [],
        errors: gate.passed ? [] : gate.blockers,
        timestamp: new Date().toISOString(),
      };
    });

    baqHookRunner.register("onRequirementTraceBuild", (ctx) => {
      const tm = ctx.trace_map;
      if (!tm) {
        return {
          hook_name: "onRequirementTraceBuild",
          success: false,
          blocking: true,
          evidence: [],
          warnings: [],
          errors: ["BAQ requirement trace map artifact is null"],
          timestamp: new Date().toISOString(),
        };
      }
      const gate = checkBAQTraceabilityGate(tm);
      return {
        hook_name: "onRequirementTraceBuild",
        success: gate.passed,
        blocking: false,
        evidence: [{
          evidence_id: "traceability-gate",
          type: "gate_result",
          path: path.join(runDir, "requirement_trace_map.json"),
          detail: {
            gate_id: gate.gate_id,
            passed: gate.passed,
            blockers: gate.blockers,
            coverage_percent: tm.summary.coverage_percent,
            total_requirements: tm.summary.total_requirements,
            phase: "pre_generation",
          },
        }],
        warnings: gate.blockers.length > 0 ? gate.blockers : [],
        errors: [],
        timestamp: new Date().toISOString(),
      };
    });

    baqHookRunner.register("onSufficiencyEvaluation", (ctx) => {
      if (!baqSufficiency) {
        return {
          hook_name: "onSufficiencyEvaluation",
          success: false,
          blocking: true,
          evidence: [],
          warnings: [],
          errors: ["BAQ sufficiency evaluation artifact is null"],
          timestamp: new Date().toISOString(),
        };
      }
      const gate = checkBAQSufficiencyGate(baqSufficiency);
      return {
        hook_name: "onSufficiencyEvaluation",
        success: gate.passed,
        blocking: false,
        evidence: [{
          evidence_id: "sufficiency-gate",
          type: "gate_result",
          path: path.join(runDir, "sufficiency_evaluation.json"),
          detail: {
            gate_id: gate.gate_id,
            passed: gate.passed,
            blockers: gate.blockers,
            overall_score: baqSufficiency.overall_score,
            status: baqSufficiency.status,
            critical_gaps: baqSufficiency.summary.critical_gaps,
            phase: "pre_generation",
          },
        }],
        warnings: gate.blockers.length > 0 ? gate.blockers : [],
        errors: gate.passed ? [] : gate.blockers,
        timestamp: new Date().toISOString(),
      };
    });

    const authorityCtx = createHookContext("onBuildAuthorityLoaded", runId, buildId);
    await baqHookRunner.run("onBuildAuthorityLoaded", authorityCtx);

    const extractionStartCtx = createHookContext("onKitExtractionStart", runId, buildId);
    await baqHookRunner.run("onKitExtractionStart", extractionStartCtx);

    baqExtraction = runBAQExtraction(runDir);
    const baqValidation = validateKitExtraction(baqExtraction);
    if (!baqValidation.valid) {
      const validationErrors = baqValidation.errors.filter(e => e.severity === "error").map(e => e.message).join("; ");
      console.log(`  [BAQ] BLOCKED — Extraction validation failed: ${validationErrors}`);
      throw new Error(`BAQ extraction validation failed: ${validationErrors}`);
    }

    fs.writeFileSync(
      path.join(runDir, "kit_extraction.json"),
      JSON.stringify(baqExtraction, null, 2),
      "utf-8",
    );

    const extractionCompleteCtx = createHookContext("onKitExtractionComplete", runId, buildId, { extraction: baqExtraction });
    const extractionHookResult = await baqHookRunner.run("onKitExtractionComplete", extractionCompleteCtx);

    if (extractionHookResult && !extractionHookResult.success && extractionHookResult.blocking) {
      const hookErrors = extractionHookResult.errors.join("; ");
      console.log(`  [BAQ] BLOCKED — hook onKitExtractionComplete failed: ${hookErrors}`);
      throw new Error(`BAQ extraction hook blocked: ${hookErrors}`);
    }

    const baqGate = checkBAQExtractionGate(baqExtraction);
    console.log(`  [BAQ] Extraction: ${baqExtraction.summary.consumed_count}/${baqExtraction.summary.total_sections} sections consumed, result=${baqExtraction.extraction_result}, gate=${baqGate.passed ? "PASS" : "FAIL"}`);

    if (!baqGate.passed) {
      const gateBlockers = baqGate.blockers.join("; ");
      console.log(`  [BAQ] BLOCKED — Extraction gate G-BQ-01 failed: ${gateBlockers}`);
      throw new Error(`BAQ gate G-BQ-01 blocked: ${gateBlockers}`);
    }

    baqDerivedInputs = buildDerivedInputs(baqExtraction, runDir);
    const derivedValidation = validateDerivedBuildInputs(baqDerivedInputs);
    if (!derivedValidation.valid) {
      const validationErrors = derivedValidation.errors.filter(e => e.severity === "error").map(e => e.message).join("; ");
      console.log(`  [BAQ] BLOCKED — Derived inputs validation failed: ${validationErrors}`);
      throw new Error(`BAQ derived inputs validation failed: ${validationErrors}`);
    }

    fs.writeFileSync(
      path.join(runDir, "derived_build_inputs.json"),
      JSON.stringify(baqDerivedInputs, null, 2),
      "utf-8",
    );

    const derivedCtx = createHookContext("onDerivedInputsBuild", runId, buildId, {
      extraction: baqExtraction,
      derived_inputs: baqDerivedInputs,
    });
    const derivedHookResult = await baqHookRunner.run("onDerivedInputsBuild", derivedCtx);

    if (derivedHookResult && !derivedHookResult.success && derivedHookResult.blocking) {
      const hookErrors = derivedHookResult.errors.join("; ");
      console.log(`  [BAQ] BLOCKED — hook onDerivedInputsBuild failed: ${hookErrors}`);
      throw new Error(`BAQ derived inputs hook blocked: ${hookErrors}`);
    }

    const derivedGate = checkBAQDerivedInputsGate(baqDerivedInputs);
    console.log(`  [BAQ] Derived inputs: ${baqDerivedInputs.summary.feature_count} features, ${baqDerivedInputs.summary.subsystem_count} subsystems, ${baqDerivedInputs.summary.entity_count} entities, completeness=${baqDerivedInputs.summary.derivation_completeness}%, gate=${derivedGate.passed ? "PASS" : "FAIL"}`);

    if (!derivedGate.passed) {
      const gateBlockers = derivedGate.blockers.join("; ");
      console.log(`  [BAQ] BLOCKED — Derived inputs gate G-BQ-02 failed: ${gateBlockers}`);
      throw new Error(`BAQ gate G-BQ-02 blocked: ${gateBlockers}`);
    }

    console.log("  [BAQ] Building repo inventory...");
    baqInventory = buildRepoInventory(baqDerivedInputs, runDir);
    const inventoryValidation = validateRepoInventory(baqInventory);
    if (!inventoryValidation.valid) {
      const validationErrors = inventoryValidation.errors.filter(e => e.severity === "error").map(e => e.message).join("; ");
      console.log(`  [BAQ] BLOCKED — Repo inventory validation failed: ${validationErrors}`);
      throw new Error(`BAQ repo inventory validation failed: ${validationErrors}`);
    }

    fs.writeFileSync(
      path.join(runDir, "repo_inventory.json"),
      JSON.stringify(baqInventory, null, 2),
      "utf-8",
    );

    const inventoryCtx = createHookContext("onRepoInventoryPlan", runId, buildId, {
      extraction: baqExtraction,
      derived_inputs: baqDerivedInputs,
      inventory: baqInventory,
    });
    const inventoryHookResult = await baqHookRunner.run("onRepoInventoryPlan", inventoryCtx);

    if (inventoryHookResult && !inventoryHookResult.success && inventoryHookResult.blocking) {
      const hookErrors = inventoryHookResult.errors.join("; ");
      console.log(`  [BAQ] BLOCKED — hook onRepoInventoryPlan failed: ${hookErrors}`);
      throw new Error(`BAQ inventory hook blocked: ${hookErrors}`);
    }

    const inventoryGate = checkBAQInventoryGate(baqInventory);
    console.log(`  [BAQ] Repo inventory: ${baqInventory.summary.total_files} files, ${baqInventory.summary.total_modules} modules, ${baqInventory.summary.total_directories} dirs, gate=${inventoryGate.passed ? "PASS" : "FAIL"}`);

    if (!inventoryGate.passed) {
      const gateBlockers = inventoryGate.blockers.join("; ");
      console.log(`  [BAQ] BLOCKED — Inventory gate G-BQ-03 failed: ${gateBlockers}`);
      throw new Error(`BAQ gate G-BQ-03 blocked: ${gateBlockers}`);
    }

    console.log("  [BAQ] Building requirement trace map...");
    baqTraceMap = buildRequirementTraceMap(baqDerivedInputs, baqInventory);
    const traceValidation = validateRequirementTraceMap(baqTraceMap);
    if (!traceValidation.valid) {
      const validationErrors = traceValidation.errors.filter(e => e.severity === "error").map(e => e.message).join("; ");
      console.log(`  [BAQ] BLOCKED — Trace map validation failed: ${validationErrors}`);
      throw new Error(`BAQ trace map validation failed: ${validationErrors}`);
    }

    fs.writeFileSync(
      path.join(runDir, "requirement_trace_map.json"),
      JSON.stringify(baqTraceMap, null, 2),
      "utf-8",
    );

    const traceCtx = createHookContext("onRequirementTraceBuild", runId, buildId, {
      extraction: baqExtraction,
      derived_inputs: baqDerivedInputs,
      inventory: baqInventory,
      trace_map: baqTraceMap,
    });
    const traceHookResult = await baqHookRunner.run("onRequirementTraceBuild", traceCtx);

    if (traceHookResult && !traceHookResult.success && traceHookResult.blocking) {
      const hookErrors = traceHookResult.errors.join("; ");
      console.log(`  [BAQ] BLOCKED — hook onRequirementTraceBuild failed: ${hookErrors}`);
      throw new Error(`BAQ traceability hook blocked: ${hookErrors}`);
    }

    const traceGate = checkBAQTraceabilityGate(baqTraceMap);
    console.log(`  [BAQ] Traceability (pre-generation): ${baqTraceMap.summary.fully_covered} fully / ${baqTraceMap.summary.partially_covered} partial / ${baqTraceMap.summary.not_covered} uncovered, coverage=${baqTraceMap.summary.coverage_percent}%, gate=${traceGate.passed ? "PASS" : "ADVISORY_FAIL"}`);

    if (!traceGate.passed) {
      const gateBlockers = traceGate.blockers.join("; ");
      console.log(`  [BAQ] ADVISORY — Pre-generation traceability gate G-BQ-03: ${gateBlockers}`);
      console.log(`  [BAQ] Proceeding to generation — traceability will be re-evaluated post-generation`);
    }

    console.log("  [BAQ] Evaluating sufficiency...");
    baqSufficiency = evaluateSufficiency(baqDerivedInputs, baqInventory, baqTraceMap);
    const sufficiencyValidation = validateSufficiencyEvaluation(baqSufficiency);
    if (!sufficiencyValidation.valid) {
      const validationErrors = sufficiencyValidation.errors.filter(e => e.severity === "error").map(e => e.message).join("; ");
      console.log(`  [BAQ] BLOCKED — Sufficiency evaluation validation failed: ${validationErrors}`);
      throw new Error(`BAQ sufficiency evaluation validation failed: ${validationErrors}`);
    }

    fs.writeFileSync(
      path.join(runDir, "sufficiency_evaluation.json"),
      JSON.stringify(baqSufficiency, null, 2),
      "utf-8",
    );

    const sufficiencyCtx = createHookContext("onSufficiencyEvaluation", runId, buildId, {
      extraction: baqExtraction,
      derived_inputs: baqDerivedInputs,
      inventory: baqInventory,
      trace_map: baqTraceMap,
    });
    const sufficiencyHookResult = await baqHookRunner.run("onSufficiencyEvaluation", sufficiencyCtx);

    if (sufficiencyHookResult && !sufficiencyHookResult.success && sufficiencyHookResult.blocking) {
      const hookErrors = sufficiencyHookResult.errors.join("; ");
      console.log(`  [BAQ] BLOCKED — hook onSufficiencyEvaluation failed: ${hookErrors}`);
      throw new Error(`BAQ sufficiency hook blocked: ${hookErrors}`);
    }

    const sufficiencyGate = checkBAQSufficiencyGate(baqSufficiency);
    console.log(`  [BAQ] Sufficiency (pre-generation): score=${baqSufficiency.overall_score}%, status=${baqSufficiency.status}, ${baqSufficiency.summary.passing_dimensions}/${baqSufficiency.summary.total_dimensions} dimensions passing, ${baqSufficiency.summary.critical_gaps} critical gaps, gate=${sufficiencyGate.passed ? "PASS" : "ADVISORY_FAIL"}`);

    if (!sufficiencyGate.passed) {
      const gateBlockers = sufficiencyGate.blockers.join("; ");
      console.log(`  [BAQ] ADVISORY — Pre-generation sufficiency gate G-BQ-03: ${gateBlockers}`);
      console.log(`  [BAQ] Proceeding to generation — sufficiency will be re-evaluated post-generation`);
    }

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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const reason = `Planning failed: ${message}`;
      baqFailureCollector.addFromError("planning", "planning_failure", reason, "critical", {
        failingUnit: "build_planning",
        retryClassification: "repair_then_retry" as const,
        repairHints: ["Check upstream artifacts and build configuration"],
      });
      manifest = recordFailure(manifest, "planning", "planning", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifestSafe(runDir, manifest);
      emitProgress("failed", { error: reason, failureClass: "planning" });
      emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, null, null, baqFailureCollector, "failed", baqHookRunner);
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

    console.log("  [BAQ] Running preflight check...");
    const baqPreflight = runPreflightCheck(runDir);
    if (!baqPreflight.passed) {
      const missing = baqPreflight.missing.join(", ");
      const invalid = baqPreflight.invalid.join(", ");
      const reason = `Preflight failed: missing=[${missing}] invalid=[${invalid}]`;
      console.log(`  [BAQ] Preflight FAILED — ${reason}`);
      baqFailureCollector.addFromError("preflight", "generation_failure", reason, "critical", {
        failingUnit: "preflight_check",
        expectedArtifacts: ["kit_extraction.json", "derived_build_inputs.json", "repo_inventory.json", "requirement_trace_map.json", "sufficiency_evaluation.json"],
        missingArtifacts: baqPreflight.missing.map(n => `${n}.json`),
        retryClassification: "repair_then_retry" as const,
        upstreamBlockers: baqPreflight.missing,
        repairHints: ["Re-run upstream pipeline stages to produce missing artifacts"],
      });
      manifest = recordFailure(manifest, "preflight", "preflight", reason, [reason]);
      result.state = "failed";
      writeBuildManifest(paths.buildManifest, manifest);
      emitProgress("failed", { error: reason, failureClass: "preflight" });
      emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, null, null, baqFailureCollector, "failed", baqHookRunner);
      return result;
    }
    console.log("  [BAQ] Preflight passed — all upstream artifacts present and valid");

    if (baqInventory) {
      baqFileTracker = createFileTracker(baqInventory);
    }

    const pregenCtx = createHookContext("beforeGenerationStart", runId, buildId, {
      extraction: baqExtraction,
      derived_inputs: baqDerivedInputs,
      inventory: baqInventory,
      trace_map: baqTraceMap,
    });
    const pregenHookResult = await baqHookRunner.run("beforeGenerationStart", pregenCtx);

    if (pregenHookResult && !pregenHookResult.success && pregenHookResult.blocking) {
      const hookErrors = pregenHookResult.errors.join("; ");
      console.log(`  [BAQ] BLOCKED — hook beforeGenerationStart failed: ${hookErrors}`);
      baqFailureCollector.addFromError("beforeGenerationStart", "generation_failure", `Pre-generation hook blocked: ${hookErrors}`, "critical");
      throw new Error(`BAQ pre-generation hook blocked: ${hookErrors}`);
    }

    manifest = recordLifecycleTransition(manifest, "building", "generation", "Starting repo generation");
    emitProgress("building", { totalSlices: plan.totalSlices, totalFiles: plan.totalFiles });

    manifest = updateOutputRefs(manifest, {
      repoPath: paths.repo,
      buildPlanPath: paths.buildPlan,
    });

    await writeBuildPlan(runDir, plan);

    let slicesCompleted = 0;
    let filesGenCount = 0;
    const genResult = await generateRepo(runDir, plan, paths, (progress) => {
      if (progress.status === "generated" || progress.status === "failed") {
        if (progress.status === "generated") {
          filesGenCount++;
          if (baqFileTracker && paths) {
            try {
              const filePath = progress.filePath;
              const fullPath = path.join(paths.repo, filePath);
              const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf-8") : "";
              trackGeneratedFile(baqFileTracker, filePath, content);
              const perFileCtx = createHookContext("onFileGenerated", runId, buildId, {
                metadata: {
                  file_path: filePath,
                  byte_count: Buffer.byteLength(content, "utf-8"),
                  planned: baqFileTracker.planned_files.has(filePath),
                },
              });
              baqHookRunner.run("onFileGenerated", perFileCtx).catch(() => {});
            } catch {}
          }
        } else if (progress.status === "failed") {
          baqFailureCollector.addFromError(
            "generation",
            "generation_failure",
            `File generation failed: ${progress.filePath}`,
            "warning",
            {
              failingUnit: progress.filePath,
              retryClassification: "safe_retry" as const,
              repairHints: ["Re-run generation for this file"],
            },
          );
          const failCtx = createHookContext("onGenerationFailure", runId, buildId, {
            metadata: {
              file_path: progress.filePath,
              error: `File generation failed: ${progress.filePath}`,
            },
          });
          baqHookRunner.run("onGenerationFailure", failCtx).catch(() => {});
        }
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
        baqFailureCollector.addFromError("generation", "generation_failure", reason, "critical", {
          failingUnit: "generation_pipeline",
          retryClassification: "repair_then_retry" as const,
          repairHints: ["Check generation configuration", "Review upstream artifact quality"],
        });
        manifest = recordFailure(manifest, "generation", "generation", reason, genResult.errors);
        result.state = "failed";
        writeBuildManifest(paths.buildManifest, manifest);
        emitProgress("failed", { error: reason, failureClass: "generation" });

        emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, null, null, baqFailureCollector, "failed", baqHookRunner);
        return result;
      }
    }

    console.log(`  [BUILD] Generation complete: ${genResult.filesGenerated} files generated, ${genResult.filesFailed} failed`);

    if (baqFileTracker) {
      baqReconciliation = reconcileGeneration(baqFileTracker);
      console.log(`  [BAQ] Reconciliation: ${baqReconciliation.total_generated}/${baqReconciliation.total_planned} files (${baqReconciliation.coverage_percent}%), missing=${baqReconciliation.total_missing}, unplanned=${baqReconciliation.total_unplanned}, violations=${baqReconciliation.violations.length}`);

      if (baqReconciliation.missing_required_files.length > 0) {
        baqFailureCollector.addFromError(
          "reconciliation",
          "generation_failure",
          `Missing required files: ${baqReconciliation.missing_required_files.join(", ")}`,
          "error",
        );
      }
    }

    const genCompleteCtx = createHookContext("onGenerationComplete", runId, buildId, {
      extraction: baqExtraction,
      derived_inputs: baqDerivedInputs,
      inventory: baqInventory,
      trace_map: baqTraceMap,
    });
    await baqHookRunner.run("onGenerationComplete", genCompleteCtx);

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
      baqFailureCollector.addFromError("verification", "verification_failure", reason, "critical");
      manifest = recordFailure(manifest, "verification", "verification", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifest(paths.buildManifest, manifest);
      emitProgress("failed", { error: reason, failureClass: "verification" });

      emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, null, null, baqFailureCollector, "failed", baqHookRunner);
      return result;
    }

    result.verificationPassed = verification.overallResult === "pass";

    baqVerificationSignals = {
      verification_passed: verification.overallResult === "pass",
      files_verified: verification.fidelity?.verified_files ?? genResult.filesGenerated,
      files_failed: verification.fidelity?.failed_files ?? genResult.filesFailed,
      structural_violations: verification.fidelity?.structural_violations ?? 0,
      fidelity_percent: verification.fidelity?.fidelity_pct ?? 0,
    };

    const verifyReconcileCtx = createHookContext("onVerificationReconcile", runId, buildId, {
      extraction: baqExtraction,
      derived_inputs: baqDerivedInputs,
      inventory: baqInventory,
      trace_map: baqTraceMap,
    });
    await baqHookRunner.run("onVerificationReconcile", verifyReconcileCtx);

    if (verification.overallResult !== "pass") {
      const failedCategories = verification.categories
        .filter(c => c.result === "fail")
        .map(c => c.name);
      const reason = `Verification did not pass: ${failedCategories.join(", ")}`;
      baqFailureCollector.addFromError("verification", "verification_failure", reason, "error");
      manifest = recordFailure(manifest, "verification", "verification", reason);
      result.errors.push(reason);
      result.state = "failed";
      writeBuildManifest(paths.buildManifest, manifest);
      emitProgress("failed", { error: reason, failureClass: "verification" });

      emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, baqVerificationSignals, null, baqFailureCollector, "failed", baqHookRunner);
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
      const prePackagingGateEval = evaluateAllGates({
        extraction: baqExtraction,
        derivedInputs: baqDerivedInputs,
        inventory: baqInventory,
        traceMap: baqTraceMap,
        sufficiency: baqSufficiency,
        reconciliation: baqReconciliation,
        verificationSignals: baqVerificationSignals,
        packagingSignals: null,
      });

      const prePackagingGatesExcludingBQ07 = prePackagingGateEval.gates
        .filter(g => g.gate_id !== "G-BQ-07");
      const prePackagingAllPassed = prePackagingGatesExcludingBQ07.every(g => g.status === "pass");

      if (!prePackagingAllPassed) {
        const failedGates = prePackagingGatesExcludingBQ07
          .filter(g => g.status === "fail")
          .map(g => `${g.gate_id} (${g.gate_name})`);
        const reason = `Packaging blocked — gate(s) failed: ${failedGates.join(", ")}`;
        console.log(`  [BAQ] ${reason}`);
        baqFailureCollector.addFromError("packaging", "packaging_failure", reason, "critical", {
          failingUnit: "gate_enforcement",
          retryClassification: "repair_then_retry" as const,
          repairHints: failedGates.map(g => `Fix failing gate: ${g}`),
        });

        baqPackagingSignals = { export_attempted: false, export_success: false, file_count: 0, zip_size_bytes: 0 };
        manifest = recordLifecycleTransition(manifest, "passed", "packaging_blocked", reason);
        result.state = "passed";
        writeBuildManifest(paths.buildManifest, manifest);

        emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, baqVerificationSignals, baqPackagingSignals, baqFailureCollector, "verification_complete", baqHookRunner);
        return result;
      }

      console.log("  [BAQ] All gates passed — packaging eligible");
      console.log("  [BUILD] Creating export zip...");
      const exportResult = await createExportZip(paths);

      if (!exportResult.success) {
        const reason = `Export failed: ${exportResult.error}`;
        baqFailureCollector.addFromError("packaging", "packaging_failure", reason, "critical");
        manifest = recordFailure(manifest, "packaging", "export", reason);
        result.errors.push(reason);
        result.state = "failed";
        writeBuildManifest(paths.buildManifest, manifest);
        emitProgress("failed", { error: reason, failureClass: "packaging" });

        emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, baqVerificationSignals, { export_attempted: true, export_success: false, file_count: 0, zip_size_bytes: 0 }, baqFailureCollector, "failed", baqHookRunner);
        return result;
      }

      baqPackagingSignals = {
        export_attempted: true,
        export_success: true,
        file_count: exportResult.fileCount,
        zip_size_bytes: exportResult.sizeBytes,
      };

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
      baqPackagingSignals = {
        export_attempted: false,
        export_success: false,
        file_count: 0,
        zip_size_bytes: 0,
      };
      result.state = "passed";
    }

    emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, baqVerificationSignals, baqPackagingSignals, baqFailureCollector, result.state === "exported" ? "packaging_complete" : "verification_complete", baqHookRunner);

    result.success = true;
    result.manifest = manifest;
    writeBuildManifest(paths.buildManifest, manifest);

    console.log(`  [BUILD] Build ${buildId} complete: state=${result.state}`);
    return result;
  } catch (err: any) {
    const reason = `Unexpected error: ${err.message}`;
    baqFailureCollector.addFromError("unexpected", "generation_failure", reason, "critical");
    manifest = recordFailure(manifest, "records", "unknown", reason);
    result.errors.push(reason);
    result.state = "failed";
    if (paths) {
      writeBuildManifest(paths.buildManifest, manifest);
    } else {
      writeBuildManifestSafe(runDir, manifest);
    }
    emitProgress("failed", { error: reason });

    try {
      emitBAQFinalReports(runDir, runId, buildId, baqExtraction, baqDerivedInputs, baqInventory, baqTraceMap, baqSufficiency, baqReconciliation, baqVerificationSignals, baqPackagingSignals, baqFailureCollector, "failed", baqHookRunner);
    } catch {}

    return result;
  }
}

function emitBAQFinalReports(
  runDir: string,
  runId: string,
  buildId: string,
  extraction: BAQKitExtraction | null,
  derivedInputs: BAQDerivedBuildInputs | null,
  inventory: BAQRepoInventory | null,
  traceMap: BAQRequirementTraceMap | null,
  sufficiency: BAQSufficiencyEvaluation | null,
  reconciliation: ReconciliationResult | null,
  verificationSignals: VerificationSignals | null,
  packagingSignals: PackagingSignals | null,
  failureCollector: FailureCollector,
  buildStatus: BAQRunStatus,
  hookRunner?: BuildQualityHookRunner,
): void {
  try {
    const gateEvaluation = evaluateAllGates({
      extraction,
      derivedInputs,
      inventory,
      traceMap,
      sufficiency,
      reconciliation,
      verificationSignals,
      packagingSignals,
    });

    const qualityReport = buildQualityReport({
      runId,
      buildId,
      extraction,
      derivedInputs,
      inventory,
      traceMap,
      sufficiency,
      gateEvaluation,
      reconciliation,
      verificationSignals,
      buildStatus,
    });

    const qualityReportPath = writeQualityReport(runDir, qualityReport);
    console.log(`  [BAQ] Quality report written: ${qualityReportPath} (score=${qualityReport.overall_quality_score}%, decision=${qualityReport.decision}, gates=${gateEvaluation.passed_count}/${gateEvaluation.total} passed)`);

    let failureReport = null;
    if (failureCollector.count() > 0) {
      failureReport = failureCollector.finalize(runId, buildId);
      const failureReportPath = writeFailureReport(runDir, failureReport);
      console.log(`  [BAQ] Failure report written: ${failureReportPath} (${failureReport.summary.total_failures} failures, ${failureReport.summary.blocking_count} blocking)`);
    }

    if (hookRunner) {
      const finalizeCtx = createHookContext("onBuildQualityFinalize", runId, buildId, {
        extraction,
        derived_inputs: derivedInputs,
        inventory,
        trace_map: traceMap,
        quality_report: qualityReport,
        failure_report: failureReport,
        metadata: {
          decision: qualityReport.decision,
          quality_score: qualityReport.overall_quality_score,
          gates_passed: gateEvaluation.passed_count,
          gates_total: gateEvaluation.total,
          build_status: buildStatus,
        },
      });
      hookRunner.run("onBuildQualityFinalize", finalizeCtx).catch(() => {});

      if (buildStatus === "failed" && failureCollector.count() > 0) {
        const genFailCtx = createHookContext("onGenerationFailure", runId, buildId, {
          extraction,
          derived_inputs: derivedInputs,
          inventory,
          trace_map: traceMap,
          failure_report: failureReport,
          metadata: {
            build_status: buildStatus,
            failure_count: failureCollector.count(),
            has_blocking: failureCollector.hasBlockingFailures(),
          },
        });
        hookRunner.run("onGenerationFailure", genFailCtx).catch(() => {});
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  [BAQ] Failed to emit final reports: ${message}`);
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
    baAgentId: string;
    guardrailResults: Array<{ guardrail_id: string; passed: boolean; message: string }>;
    startedAt: string;
    completedAt: string;
    findings: Array<{ id: string; title: string; severity: string }>;
    unitsRemediated: string[];
    filesFixed: string[];
    filesUnchanged: string[];
    filesFailed: string[];
    resultArtifacts: ResultArtifact[];
    fileDetails: Array<{
      filePath: string;
      status: string;
      fixMethod?: string;
      diffStats?: { linesAdded: number; linesRemoved: number; linesUnchanged: number };
      preservationGates?: Array<{ gate_id: string; passed: boolean; message: string }>;
      error?: string;
    }>;
    backupDir?: string;
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
      baAgentId: "",
      guardrailResults: [],
      startedAt,
      completedAt: "",
      findings: [],
      unitsRemediated: [],
      filesFixed: [],
      filesUnchanged: [],
      filesFailed: [],
      resultArtifacts: [],
      fileDetails: [],
    },
  };

  let report: any;
  try {
    report = JSON.parse(fs.readFileSync(certReportPath, "utf-8"));
  } catch (err: any) {
    result.errors.push(`Failed to read certification report: ${err.message}`);
    return result;
  }

  result.remediationLog.certRunId = report.cert_run_id || report.run_id || "";

  const manifest = report.remediation_manifest;
  if (!manifest) {
    result.errors.push("No remediation manifest found in report");
    return result;
  }

  if ((!manifest.affected_unit_ids || manifest.affected_unit_ids.length === 0) &&
      manifest.directly_affected_files && manifest.directly_affected_files.length > 0) {
    console.log(`  [BA-REMEDIATION] Manifest has 0 unit IDs but ${manifest.directly_affected_files.length} affected files — synthesizing unit`);
    manifest.affected_unit_ids = ["remediation-direct-files"];
  }

  if (!manifest.affected_unit_ids || manifest.affected_unit_ids.length === 0) {
    result.errors.push("No affected units or files found in remediation manifest");
    return result;
  }

  const buildDir = path.join(runDir, "build");
  const gsePath = path.join(buildDir, "generation_strategy", "generation_strategy.json");
  const repoDir = path.join(buildDir, "repo");

  let gsePlan: GenerationStrategyPlan;
  try {
    gsePlan = JSON.parse(fs.readFileSync(gsePath, "utf-8"));
  } catch {
    console.log(`  [BA-REMEDIATION] No GSE strategy found — using minimal structure for direct file remediation`);
    gsePlan = { build_units: [], strategies: [] } as any;
  }

  let findings = report.findings || [];
  if (findings.length === 0) {
    try {
      const avcsStore = new AVCSStore(path.join(process.cwd(), "Axion", "avcs_data"));
      const certRunId = report.cert_run_id || report.run_id || "";
      findings = avcsStore.getFindings(certRunId);
      console.log(`  [BA-REMEDIATION] Loaded ${findings.length} findings from AVCS store (report had none)`);
    } catch {
      console.log(`  [BA-REMEDIATION] Warning: Could not load findings from AVCS store`);
    }
  }

  const openFindings = findings.filter((f: any) => f.status === "open" || f.status === "acknowledged");

  const structuralFindings = openFindings.filter((f: any) => f.finding_category === "structural");
  const generateFindings = openFindings.filter((f: any) => f.finding_category === "generate_missing");
  const fixFindings = openFindings.filter((f: any) => f.finding_category !== "structural" && f.finding_category !== "generate_missing");

  if (structuralFindings.length > 0) {
    console.log(`  [BA-REMEDIATION] Skipping ${structuralFindings.length} structural findings (directories/config — not file-level fixes)`);
  }
  if (generateFindings.length > 0) {
    const genFileCount = generateFindings.reduce((sum: number, f: any) => sum + (f.affected_files?.length || 0), 0);
    console.log(`  [BA-REMEDIATION] ${generateFindings.length} findings require file generation (${genFileCount} files) — these need a build re-run, not patching`);
  }

  if (fixFindings.length === 0) {
    console.log(`  [BA-REMEDIATION] No fixable findings after category filtering (${structuralFindings.length} structural + ${generateFindings.length} generate-missing skipped). Nothing to patch.`);
    result.filesRegenerated = 0;
    result.filesFailed = 0;
    result.success = true;
    return result;
  }

  const fileRemediationContext = new Map<string, RemediationFileContext[]>();
  const allAffectedFiles = new Set<string>();

  for (const finding of openFindings) {
    result.remediationLog.findings.push({
      id: finding.id,
      title: finding.title,
      severity: finding.severity,
    });
  }

  const missingOnDisk = new Set<string>();
  for (const finding of fixFindings) {
    const affectedFiles: string[] = finding.affected_files || [];
    const perFileDetails: Record<string, string> = finding.per_file_details || {};
    for (const filePath of affectedFiles) {
      const fullPath = path.join(repoDir, filePath);
      if (!fs.existsSync(fullPath)) {
        missingOnDisk.add(filePath);
        continue;
      }
      allAffectedFiles.add(filePath);
      const existing = fileRemediationContext.get(filePath) || [];
      const fileSpecificDetail = perFileDetails[filePath] || "";
      existing.push({
        findingTitle: finding.title,
        findingDescription: fileSpecificDetail || finding.description || "",
        remediationGuidance: finding.remediation || "Fix the identified issue",
        severity: finding.severity,
        fileSpecificDetail,
      });
      fileRemediationContext.set(filePath, existing);
    }
  }

  if (missingOnDisk.size > 0) {
    console.log(`  [BA-REMEDIATION] Pre-filtered ${missingOnDisk.size} files not found on disk (need generation, not patching)`);
    for (const fp of missingOnDisk) {
      result.remediationLog.fileDetails.push({
        filePath: fp,
        status: "skipped",
        fixMethod: "none",
        error: "File does not exist on disk — needs generation, not patching",
      });
    }
  }

  const unitIds: string[] = manifest.affected_unit_ids;
  result.remediationLog.unitsRemediated = unitIds;

  const ba = new BuildAgent("BA-REMEDIATION-001");
  result.remediationLog.baAgentId = "BA-REMEDIATION-001";

  const baContext = {
    run_id: `remediation-${runId}`,
    mode_id: "remediation",
    risk_class: "production" as const,
    executor_type: "external_build" as const,
    targets: Array.from(allAffectedFiles),
    source_of_truth_refs: {} as Record<string, string>,
    upstream_artifact_refs: [] as string[],
  };

  const guardrailResults = ba.checkGuardrails(baContext);
  result.remediationLog.guardrailResults = guardrailResults.map(g => ({
    guardrail_id: g.guardrail_id,
    passed: g.passed,
    message: g.message,
  }));

  const violations = guardrailResults.filter(g => !g.passed);
  if (violations.length > 0) {
    const msg = violations.map(v => `[${v.guardrail_id}] ${v.message}`).join("; ");
    result.errors.push(`BA guardrail violations — remediation blocked: ${msg}`);
    console.log(`  [BA-REMEDIATION] Blocked by guardrails: ${msg}`);
    return result;
  }

  console.log(`  [BA-REMEDIATION] Guardrails passed (${guardrailResults.length} checks). Starting targeted fix for ${unitIds.length} units, driven by ${fixFindings.length} fixable findings across ${allAffectedFiles.size} files (${structuralFindings.length} structural + ${generateFindings.length} generate-missing findings skipped)`);

  onProgress?.({
    buildId: "REMEDIATION",
    state: "building",
    currentSlice: "BA Remediation",
    slicesCompleted: 0,
    totalSlices: unitIds.length,
    filesGenerated: 0,
    totalFiles: manifest.total_files || 0,
    startedAt,
    updatedAt: new Date().toISOString(),
  });

  try {
    const fixResult = await fixUnitsFromFindings(
      repoDir,
      buildDir,
      gsePlan,
      unitIds,
      fileRemediationContext,
      (progress) => {
        onProgress?.({
          buildId: "REMEDIATION",
          state: "building",
          currentSlice: `BA Fix: ${progress.sliceName}`,
          slicesCompleted: 0,
          totalSlices: unitIds.length,
          filesGenerated: progress.fileIndex,
          totalFiles: manifest.total_files || 0,
          startedAt,
          updatedAt: new Date().toISOString(),
        });
      },
    );

    result.filesRegenerated = fixResult.filesFixed;
    result.filesFailed = fixResult.filesFailed;
    result.errors.push(...fixResult.errors);
    result.success = fixResult.filesFailed === 0 && fixResult.filesFixed > 0;
    if (fixResult.backupDir) result.remediationLog.backupDir = fixResult.backupDir;

    for (const ur of fixResult.unitResults) {
      const implRefs: Array<{ type: "path" | "diff" | "commit"; value: string }> = [];
      const proofRefs: Array<{ type: "verification_log" | "build_output" | "screenshot" | "hash"; value: string; hash?: string }> = [];

      for (const fileResult of ur.files) {
        if (fileResult.status === "fixed") {
          result.remediationLog.filesFixed.push(fileResult.filePath);
          implRefs.push({ type: "path", value: fileResult.filePath });
          proofRefs.push({
            type: "hash",
            value: `${fileResult.beforeHash} → ${fileResult.afterHash}`,
            hash: fileResult.afterHash,
          });
        } else if (fileResult.status === "unchanged") {
          result.remediationLog.filesUnchanged.push(fileResult.filePath);
        } else {
          result.remediationLog.filesFailed.push(fileResult.filePath);
        }

        result.remediationLog.fileDetails.push({
          filePath: fileResult.filePath,
          status: fileResult.status,
          fixMethod: fileResult.fixMethod,
          diffStats: fileResult.diffStats,
          preservationGates: fileResult.preservationGates,
          error: fileResult.error,
        });
      }

      if (implRefs.length > 0 && proofRefs.length > 0) {
        try {
          const artifact = ba.buildResultArtifact(ur.unitId, implRefs, proofRefs);
          result.remediationLog.resultArtifacts.push(artifact);
        } catch (err: any) {
          console.log(`  [BA-REMEDIATION] Could not build result artifact for unit ${ur.unitId}: ${err.message}`);
        }
      }
    }
  } catch (err: any) {
    result.errors.push(`BA remediation failed: ${err.message}`);
  }

  result.remediationLog.completedAt = new Date().toISOString();

  if (result.filesRegenerated > 0) {
    const buildManifestPath = path.join(buildDir, "build_manifest.json");
    const repoManifestPath = path.join(buildDir, "repo_manifest.json");
    const zipPath = path.join(buildDir, "project_repo.zip");

    let existingManifest: any = null;
    try {
      existingManifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf-8"));
    } catch {}

    try {
      const repoManifestData = refreshRepoManifest(repoDir, buildDir);
      fs.writeFileSync(repoManifestPath, JSON.stringify(repoManifestData, null, 2), "utf-8");
      console.log(`  [BA-REMEDIATION] Regenerated repo_manifest.json with refreshed file inventory`);
    } catch (err: any) {
      console.log(`  [BA-REMEDIATION] Warning: Could not regenerate repo_manifest.json: ${err.message}`);
    }

    if (existingManifest) {
      existingManifest.remediation = {
        remediated_at: result.remediationLog.completedAt,
        filesFixed: result.filesRegenerated,
        filesFailed: result.filesFailed,
        filesUnchanged: result.remediationLog.filesUnchanged.length,
        certRunId: result.remediationLog.certRunId,
        repackaged: true,
      };
      try {
        fs.writeFileSync(buildManifestPath, JSON.stringify(existingManifest, null, 2), "utf-8");
        console.log(`  [BA-REMEDIATION] Updated build_manifest.json with remediation summary`);
      } catch (err: any) {
        console.log(`  [BA-REMEDIATION] Warning: Could not update build_manifest.json: ${err.message}`);
      }
    }

    try {
      console.log(`  [BA-REMEDIATION] Repackaging export zip...`);
      const verificationReportPath = path.join(buildDir, "verification_report.json");
      const repackResult = await repackageExportZip(repoDir, zipPath, buildManifestPath, repoManifestPath, verificationReportPath);
      if (repackResult.success) {
        console.log(`  [BA-REMEDIATION] Export zip repackaged: ${repackResult.sizeBytes} bytes, ${repackResult.fileCount} files`);
      } else {
        console.log(`  [BA-REMEDIATION] Warning: Zip repackaging failed: ${repackResult.error}`);
        result.errors.push(`Zip repackaging failed: ${repackResult.error}`);
        if (existingManifest && existingManifest.remediation) {
          existingManifest.remediation.repackaged = false;
          try { fs.writeFileSync(buildManifestPath, JSON.stringify(existingManifest, null, 2), "utf-8"); } catch {}
        }
      }
    } catch (err: any) {
      console.log(`  [BA-REMEDIATION] Warning: Zip repackaging error: ${err.message}`);
      result.errors.push(`Zip repackaging error: ${err.message}`);
      if (existingManifest && existingManifest.remediation) {
        existingManifest.remediation.repackaged = false;
        try { fs.writeFileSync(buildManifestPath, JSON.stringify(existingManifest, null, 2), "utf-8"); } catch {}
      }
    }
  }

  const logPath = path.join(buildDir, "remediation_log.json");
  try {
    fs.writeFileSync(logPath, JSON.stringify(result.remediationLog, null, 2), "utf-8");
    console.log(`  [BA-REMEDIATION] Log written to ${logPath}`);
  } catch {}

  const skippedCount = result.remediationLog.fileDetails.filter((d: any) => d.status === "skipped").length;
  const skippedMsg = skippedCount > 0 ? `, ${skippedCount} skipped (not on disk)` : "";
  console.log(`  [BA-REMEDIATION] Complete: ${result.filesRegenerated} fixed, ${result.remediationLog.filesUnchanged.length} unchanged, ${result.filesFailed} failed${skippedMsg}`);
  return result;
}

export async function rollbackRemediation(runId: string): Promise<{ success: boolean; filesRestored: number; error?: string }> {
  const runDir = path.join(AXION_RUNS_DIR, runId);
  const buildDir = path.join(runDir, "build");
  const repoDir = path.join(buildDir, "repo");
  const backupsRoot = path.join(buildDir, "remediation_backups");

  if (!fs.existsSync(backupsRoot)) {
    return { success: false, filesRestored: 0, error: "No remediation backups found" };
  }

  let backupDirs: string[];
  try {
    backupDirs = fs.readdirSync(backupsRoot)
      .filter((d: string) => fs.statSync(path.join(backupsRoot, d)).isDirectory())
      .sort();
  } catch {
    return { success: false, filesRestored: 0, error: "Could not read remediation_backups directory" };
  }

  if (backupDirs.length === 0) {
    return { success: false, filesRestored: 0, error: "No backup directories found" };
  }

  const latestBackup = path.join(backupsRoot, backupDirs[backupDirs.length - 1]);
  console.log(`  [ROLLBACK] Using latest backup: ${latestBackup}`);

  let filesRestored = 0;

  function restoreFiles(dir: string, base: string): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = base ? path.join(base, entry.name) : entry.name;
      if (entry.isDirectory()) {
        restoreFiles(fullPath, relPath);
      } else if (entry.isFile()) {
        const targetPath = path.join(repoDir, relPath);
        try {
          fs.mkdirSync(path.dirname(targetPath), { recursive: true });
          fs.copyFileSync(fullPath, targetPath);
          filesRestored++;
          console.log(`  [ROLLBACK] Restored ${relPath}`);
        } catch (err: any) {
          console.log(`  [ROLLBACK] Warning: Could not restore ${relPath}: ${err.message}`);
        }
      }
    }
  }

  try {
    restoreFiles(latestBackup, "");
  } catch (err: any) {
    return { success: false, filesRestored, error: `Restore failed: ${err.message}` };
  }

  console.log(`  [ROLLBACK] Restored ${filesRestored} files from backup`);

  const zipPath = path.join(buildDir, "project_repo.zip");
  const buildManifestPath = path.join(buildDir, "build_manifest.json");
  const repoManifestPath = path.join(buildDir, "repo_manifest.json");
  const verificationReportPath = path.join(buildDir, "verification_report.json");

  try {
    console.log(`  [ROLLBACK] Repackaging export zip...`);
    const repackResult = await repackageExportZip(repoDir, zipPath, buildManifestPath, repoManifestPath, verificationReportPath);
    if (repackResult.success) {
      console.log(`  [ROLLBACK] Export zip repackaged: ${repackResult.sizeBytes} bytes`);
    } else {
      console.log(`  [ROLLBACK] Warning: Zip repackaging failed: ${repackResult.error}`);
    }
  } catch (err: any) {
    console.log(`  [ROLLBACK] Warning: Zip repackaging error: ${err.message}`);
  }

  try {
    if (fs.existsSync(buildManifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(buildManifestPath, "utf-8"));
      manifest.remediation = null;
      fs.writeFileSync(buildManifestPath, JSON.stringify(manifest, null, 2), "utf-8");
      console.log(`  [ROLLBACK] Cleared remediation block from build_manifest.json`);
    }
  } catch (err: any) {
    console.log(`  [ROLLBACK] Warning: Could not update build_manifest.json: ${err.message}`);
  }

  console.log(`  [ROLLBACK] Rollback complete: ${filesRestored} files restored`);
  return { success: true, filesRestored };
}

function refreshRepoManifest(repoDir: string, buildDir: string): any {
  const files: Array<{ path: string; sizeBytes: number }> = [];
  const directories: string[] = [];

  function walk(dir: string, base: string): void {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = base ? path.join(base, entry.name) : entry.name;
      if (entry.isDirectory()) {
        directories.push(relPath);
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        const stat = fs.statSync(fullPath);
        files.push({ path: relPath, sizeBytes: stat.size });
      }
    }
  }

  walk(repoDir, "");

  const totalSizeBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  let existingRepoManifest: any = {};
  const repoManifestPath = path.join(buildDir, "repo_manifest.json");
  try {
    existingRepoManifest = JSON.parse(fs.readFileSync(repoManifestPath, "utf-8"));
  } catch {}

  return {
    ...existingRepoManifest,
    structure: {
      directories,
      totalFiles: files.length,
      totalSizeBytes,
    },
    fileInventory: files.map((f) => ({
      path: f.path,
      role: existingRepoManifest?.fileInventory?.find?.((e: any) => e.path === f.path)?.role ?? "unknown",
      sizeBytes: f.sizeBytes,
      generationMethod: existingRepoManifest?.fileInventory?.find?.((e: any) => e.path === f.path)?.generationMethod ?? "ai_assisted",
    })),
    generatedAt: new Date().toISOString(),
  };
}
