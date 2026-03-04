import { join } from "node:path";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { RunManifest, StageReport, StageId } from "../../types/run.js";
import { STAGE_ORDER, STAGE_GATES, resolveStageId } from "../../types/run.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";
import { generateAndWritePlan } from "../../core/planning/plan.js";
import { buildSpec } from "../../core/canonical/specBuilder.js";
import { extractUnknowns } from "../../core/canonical/unknowns.js";
import { resolveAndWriteStandards } from "../../core/standards/resolver.js";
import {
  writeSelectionResult,
  writeRenderedDocs,
} from "../../core/templates/evidence.js";
import { runGatesForStage } from "../../core/gates/run.js";
import { normalizeSubmission } from "../../core/intake/normalizer.js";
import { validateIntake } from "../../core/intake/validator.js";
import { writeSubmissionRecord } from "../../core/intake/submissionRecord.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { cmdWriteProof } from "./writeProof.js";
import { validateStageBoundary } from "../../core/controlPlane/boundaryValidator.js";
import { scanDirectory } from "../../core/scanner/scan.js";
import { getDefaultPacks } from "../../core/scanner/packs.js";

const STAGE_IO: Record<string, { consumed: string[]; produced: string[] }> = {
  S1_INGEST_NORMALIZE: {
    consumed: ["intake/raw_submission.*"],
    produced: ["intake/normalized_payload.json", "intake/validation_result.json", "intake/submission_record.json"],
  },
  S2_VALIDATE_INTAKE: {
    consumed: ["intake/normalized_payload.json", "intake/validation_result.json"],
    produced: ["intake/validation_report.json"],
  },
  S3_BUILD_CANONICAL: {
    consumed: ["intake/normalized_payload.json"],
    produced: ["canonical/canonical_spec.json"],
  },
  S4_VALIDATE_CANONICAL: {
    consumed: ["canonical/canonical_spec.json"],
    produced: [],
  },
  S5_RESOLVE_STANDARDS: {
    consumed: ["intake/normalized_payload.json"],
    produced: ["standards/resolved_standards_snapshot.json"],
  },
  S6_SELECT_TEMPLATES: {
    consumed: ["canonical/canonical_spec.json", "standards/resolved_standards_snapshot.json"],
    produced: ["templates/selection_result.json", "templates/selection_report.json"],
  },
  S7_RENDER_DOCS: {
    consumed: ["templates/selection_result.json", "canonical/canonical_spec.json", "standards/resolved_standards_snapshot.json"],
    produced: ["templates/rendered_docs/*", "templates/render_report.json", "templates/template_completeness_report.json"],
  },
  S8_BUILD_PLAN: {
    consumed: ["canonical/canonical_spec.json", "templates/selection_result.json"],
    produced: ["planning/work_breakdown.json", "planning/acceptance_map.json", "planning/coverage_report.json"],
  },
  S9_VERIFY_PROOF: {
    consumed: ["run_manifest.json", "gates/*.gate_report.json"],
    produced: ["proof/proof_ledger.jsonl"],
  },
  S10_PACKAGE: {
    consumed: ["run_manifest.json", "gates/*.gate_report.json", "templates/rendered_docs/*"],
    produced: ["kit/kit_manifest.json", "kit/entrypoint.json", "kit/version_stamp.json", "kit/packaging_manifest.json"],
  },
};

function collectArtifactHashes(runDir: string): Array<{ path: string; sha256: string }> {
  const hashes: Array<{ path: string; sha256: string }> = [];
  const artifactDirs = ["intake", "canonical", "standards", "templates", "planning", "proof", "gates", "stage_reports"];
  for (const dir of artifactDirs) {
    const dirPath = join(runDir, dir);
    if (!existsSync(dirPath)) continue;
    try {
      const files = readdirSync(dirPath).filter((f) => f.endsWith(".json") || f.endsWith(".jsonl"));
      for (const file of files) {
        const filePath = join(dirPath, file);
        const content = readFileSync(filePath, "utf-8");
        hashes.push({ path: `${dir}/${file}`, sha256: sha256(content) });
      }
    } catch {
      /* skip unreadable dirs */
    }
  }
  return hashes;
}

