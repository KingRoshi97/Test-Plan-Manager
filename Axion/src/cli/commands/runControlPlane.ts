import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import type { RunManifest, StageRun } from "../../types/run.js";
import { STAGE_ORDER, STAGE_GATES, GATES_REQUIRED } from "../../types/run.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";
import { resolveRunProfile } from "../../core/controlPlane/profiles.js";

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

export function cmdRunStart(baseDir: string = ".", submissionPath?: string): string {
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

  const registryPath = join(baseDir, "Axion", "registries", "RUN_PROFILE_REGISTRY.json");
  let resolvedProfileId = "default";
  let effectiveStageOrder = [...STAGE_ORDER];
  let effectiveStageGates = { ...STAGE_GATES };
  let effectiveGatesRequired = [...GATES_REQUIRED];

  if (existsSync(registryPath)) {
    try {
      const runContext = {
        run_id: runId,
        risk_class: "prototype" as const,
        executor_type_default: "internal" as const,
        targets: { platforms: ["web" as const], domains: ["default"] },
      };

      const { resolution, effectiveConfig } = resolveRunProfile(registryPath, runContext, runId);
      resolvedProfileId = resolution.resolved_profile_id;

      effectiveStageOrder = effectiveConfig.active_stages;
      effectiveGatesRequired = effectiveConfig.gates_required;
      effectiveStageGates = effectiveConfig.stage_gate_map;

      const resolutionPath = join(runDir, "run_profile_resolution_result.json");
      writeCanonicalJson(resolutionPath, resolution);

      const effectiveConfigPath = join(runDir, "effective_run_config.json");
      writeCanonicalJson(effectiveConfigPath, effectiveConfig);
    } catch {
      resolvedProfileId = "default";
    }
  }

  const manifest: RunManifest = {
    run_id: runId,
    status: "running",
    created_at: now,
    updated_at: now,
    pipeline: {
      pipeline_id: "axion_default",
      pipeline_version: "0.2.0",
    },
    profile: {
      profile_id: resolvedProfileId,
    },
    stage_order: [...STAGE_ORDER],
    stages,
    stage_gates: { ...STAGE_GATES },
    gates_required: [...GATES_REQUIRED],
    gate_reports: [],
    artifact_index_ref: "artifact_index.json",
    errors: [],
    policy_snapshot_ref: null,
    config: submissionPath ? { submission_path: submissionPath } : {},
  };

  const manifestPath = join(runDir, "run_manifest.json");
  const indexPath = join(runDir, "artifact_index.json");

  writeJson(manifestPath, manifest);

  const index: ArtifactIndexEntry[] = [
    artifactEntry("manifest_001", "run_manifest", "run_manifest.json", hashFile(manifestPath), "S1_INGEST_NORMALIZE", now),
  ];

  const resolutionFilePath = join(runDir, "run_profile_resolution_result.json");
  if (existsSync(resolutionFilePath)) {
    index.push(artifactEntry("profile_resolution_001", "run_profile_resolution", "run_profile_resolution_result.json", hashFile(resolutionFilePath), "S1_INGEST_NORMALIZE", now));
  }
  const effectiveConfigFilePath = join(runDir, "effective_run_config.json");
  if (existsSync(effectiveConfigFilePath)) {
    index.push(artifactEntry("effective_config_001", "effective_run_config", "effective_run_config.json", hashFile(effectiveConfigFilePath), "S1_INGEST_NORMALIZE", now));
  }

  writeJson(indexPath, index);
  index.push(artifactEntry("artifact_index_001", "artifact_index", "artifact_index.json", hashFile(indexPath), "S1_INGEST_NORMALIZE", now));
  writeJson(indexPath, index);

  console.log(`Created run: ${runId}`);
  console.log(`  Run directory: ${runDir}`);
  console.log(`  Profile: ${resolvedProfileId}`);
  return runId;
}
