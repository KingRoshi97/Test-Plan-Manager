import { join } from "node:path";
import { readFileSync } from "node:fs";
import { writeJson, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { RunManifest, StageReport, StageId } from "../../types/run.js";
import { STAGE_ORDER } from "../../types/run.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";
import {
  writeIntakeValidationResult,
  writeCanonicalSpecEvidence,
  writeResolvedStandardsSnapshot,
  writeCoverageReport,
  writeBundleAndPackagingManifest,
} from "../../core/gates/evidence.js";
import { runGatesForStage } from "../../core/gates/run.js";

const STAGE_IO: Record<string, { consumed: string[]; produced: string[] }> = {
  S1_INGEST_NORMALIZE: {
    consumed: ["intake/raw_submission.*"],
    produced: ["intake/normalized_payload.json"],
  },
  S2_INTAKE_VALIDATION: {
    consumed: ["intake/normalized_payload.json"],
    produced: ["intake/validation_report.json"],
  },
  S3_STANDARDS_RESOLUTION: {
    consumed: ["intake/normalized_payload.json"],
    produced: ["standards/resolved_standards_snapshot.json"],
  },
  S4_CANONICAL_BUILD: {
    consumed: ["intake/normalized_payload.json", "standards/resolved_standards_snapshot.json"],
    produced: ["canonical/canonical_spec.json"],
  },
  S5_TEMPLATE_SELECTION: {
    consumed: ["canonical/canonical_spec.json", "standards/resolved_standards_snapshot.json"],
    produced: ["templates/selected_templates.json"],
  },
  S6_PLAN_GENERATION: {
    consumed: ["canonical/canonical_spec.json", "templates/selected_templates.json"],
    produced: ["planning/work_breakdown.json", "planning/acceptance_map.json", "planning/sequencing_report.json"],
  },
  S7_TEMPLATE_FILL: {
    consumed: ["canonical/canonical_spec.json", "planning/work_breakdown.json", "templates/selected_templates.json"],
    produced: ["templates/filled/*"],
  },
  S8_GATE_EVALUATION: {
    consumed: ["run_manifest.json", "templates/filled/*", "canonical/canonical_spec.json"],
    produced: ["gates/*.gate_report.json", "proof/proof_ledger.jsonl"],
  },
  S9_KIT_PACKAGE: {
    consumed: ["run_manifest.json", "gates/*.gate_report.json", "templates/filled/*"],
    produced: ["kit/kit_manifest.json", "kit/entrypoint.json", "kit/version_stamp.json"],
  },
  S10_CLOSE: {
    consumed: ["run_manifest.json", "kit/kit_manifest.json"],
    produced: ["verification/completion_report.json", "state/state_snapshot.json"],
  },
};

function isValidStageId(id: string): id is StageId {
  return (STAGE_ORDER as readonly string[]).includes(id);
}

export function cmdRunStage(baseDir: string, runId: string, stageIdArg: string): void {
  if (!isValidStageId(stageIdArg)) {
    console.error(`Invalid stage_id: ${stageIdArg}`);
    console.error(`Valid stages: ${STAGE_ORDER.join(", ")}`);
    process.exit(1);
  }
  const stageId: StageId = stageIdArg;

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
  } else if (stageId === "S3_STANDARDS_RESOLUTION") {
    writeResolvedStandardsSnapshot(runDir, runId, generatedAt);
  } else if (stageId === "S4_CANONICAL_BUILD") {
    writeCanonicalSpecEvidence(runDir, runId, generatedAt);
  } else if (stageId === "S6_PLAN_GENERATION") {
    writeCoverageReport(runDir, runId, generatedAt);
  } else if (stageId === "S9_KIT_PACKAGE") {
    writeBundleAndPackagingManifest(runDir, runId, generatedAt);
  }

  const GATE_STAGE_MAP: Record<string, string> = {
    S2_INTAKE_VALIDATION: "S2_VALIDATE_INTAKE",
    S4_CANONICAL_BUILD: "S4_VALIDATE_CANONICAL",
    S3_STANDARDS_RESOLUTION: "S5_RESOLVE_STANDARDS",
    S6_PLAN_GENERATION: "S8_BUILD_PLAN",
    S9_KIT_PACKAGE: "S10_PACKAGE",
  };

  const gateStageId = GATE_STAGE_MAP[stageId];
  let gatesPassed = true;
  if (gateStageId) {
    const gateResult = runGatesForStage(baseDir, runId, gateStageId);
    if (!gateResult.all_passed) {
      gatesPassed = false;
    }
  }

  if (gateStageId) {
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
      notes: [{ level: "error", message: `Stage ${stageId} failed: gate ${gateStageId} did not pass` }],
    };

    const failReportRelPath = `stage_reports/${stageId}.json`;
    writeJson(join(runDir, failReportRelPath), failReport);

    stageEntry.status = "fail";
    stageEntry.stage_report_ref = failReportRelPath;
    manifest.status = "failed";
    manifest.updated_at = isoNow();
    writeJson(manifestPath, manifest);

    console.log(`  Stage ${stageId}: FAIL (gate ${gateStageId} blocked)`);
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
    notes: [{ level: "info", message: `Stub stage report for ${stageId}` }],
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