function writeRealBundleAndPackagingManifest(runDir: string, runId: string, generatedAt: string, _baseDir: string): void {
  const bundleDir = join(runDir, "kit", "bundle");
  ensureDir(bundleDir);

  const artifactHashes = collectArtifactHashes(runDir);

  const kitManifest = {
    kit_id: `KIT-${runId}`,
    run_id: runId,
    generated_at: generatedAt,
    contents: {
      artifacts_root: "artifacts/",
      docs_root: "docs/",
      entrypoint: "entrypoint.json",
      version_stamp: "version_stamp.json",
    },
    artifact_hashes: artifactHashes,
  };

  const entrypoint = {
    entrypoint_id: `ENTRY-${runId}`,
    run_id: runId,
    generated_at: generatedAt,
    instructions: [
      { step: 1, action: "read", path: "version_stamp.json" },
      { step: 2, action: "read", path: "kit_manifest.json" },
    ],
  };

  const versionStamp = {
    run_id: runId,
    generated_at: generatedAt,
    versions: {
      pipeline_version: "1.0.0",
      gate_registry_version: "1.0.0",
      standards_version: "1.0.0",
      template_index_version: "1.0.0",
    },
  };

  writeCanonicalJson(join(bundleDir, "kit_manifest.json"), kitManifest);
  writeCanonicalJson(join(bundleDir, "entrypoint.json"), entrypoint);
  writeCanonicalJson(join(bundleDir, "version_stamp.json"), versionStamp);

  const bundleFiles = ["entrypoint.json", "kit_manifest.json", "version_stamp.json"];
  const files = bundleFiles.map((name) => ({
    path: name,
    sha256: sha256(readFileSync(join(bundleDir, name), "utf-8")),
  }));

  writeCanonicalJson(join(runDir, "kit", "packaging_manifest.json"), {
    run_id: runId,
    generated_at: generatedAt,
    root: "kit/bundle",
    algorithm: "sha256",
    files,
    artifact_integrity: {
      total_artifacts: artifactHashes.length,
      hashes: artifactHashes,
    },
  });
}

export class StageFailureError extends Error {
  constructor(
    public stageId: StageId,
    public reason: string,
    public classification: "boundary_failure" | "gate_failure" = "gate_failure",
  ) {
    super(`Stage ${stageId} failed: ${reason}`);
    this.name = "StageFailureError";
  }
}

