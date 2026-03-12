import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { writeJson, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { RunManifest, StageReport, StageId } from "../../types/run.js";
import { STAGE_ORDER, STAGE_GATES, resolveStageId } from "../../types/run.js";
import { getStageOrder, getStageGates } from "../../core/orchestration/loader.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";
import { buildRealKit } from "../../core/kit/build.js";
import { validateKitOnDisk } from "../../core/kit/validate.js";
import { packageKit } from "../../core/kit/packager.js";
import { BuildQualityHookRunner, createHookContext } from "../../core/baq/hooks.js";
import {
  runBAQExtraction,
  buildDerivedInputs,
  buildRepoInventory,
  buildRequirementTraceMap,
  evaluateSufficiency,
  evaluateAllGates,
  buildQualityReport,
  writeQualityReport,
  writeFailureReport,
  FailureCollector,
} from "../../core/baq/index.js";
import { buildWorkBreakdown } from "../../core/planning/workBreakdown.js";
import { buildAcceptanceMap } from "../../core/planning/acceptanceMap.js";
import { calculateCoverage } from "../../core/planning/coverage.js";
import type { CanonicalSpec } from "../../core/canonical/specBuilder.js";
import { loadStandardsRegistry } from "../../core/standards/registryLoader.js";
import { evaluateApplicability } from "../../core/standards/applicability.js";
import { resolveStandards } from "../../core/standards/resolver.js";
import { writeSnapshot } from "../../core/standards/snapshot.js";
import { buildSpec } from "../../core/canonical/specBuilder.js";
import { extractUnknowns, mergeUnknowns } from "../../core/canonical/unknowns.js";
import { validateCanonicalSpec } from "../../core/canonical/validate.js";
import {
  writeSelectionResult,
  writeRenderedDocs,
} from "../../core/templates/evidence.js";
import { runGatesForStage } from "../../core/gates/run.js";
import { normalizeSubmission } from "../../core/intake/normalizer.js";
import { writeSubmissionRecord } from "../../core/intake/submissionRecord.js";
import { validateIntake } from "../../core/intake/validator.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { buildStateSnapshot, writeStateSnapshot } from "../../core/state/stateSnapshot.js";
import { runVerification, collectGateReports } from "../../core/verification/runner.js";
import { writeCompletionReport } from "../../core/verification/completion.js";
import { createProofsFromGateReports } from "../../core/proof/create.js";
import { ProofLedger } from "../../core/proofLedger/ledger.js";
import { validatePointers, collectRunPointers } from "../../core/evidence/pointers.js";
import { isOpenAIAvailable, enrichCanonicalSpec, enrichWorkBreakdown } from "../../core/agents/openai-bridge.js";

export const STAGE_IO: Record<string, { consumed: string[]; produced: string[] }> = {
  S1_INGEST_NORMALIZE: {
    consumed: ["intake/raw_submission.*"],
    produced: ["intake/submission.json", "intake/normalized_input.json", "intake/submission_record.json", "intake/validation_result.json"],
  },
  S2_VALIDATE_INTAKE: {
    consumed: ["intake/normalized_input.json", "intake/submission_record.json", "intake/validation_result.json"],
    produced: ["intake/validation_report.json"],
  },
  S3_BUILD_CANONICAL: {
    consumed: ["intake/normalized_input.json"],
    produced: ["canonical/canonical_spec.json", "canonical/unknowns.json"],
  },
  S4_VALIDATE_CANONICAL: {
    consumed: ["canonical/canonical_spec.json"],
    produced: ["canonical/canonical_validation_report.json"],
  },
  S5_RESOLVE_STANDARDS: {
    consumed: ["intake/normalized_input.json", "canonical/canonical_spec.json"],
    produced: ["standards/applicability_output.json", "standards/resolved_standards_snapshot.json", "standards/resolver_output.json"],
  },
  S6_SELECT_TEMPLATES: {
    consumed: ["canonical/canonical_spec.json", "standards/resolved_standards_snapshot.json"],
    produced: ["templates/selection_result.json", "templates/selection_report.json"],
  },
  S7_RENDER_DOCS: {
    consumed: ["templates/selection_result.json", "canonical/canonical_spec.json"],
    produced: ["templates/rendered_docs/*", "templates/render_report.json", "templates/render_envelopes.json", "templates/template_completeness_report.json"],
  },
  S8_BUILD_PLAN: {
    consumed: ["canonical/canonical_spec.json", "templates/selection_result.json"],
    produced: ["planning/work_breakdown.json", "planning/acceptance_map.json", "planning/coverage_report.json"],
  },
  S9_VERIFY_PROOF: {
    consumed: ["run_manifest.json", "gates/*.gate_report.json"],
    produced: ["verification/verification_run_result.json", "proof/proof_ledger.jsonl", "verification/pointer_validation.json", "verification/completion_report.json"],
  },
  S10_PACKAGE: {
    consumed: [
      "run_manifest.json",
      "canonical/canonical_spec.json",
      "standards/resolved_standards_snapshot.json",
      "templates/rendered_docs/*",
      "templates/selection_result.json",
      "planning/work_breakdown.json",
      "planning/acceptance_map.json",
      "planning/coverage_report.json",
      "gates/*.gate_report.json",
      "proof/proof_ledger.jsonl",
      "verification/verification_run_result.json",
    ],
    produced: ["kit/kit_manifest.json", "kit/entrypoint.json", "kit/version_stamp.json", "kit/packaging_manifest.json", "kit/bundle/*"],
  },
};

export async function executeStageWork(baseDir: string, runDir: string, runId: string, stageId: StageId, generatedAt: string): Promise<void> {
  if (stageId === "S1_INGEST_NORMALIZE") {
    const rawSubmissionPath = join(runDir, "intake", "raw_submission.json");
    let rawSubmission: Record<string, unknown>;
    if (existsSync(rawSubmissionPath)) {
      rawSubmission = readJson<Record<string, unknown>>(rawSubmissionPath);
    } else {
      rawSubmission = {
        submission_id: `SUB-${runId}`,
        submitted_at: generatedAt,
        form_version: "1.0.0",
        routing: {
          skill_level: "intermediate",
          category: "application",
          type_preset: "web_app",
          build_target: "new",
          audience_context: "internal",
        },
        project: {
          project_name: "Axion Generated Project",
          project_overview: "A project generated by the Axion pipeline for documentation assembly.",
        },
        spec: {
          must_have_features: [
            { name: "User Authentication", description: "Login and registration system" },
            { name: "Dashboard", description: "Main overview dashboard" },
            { name: "Data Management", description: "CRUD operations for core entities" },
          ],
          roles: [
            { name: "Admin", description: "System administrator", primary_goal: "Manage system configuration" },
            { name: "User", description: "Standard user", primary_goal: "Use core features" },
          ],
          workflows: [
            { name: "User Login", actor_role: "User", steps: ["Navigate to login", "Enter credentials", "Submit form", "Redirect to dashboard"], success_outcome: "User is authenticated and sees dashboard" },
            { name: "Admin Configuration", actor_role: "Admin", steps: ["Open settings", "Modify configuration", "Save changes"], success_outcome: "System settings are updated" },
            { name: "Data Entry", actor_role: "User", steps: ["Navigate to form", "Fill in fields", "Validate input", "Submit"], success_outcome: "New record is created" },
          ],
        },
        constraints: {},
      };
      writeCanonicalJson(rawSubmissionPath, rawSubmission);
    }

    writeCanonicalJson(join(runDir, "intake", "submission.json"), rawSubmission);

    const normalized = normalizeSubmission(rawSubmission, baseDir);
    writeCanonicalJson(join(runDir, "intake", "normalized_input.json"), normalized);

    writeSubmissionRecord(runDir, rawSubmission, "1.0.0");

    const validationResult = validateIntake(normalized, "1.0.0", baseDir);
    writeCanonicalJson(join(runDir, "intake", "validation_result.json"), validationResult);
  } else if (stageId === "S2_VALIDATE_INTAKE") {
    const normalizedPath = join(runDir, "intake", "normalized_input.json");
    let normalizedInput: Record<string, unknown>;
    try {
      normalizedInput = readJson<Record<string, unknown>>(normalizedPath);
    } catch {
      throw new Error("Cannot run S2: normalized_input.json not found. Run S1 first.");
    }

    const validationResult = validateIntake(normalizedInput, "1.0.0", baseDir);
    writeCanonicalJson(join(runDir, "intake", "validation_result.json"), validationResult);

    const validationReport = {
      run_id: runId,
      stage: "S2_VALIDATE_INTAKE",
      generated_at: isoNow(),
      is_valid: validationResult.is_valid,
      schema_version_used: validationResult.schema_version_used,
      form_version_used: validationResult.form_version_used,
      ruleset_version_used: validationResult.ruleset_version_used,
      error_count: validationResult.summary.error_count,
      warning_count: validationResult.summary.warning_count,
      blocking_rule_ids: validationResult.summary.blocking_rule_ids,
      errors: validationResult.errors,
      warnings: validationResult.warnings,
    };
    writeCanonicalJson(join(runDir, "intake", "validation_report.json"), validationReport);

    if (!validationResult.is_valid) {
      console.log(`  S2: Intake validation FAILED with ${validationResult.summary.error_count} error(s)`);
    }
  } else if (stageId === "S3_BUILD_CANONICAL") {
    const normalizedPath = join(runDir, "intake", "normalized_input.json");
    let normalizedInput: Record<string, unknown>;
    try {
      normalizedInput = readJson<Record<string, unknown>>(normalizedPath);
    } catch {
      throw new Error("Cannot run S3: normalized_input.json not found. Run S1 first.");
    }

    let canonicalSpec = buildSpec(normalizedInput, null, baseDir);

    const unknownsResult = extractUnknowns(normalizedInput, canonicalSpec);
    canonicalSpec.unknowns = mergeUnknowns(canonicalSpec.unknowns, unknownsResult.unknowns);

    if (isOpenAIAvailable()) {
      try {
        canonicalSpec = await enrichCanonicalSpec(canonicalSpec, normalizedInput);
      } catch (err: any) {
        console.log(`  [IA] OpenAI enrichment skipped: ${err.message ?? err}`);
      }
    }

    writeCanonicalJson(join(runDir, "canonical", "canonical_spec.json"), {
      run_id: runId,
      generated_at: generatedAt,
      ...canonicalSpec,
    });
    writeCanonicalJson(join(runDir, "canonical", "unknowns.json"), unknownsResult);
  } else if (stageId === "S4_VALIDATE_CANONICAL") {
    const specPath = join(runDir, "canonical", "canonical_spec.json");
    let canonicalSpec: Record<string, unknown>;
    try {
      canonicalSpec = readJson<Record<string, unknown>>(specPath);
    } catch {
      throw new Error("Cannot run S4: canonical_spec.json not found. Run S3 first.");
    }

    const validationReport = validateCanonicalSpec(canonicalSpec as any, runId, baseDir);
    writeCanonicalJson(join(runDir, "canonical", "canonical_validation_report.json"), validationReport);

    if (!validationReport.valid) {
      console.log(`  S4: Canonical validation FAILED with ${validationReport.summary.error_count} error(s)`);
    }
  } else if (stageId === "S5_RESOLVE_STANDARDS") {
    const normalizedPath = join(runDir, "intake", "normalized_input.json");
    let normalizedInput: Record<string, unknown>;
    try {
      normalizedInput = readJson<Record<string, unknown>>(normalizedPath);
    } catch {
      throw new Error("Cannot run S5: normalized_input.json not found. Run S1 first.");
    }

    const registry = loadStandardsRegistry(baseDir);

    const routing = (normalizedInput.routing ?? {}) as { skill_level: string; category: string; type_preset: string; build_target: string; audience_context: string };
    const constraints = (normalizedInput.constraints ?? {}) as Record<string, unknown>;

    const applicabilityOutput = evaluateApplicability(
      routing,
      constraints,
      registry.index.packs,
      registry.resolverRules,
      runId,
      isoNow()
    );

    writeCanonicalJson(join(runDir, "standards", "applicability_output.json"), applicabilityOutput);

    const { snapshot, resolverOutput } = resolveStandards(
      normalizedInput,
      registry,
      applicabilityOutput.matched_packs,
      runId
    );

    writeSnapshot(runDir, snapshot);
    writeCanonicalJson(join(runDir, "standards", "resolver_output.json"), resolverOutput);

    console.log(`  S5: Resolved ${snapshot.resolved_standards.length} standards from ${applicabilityOutput.matched_packs.length} packs`);
  } else if (stageId === "S6_SELECT_TEMPLATES") {
    let canonicalSpec: Record<string, unknown> | undefined;
    try {
      canonicalSpec = readJson<Record<string, unknown>>(join(runDir, "canonical", "canonical_spec.json"));
    } catch { /* optional */ }

    let standardsSnapshot: Record<string, unknown> | undefined;
    try {
      standardsSnapshot = readJson<Record<string, unknown>>(join(runDir, "standards", "resolved_standards_snapshot.json"));
    } catch { /* optional */ }

    writeSelectionResult(runDir, runId, generatedAt, baseDir, canonicalSpec, standardsSnapshot);
  } else if (stageId === "S7_RENDER_DOCS") {
    await writeRenderedDocs(runDir, runId, generatedAt, baseDir);
  } else if (stageId === "S8_BUILD_PLAN") {
    const specPath = join(runDir, "canonical", "canonical_spec.json");
    let canonicalSpec: CanonicalSpec;
    try {
      canonicalSpec = readJson<CanonicalSpec>(specPath);
    } catch {
      throw new Error("Cannot run S8: canonical_spec.json not found. Run S3 first.");
    }

    let workBreakdown = buildWorkBreakdown(canonicalSpec, runId, baseDir);

    if (isOpenAIAvailable()) {
      try {
        workBreakdown = await enrichWorkBreakdown(workBreakdown, canonicalSpec);
      } catch (err: any) {
        console.log(`  [IA] OpenAI work breakdown enrichment skipped: ${err.message ?? err}`);
      }
    }

    writeCanonicalJson(join(runDir, "planning", "work_breakdown.json"), workBreakdown);

    const acceptanceMap = buildAcceptanceMap(canonicalSpec, workBreakdown, runId, baseDir);
    writeCanonicalJson(join(runDir, "planning", "acceptance_map.json"), acceptanceMap);

    const coverageReport = calculateCoverage(canonicalSpec, workBreakdown, acceptanceMap, runId);
    writeCanonicalJson(join(runDir, "planning", "coverage_report.json"), coverageReport);

    const stateSnapshot = buildStateSnapshot(runId, workBreakdown, acceptanceMap);
    writeStateSnapshot(runDir, stateSnapshot);

    const acceptanceCount = acceptanceMap.acceptance_items?.length ?? acceptanceMap.acceptance?.length ?? 0;
    console.log(`  S8: Generated ${workBreakdown.units.length} work units, ${acceptanceCount} acceptance items, coverage: ${coverageReport.coverage_percent}%`);
  } else if (stageId === "S9_VERIFY_PROOF") {
    const gateReports = collectGateReports(runDir);

    const verificationResult = runVerification({
      run_id: runId,
      run_dir: runDir,
    });

    writeCanonicalJson(join(runDir, "verification", "verification_run_result.json"), {
      run_id: runId,
      verified_at: verificationResult.evaluated_at,
      gates_checked: gateReports.map((r) => ({
        gate_id: r.gate_id,
        verdict: r.status === "pass" ? "PASS" : "FAIL",
        report_path: `gates/${r.gate_id}.gate_report.json`,
      })),
      all_passed: verificationResult.verdict === "complete" || gateReports.every((r) => r.status === "pass"),
      proof_count: gateReports.length,
      summary: verificationResult.notes.join(" "),
    });

    const proofObjects = createProofsFromGateReports(gateReports, runId);

    const ledgerPath = join(runDir, "proof", "proof_ledger.jsonl");
    const ledger = new ProofLedger(ledgerPath);

    for (const proof of proofObjects) {
      ledger.appendProofObject(proof);
    }

    const pointers = collectRunPointers(runDir);
    const pointerReport = validatePointers(runDir, pointers, runId, isoNow());
    writeCanonicalJson(join(runDir, "verification", "pointer_validation.json"), pointerReport);

    writeCompletionReport(join(runDir, "verification", "completion_report.json"), verificationResult);

    console.log(`  S9: Verified ${gateReports.length} gates, created ${proofObjects.length} proof objects, pointers: ${pointerReport.resolved}/${pointerReport.total} resolved`);
  } else if (stageId === "S10_PACKAGE") {
    const kitResult = buildRealKit(runDir, runId, generatedAt, baseDir);
    console.log(`  S10: Built kit with ${kitResult.fileCount} files, hash=${kitResult.contentHash.slice(0, 12)}`);

    const baqArtifactFiles = [
      "kit_extraction.json",
      "derived_build_inputs.json",
      "repo_inventory.json",
      "requirement_trace_map.json",
      "sufficiency_evaluation.json",
      "build_quality_report.json",
    ];
    const missingBaqArtifacts = baqArtifactFiles.filter(f => !existsSync(join(runDir, f)));

    if (missingBaqArtifacts.length > 0) {
      console.log(`  S10: Generating ${missingBaqArtifacts.length} missing BAQ artifacts...`);
      const buildId = `BUILD-${runId}`;
      const failureCollector = new FailureCollector();

      let extraction = null;
      let derivedInputs = null;
      let inventory = null;
      let traceMap = null;
      let sufficiency = null;

      try {
        if (!existsSync(join(runDir, "kit_extraction.json"))) {
          extraction = runBAQExtraction(runDir);
          writeJson(join(runDir, "kit_extraction.json"), extraction);
          console.log(`  S10: [BAQ] kit_extraction.json written`);
        } else {
          extraction = readJson(join(runDir, "kit_extraction.json"));
        }

        if (!existsSync(join(runDir, "derived_build_inputs.json"))) {
          derivedInputs = buildDerivedInputs(extraction, runDir);
          writeJson(join(runDir, "derived_build_inputs.json"), derivedInputs);
          console.log(`  S10: [BAQ] derived_build_inputs.json written`);
        } else {
          derivedInputs = readJson(join(runDir, "derived_build_inputs.json"));
        }

        if (!existsSync(join(runDir, "repo_inventory.json"))) {
          inventory = buildRepoInventory(derivedInputs, runDir);
          writeJson(join(runDir, "repo_inventory.json"), inventory);
          console.log(`  S10: [BAQ] repo_inventory.json written`);
        } else {
          inventory = readJson(join(runDir, "repo_inventory.json"));
        }

        if (!existsSync(join(runDir, "requirement_trace_map.json"))) {
          traceMap = buildRequirementTraceMap(derivedInputs, inventory);
          writeJson(join(runDir, "requirement_trace_map.json"), traceMap);
          console.log(`  S10: [BAQ] requirement_trace_map.json written`);
        } else {
          traceMap = readJson(join(runDir, "requirement_trace_map.json"));
        }

        if (!existsSync(join(runDir, "sufficiency_evaluation.json"))) {
          sufficiency = evaluateSufficiency(derivedInputs, inventory, traceMap);
          writeJson(join(runDir, "sufficiency_evaluation.json"), sufficiency);
          console.log(`  S10: [BAQ] sufficiency_evaluation.json written`);
        } else {
          sufficiency = readJson(join(runDir, "sufficiency_evaluation.json"));
        }

        if (!existsSync(join(runDir, "build_quality_report.json"))) {
          const gateEvaluation = evaluateAllGates({
            extraction,
            derivedInputs,
            inventory,
            traceMap,
            sufficiency,
            reconciliation: null,
            verificationSignals: null,
            packagingSignals: null,
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
            reconciliation: null,
            verificationSignals: null,
            buildStatus: "completed",
          });
          writeQualityReport(runDir, qualityReport);
          console.log(`  S10: [BAQ] build_quality_report.json written (score=${qualityReport.overall_quality_score}%, decision=${qualityReport.decision})`);
        }

        console.log(`  S10: BAQ artifacts ready`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`  S10: WARNING — BAQ artifact generation failed: ${msg}`);
      }
    } else {
      console.log(`  S10: All BAQ artifacts present`);
    }

    const baqHookRunner = new BuildQualityHookRunner();
    baqHookRunner.markUpstreamCompleted("beforePackaging");

    const pmPath = join(runDir, "kit", "packaging_manifest.json");
    if (!existsSync(pmPath)) {
      console.log(`  S10: WARNING — packaging_manifest.json not found, skipping kit validation`);
    }
    const pm = existsSync(pmPath)
      ? readJson<{ files: Array<{ path: string; sha256: string }> }>(pmPath)
      : { files: [] };
    const packagingFiles = pm.files ?? [];

    const kitManifest = {
      kit_id: `KIT-${runId}`,
      run_id: runId,
      version: "1.0.0",
      created_at: generatedAt,
      artifacts: packagingFiles.map((f, i) => ({
        artifact_id: `ART-${String(i + 1).padStart(3, "0")}`,
        path: f.path,
        type: f.path.endsWith(".json") ? "json" : f.path.endsWith(".md") ? "markdown" : "file",
        hash: f.sha256,
      })),
      metadata: { packaged_by: "axion-pipeline", run_id: runId },
    };

    const validationResult = validateKitOnDisk(join(runDir, "kit"), kitManifest);
    writeJson(join(runDir, "kit", "kit_validation_report.json"), {
      run_id: runId,
      validated_at: isoNow(),
      valid: validationResult.valid,
      error_count: validationResult.errorCount,
      errors: validationResult.errors,
    });

    if (!validationResult.valid) {
      console.log(`  S10: Kit validation found ${validationResult.errorCount} issue(s):`);
      for (const err of validationResult.errors) {
        console.log(`    - ${err}`);
      }
    } else {
      console.log(`  S10: Kit validation passed`);
    }

    const packageOutputPath = join(runDir, "kit", "packaged");
    await packageKit(runDir, packageOutputPath, {
      hookRunner: baqHookRunner,
      runId,
      buildId: `BUILD-${runId}`,
    });
    console.log(`  S10: Kit packaged to ${packageOutputPath}`);
  }
}

export interface StageExecutionResult {
  passed: boolean;
  reportRelPath: string;
}

export async function executeStageWithGates(baseDir: string, runDir: string, runId: string, stageId: StageId, generatedAt: string): Promise<StageExecutionResult> {
  const io = STAGE_IO[stageId] ?? { consumed: [], produced: [] };
  const now = isoNow();

  await executeStageWork(baseDir, runDir, runId, stageId, generatedAt);

  const orchGates = getStageGates(baseDir);
  const effectiveGates = Object.keys(orchGates).length > 0 ? orchGates : STAGE_GATES;
  const gateId = effectiveGates[stageId];
  let gatesPassed = true;
  if (gateId) {
    const gateResult = runGatesForStage(baseDir, runId, stageId);
    if (!gateResult.all_passed) {
      gatesPassed = false;
    }
  }

  if (!gatesPassed) {
    const failReport: StageReport = {
      run_id: runId,
      stage_id: stageId,
      status: "fail",
      started_at: now,
      finished_at: isoNow(),
      consumed: io.consumed,
      produced: io.produced,
      gate_reports: [],
      notes: [{ level: "error", message: `Stage ${stageId} failed: gate ${gateId} did not pass` }],
    };

    const failReportRelPath = `stage_reports/${stageId}.json`;
    writeJson(join(runDir, failReportRelPath), failReport);

    return { passed: false, reportRelPath: failReportRelPath };
  }

  const report: StageReport = {
    run_id: runId,
    stage_id: stageId,
    status: "pass",
    started_at: now,
    finished_at: isoNow(),
    consumed: io.consumed,
    produced: io.produced,
    gate_reports: [],
    notes: [{ level: "info", message: `Stage report for ${stageId}` }],
  };

  const reportRelPath = `stage_reports/${stageId}.json`;
  const reportPath = join(runDir, reportRelPath);
  writeJson(reportPath, report);

  const indexPath = join(runDir, "artifact_index.json");
  let index: ArtifactIndexEntry[];
  try {
    index = readJson<ArtifactIndexEntry[]>(indexPath);
  } catch {
    index = [];
  }

  index.push({
    artifact_id: `stage_report_${stageId}`,
    type: "stage_report",
    path: reportRelPath,
    sha256: sha256(readFileSync(reportPath, "utf-8")),
    created_at: now,
    producer: { stage_id: stageId },
  });

  writeJson(indexPath, index);

  return { passed: true, reportRelPath };
}

export async function cmdRunStage(baseDir: string, runId: string, stageIdArg: string): Promise<void> {
  const resolved = resolveStageId(stageIdArg);
  if (!resolved) {
    const orchOrder = getStageOrder(baseDir);
    const validStages = orchOrder.length > 0 ? orchOrder : STAGE_ORDER;
    console.error(`Invalid stage_id: ${stageIdArg}`);
    console.error(`Valid stages: ${validStages.join(", ")}`);
    process.exit(1);
  }
  const stageId: StageId = resolved;

  const runDir = join(baseDir, ".axion", "runs", runId);
  const manifestPath = join(runDir, "run_manifest.json");

  let manifest: RunManifest;
  try {
    manifest = readJson<RunManifest>(manifestPath);
  } catch {
    console.error(`Run not found: ${runId}`);
    process.exit(1);
  }

  const stageEntry = manifest.stages.find((s) => s.stage_id === stageId);
  if (!stageEntry) {
    console.error(`Stage ${stageId} not found in manifest for run ${runId}`);
    process.exit(1);
  }

  const generatedAt = manifest.created_at;
  const result = await executeStageWithGates(baseDir, runDir, runId, stageId, generatedAt);

  manifest = readJson<RunManifest>(manifestPath);
  const currentStageEntry = manifest.stages.find((s) => s.stage_id === stageId);

  if (!result.passed) {
    if (currentStageEntry) {
      currentStageEntry.status = "fail";
      currentStageEntry.stage_report_ref = result.reportRelPath;
    }
    manifest.status = "failed";
    manifest.updated_at = isoNow();
    writeJson(manifestPath, manifest);

    const cmdOrcGates = getStageGates(baseDir);
    const cmdEffGates = Object.keys(cmdOrcGates).length > 0 ? cmdOrcGates : STAGE_GATES;
    const failGateId = cmdEffGates[stageId];
    console.log(`  Stage ${stageId}: FAIL (gate ${failGateId} blocked)`);
    process.exit(1);
  }

  if (currentStageEntry) {
    currentStageEntry.status = "pass";
    currentStageEntry.stage_report_ref = result.reportRelPath;
  }
  manifest.updated_at = isoNow();

  const allDone = manifest.stages.every((s) => s.status === "pass" || s.status === "skipped");
  if (allDone) {
    manifest.status = "completed";
  }

  writeJson(manifestPath, manifest);

  console.log(`  Stage ${stageId}: pass → ${result.reportRelPath}`);
}
