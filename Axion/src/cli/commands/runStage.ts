import { join } from "node:path";
import { readFileSync } from "node:fs";
import { writeJson, readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { RunManifest, StageReport, StageId } from "../../types/run.js";
import { STAGE_ORDER } from "../../types/run.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";

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

  stageEntry.status = "pass";
  stageEntry.stage_report_ref = reportRelPath;
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