export function executeStage(baseDir: string, runId: string, stageIdArg: string): void {
  const resolved = resolveStageId(stageIdArg);
  if (!resolved) {
    throw new Error(`Invalid stage_id: ${stageIdArg}. Valid stages: ${STAGE_ORDER.join(", ")}`);
  }
  const stageId: StageId = resolved;

  const runDir = join(baseDir, ".axion", "runs", runId);
  const manifestPath = join(runDir, "run_manifest.json");

  let manifest: RunManifest;
  try {
    manifest = readJson<RunManifest>(manifestPath);
  } catch {
    throw new Error(`Run not found: ${runId}`);
  }

  const stageEntry = manifest.stages.find((s) => s.stage_id === stageId);
  if (!stageEntry) {
    throw new Error(`Stage ${stageId} not found in manifest for run ${runId}`);
  }

  const io = STAGE_IO[stageId] ?? { consumed: [], produced: [] };
  const now = isoNow();
  const generatedAt = manifest.created_at;

  if (stageId === "S1_INGEST_NORMALIZE") {
    let rawSubmission: unknown;
    const submissionPath = manifest.config?.submission_path as string | undefined;
    if (submissionPath && existsSync(submissionPath)) {
      rawSubmission = JSON.parse(readFileSync(submissionPath, "utf-8"));
    } else {
      const defaultPath = join(baseDir, "libraries", "intake", "schema.v1.json");
      if (existsSync(defaultPath)) {
        rawSubmission = JSON.parse(readFileSync(defaultPath, "utf-8"));
      } else {
        rawSubmission = {};
      }
    }

    const normalized = normalizeSubmission(rawSubmission);
    writeCanonicalJson(join(runDir, "intake", "normalized_payload.json"), normalized);

    const validationResult = validateIntake(rawSubmission, "1.0.0");
    writeCanonicalJson(join(runDir, "intake", "validation_result.json"), validationResult);

    writeSubmissionRecord(runDir, rawSubmission, "1.0.0");
  } else if (stageId === "S3_BUILD_CANONICAL") {
    const normalizedPath = join(runDir, "intake", "normalized_payload.json");
    let normalizedData: unknown = {};
    if (existsSync(normalizedPath)) {
      normalizedData = JSON.parse(readFileSync(normalizedPath, "utf-8"));
    }

    let standardsData: unknown = {};
    const stdPath = join(runDir, "standards", "resolved_standards_snapshot.json");
    if (existsSync(stdPath)) {
      standardsData = JSON.parse(readFileSync(stdPath, "utf-8"));
    }

    const canonicalSpec = buildSpec(normalizedData, standardsData);
    const unknownsResult = extractUnknowns(normalizedData, canonicalSpec);
    canonicalSpec.unknowns = unknownsResult.unknowns;

    writeCanonicalJson(join(runDir, "canonical", "canonical_spec.json"), canonicalSpec);
    writeCanonicalJson(join(runDir, "canonical", "unknowns_assumptions.json"), unknownsResult);
  } else if (stageId === "S5_RESOLVE_STANDARDS") {
    const normalizedPayloadPath = join(runDir, "intake", "normalized_payload.json");
    let normalizedInput: unknown = {};
    if (existsSync(normalizedPayloadPath)) {
      normalizedInput = JSON.parse(readFileSync(normalizedPayloadPath, "utf-8"));
    }
    const standardsLibPath = join(baseDir, "libraries", "standards");
    resolveAndWriteStandards(runDir, runId, normalizedInput, standardsLibPath);
  } else if (stageId === "S6_SELECT_TEMPLATES") {
    writeSelectionResult(runDir, runId, generatedAt, baseDir);
  } else if (stageId === "S7_RENDER_DOCS") {
    writeRenderedDocs(runDir, runId, generatedAt, baseDir);
  } else if (stageId === "S8_BUILD_PLAN") {
    generateAndWritePlan(runDir, runId);
  } else if (stageId === "S9_VERIFY_PROOF") {
    cmdWriteProof(runId, runDir, baseDir);
  } else if (stageId === "S10_PACKAGE") {
    const packs = getDefaultPacks();
    const scanResult = scanDirectory(runDir, packs);
    writeCanonicalJson(join(runDir, "kit", "scan_result.json"), scanResult);

    if (!scanResult.passed) {
      const criticalFindings = scanResult.findings.filter((f) => f.severity === "critical" || f.severity === "high");
      const msg = criticalFindings.map((f) => `[${f.severity}] ${f.file_path}:${f.line ?? "?"} - ${f.description}`).join("; ");
      throw new StageFailureError("S10_PACKAGE", `Secrets/PII scan FAILED: ${scanResult.summary.critical} critical, ${scanResult.summary.high} high findings. ${msg}`, "gate_failure");
    }

    writeRealBundleAndPackagingManifest(runDir, runId, generatedAt, baseDir);
  }

  const boundaryResult = validateStageBoundary(runDir, baseDir, stageId);
  if (!boundaryResult.valid) {
    const hardErrors = boundaryResult.errors.filter((e) => e.severity === "hard");
    writeCanonicalJson(join(runDir, "stage_reports", `${stageId}_boundary_validation.json`), boundaryResult);

    const failReport: StageReport = {
      run_id: runId,
      stage_id: stageId,
      status: "fail",
      started_at: now,
      finished_at: isoNow(),
      consumed: io.consumed,
      produced: io.produced,
      gate_reports: [],
      notes: hardErrors.map((e) => ({ level: "error" as const, message: `Boundary validation: ${e.message}` })),
    };

    const failReportRelPath = `stage_reports/${stageId}.json`;
    writeJson(join(runDir, failReportRelPath), failReport);

    stageEntry.status = "fail";
    stageEntry.stage_report_ref = failReportRelPath;
    manifest.status = "failed";
    manifest.updated_at = isoNow();
    writeJson(manifestPath, manifest);

    for (const err of hardErrors) {
      console.error(`  BOUNDARY FAIL [${stageId}] ${err.artifact}: ${err.message}`);
    }
    throw new StageFailureError(stageId, `Boundary validation failed`, "boundary_failure");
  }

  const gateId = STAGE_GATES[stageId];
  let gatesPassed = true;
  if (gateId) {
    const gateResult = runGatesForStage(baseDir, runId, stageId);
    if (!gateResult.all_passed) {
      gatesPassed = false;
    }
  }

  if (gateId) {
    manifest = readJson<RunManifest>(manifestPath);
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

    stageEntry.status = "fail";
    stageEntry.stage_report_ref = failReportRelPath;
    manifest.status = "failed";
    manifest.updated_at = isoNow();
    writeJson(manifestPath, manifest);

    console.log(`  Stage ${stageId}: FAIL (gate ${gateId} blocked)`);
    throw new StageFailureError(stageId, `Gate ${gateId} did not pass`, "gate_failure");
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

  const currentStageEntry = manifest.stages.find((s) => s.stage_id === stageId);
  if (currentStageEntry) {
    currentStageEntry.status = "pass";
    currentStageEntry.stage_report_ref = reportRelPath;
  }
  manifest.updated_at = isoNow();

  const allDone = manifest.stages.every((s) => s.status === "pass" || s.status === "skipped");
  if (allDone) {
    manifest.status = "completed";
  }

  writeJson(manifestPath, manifest);

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

  console.log(`  Stage ${stageId}: pass → ${reportRelPath}`);
}

export function cmdRunStage(baseDir: string, runId: string, stageIdArg: string): void {
  try {
    executeStage(baseDir, runId, stageIdArg);
  } catch (err) {
    if (err instanceof StageFailureError) {
      process.exit(1);
    }
    if (err instanceof Error) {
      console.error(err.message);
    }
    process.exit(1);
  }
}
