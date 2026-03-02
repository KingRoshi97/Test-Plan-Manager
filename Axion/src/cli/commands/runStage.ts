import { join } from "node:path";
import { readFileSync } from "node:fs";
import { writeJson, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { RunManifest, StageReport, StageId } from "../../types/run.js";
import { STAGE_ORDER, STAGE_GATES, resolveStageId } from "../../types/run.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";
import {
  writeIntakeValidationResult,
  writeCanonicalSpecEvidence,
  writeResolvedStandardsSnapshot,
  writeCoverageReport,
  writeBundleAndPackagingManifest,
} from "../../core/gates/evidence.js";
import {
  writeSelectionResult,
  writeRenderedDocs,
} from "../../core/templates/evidence.js";
import { runGatesForStage } from "../../core/gates/run.js";

const STAGE_IO: Record<string, { consumed: string[]; produced: string[] }> = {
  S1_INGEST_NORMALIZE: {
    consumed: ["intake/raw_submission.*"],
    produced: ["intake/normalized_payload.json", "intake/validation_result.json"],
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
    consumed: ["templates/selection_result.json", "canonical/canonical_spec.json"],
    produced: ["templates/rendered_docs/*", "templates/render_report.json"],
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

export function cmdRunStage(baseDir: string, runId: string, stageIdArg: string): void {
  const resolved = resolveStageId(stageIdArg);
  if (!resolved) {
    console.error(`Invalid stage_id: ${stageIdArg}`);
    console.error(`Valid stages: ${STAGE_ORDER.join(", ")}`);
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

  const io = STAGE_IO[stageId] ?? { consumed: [], produced: [] };
  const now = isoNow();
  const generatedAt = manifest.created_at;

  if (stageId === "S1_INGEST_NORMALIZE") {
    writeIntakeValidationResult(runDir, runId, generatedAt);
  } else if (stageId === "S3_BUILD_CANONICAL") {
    writeCanonicalSpecEvidence(runDir, runId, generatedAt);
  } else if (stageId === "S5_RESOLVE_STANDARDS") {
    writeResolvedStandardsSnapshot(runDir, runId, generatedAt);
  } else if (stageId === "S6_SELECT_TEMPLATES") {
    writeSelectionResult(runDir, runId, generatedAt, baseDir);
  } else if (stageId === "S7_RENDER_DOCS") {
    writeRenderedDocs(runDir, runId, generatedAt, baseDir);
  } else if (stageId === "S8_BUILD_PLAN") {
    writeCoverageReport(runDir, runId, generatedAt);
  } else if (stageId === "S10_PACKAGE") {
    writeBundleAndPackagingManifest(runDir, runId, generatedAt);
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
    process.exit(1);
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
