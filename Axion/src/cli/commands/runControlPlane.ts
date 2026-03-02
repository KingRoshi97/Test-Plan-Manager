import { join } from "node:path";
import { readFileSync } from "node:fs";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { RunManifest, StageRun, StageReport } from "../../types/run.js";
import { STAGE_ORDER, STAGE_GATES, GATES_REQUIRED } from "../../types/run.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";

function padRunId(n: number): string {
  return `RUN-${String(n).padStart(6, "0")}`;
}

function hashFile(absolutePath: string): string {
  return sha256(readFileSync(absolutePath, "utf-8"));
}

function artifactEntry(
  id: string,
  type: string,
  relPath: string,
  fileHash: string,
  stageId: string,
  createdAt: string,
): ArtifactIndexEntry {
  return {
    artifact_id: id,
    type,
    path: relPath,
    sha256: fileHash,
    created_at: createdAt,
    producer: { stage_id: stageId },
  };
}

export function cmdRunStart(baseDir: string = "."): string {
  const counterPath = join(baseDir, ".axion", "run_counter.json");
  const counter = readJson<{ next: number }>(counterPath);
  const runNumber = counter.next;
  counter.next = runNumber + 1;
  writeJson(counterPath, counter);

  const runId = padRunId(runNumber);
  const runDir = join(baseDir, ".axion", "runs", runId);

  const subdirs = [
    "stage_reports",
    "gates",
    "intake",
    "standards",
    "canonical",
    "planning",
    "templates",
    "proof",
    "verification",
    "kit",
    "state",
    "state/handoff_packet",
  ];
  for (const sub of subdirs) {
    ensureDir(join(runDir, sub));
  }

  const now = isoNow();

  const stages: StageRun[] = STAGE_ORDER.map((sid) => ({
    stage_id: sid,
    status: "queued" as const,
    stage_report_ref: null,
  }));

  const manifest: RunManifest = {
    run_id: runId,
    status: "created",
    created_at: now,
    updated_at: now,
    pipeline: {
      pipeline_id: "axion_default",
      pipeline_version: "0.1.0",
    },
    profile: {
      profile_id: "default",
    },
    stage_order: [...STAGE_ORDER],
    stages,
    stage_gates: { ...STAGE_GATES },
    gates_required: [...GATES_REQUIRED],
    gate_reports: [],
    artifact_index_ref: "artifact_index.json",
    errors: [],
    policy_snapshot_ref: null,
    config: {},
  };

  const s0Stage = manifest.stages.find((s) => s.stage_id === "S0_INIT")!;
  s0Stage.status = "pass";
  s0Stage.stage_report_ref = "stage_reports/S0_INIT.json";
  manifest.status = "running";
  manifest.updated_at = isoNow();

  const s0Report: StageReport = {
    run_id: runId,
    stage_id: "S0_INIT",
    status: "pass",
    started_at: now,
    finished_at: isoNow(),
    consumed: [],
    produced: ["run_manifest.json", "artifact_index.json"],
    gate_reports: [],
    notes: [{ level: "info", message: "Run initialized successfully" }],
  };

  const manifestPath = join(runDir, "run_manifest.json");
  const s0Path = join(runDir, "stage_reports", "S0_INIT.json");
  const indexPath = join(runDir, "artifact_index.json");

  writeJson(manifestPath, manifest);
  writeJson(s0Path, s0Report);

  const index: ArtifactIndexEntry[] = [
    artifactEntry("manifest_001", "run_manifest", "run_manifest.json", hashFile(manifestPath), "S0_INIT", now),
    artifactEntry("stage_report_S0_INIT", "stage_report", "stage_reports/S0_INIT.json", hashFile(s0Path), "S0_INIT", now),
  ];

  writeJson(indexPath, index);
  index.push(artifactEntry("artifact_index_001", "artifact_index", "artifact_index.json", hashFile(indexPath), "S0_INIT", now));
  writeJson(indexPath, index);

  console.log(`Created run: ${runId}`);
  console.log(`  Run directory: ${runDir}`);
  return runId;
}
