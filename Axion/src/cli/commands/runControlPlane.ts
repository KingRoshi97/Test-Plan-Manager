import { join } from "node:path";
import { readFileSync } from "node:fs";
import { sha256 } from "../../utils/hash.js";
import { writeJson, ensureDir } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { ArtifactIndexEntry } from "../../types/artifacts.js";
import type { StageId } from "../../types/run.js";
import { STAGE_ORDER } from "../../types/run.js";
import { RunController } from "../../core/controlPlane/api.js";
import { JSONRunStore } from "../../core/controlPlane/store.js";
import { AuditLogger } from "../../core/controlPlane/audit.js";
import { icpRunToManifest } from "../../core/controlPlane/model.js";
import { executeStageWithGates } from "./runStage.js";

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

export function createRunController(baseDir: string = "."): RunController {
  const axionDir = join(baseDir, ".axion");
  ensureDir(axionDir);
  const store = new JSONRunStore(axionDir);
  const auditLogger = new AuditLogger(join(axionDir, "audit.jsonl"));
  return new RunController(store, auditLogger, baseDir);
}

export async function cmdRunStart(baseDir: string = "."): Promise<string> {
  const controller = createRunController(baseDir);
  const run = await controller.createRun({});

  const runDir = join(baseDir, ".axion", "runs", run.run_id);
  const now = isoNow();

  const manifest = icpRunToManifest(run);
  const manifestPath = join(runDir, "run_manifest.json");
  writeJson(manifestPath, manifest);

  const indexPath = join(runDir, "artifact_index.json");
  const index: ArtifactIndexEntry[] = [
    artifactEntry("manifest_001", "run_manifest", "run_manifest.json", hashFile(manifestPath), "S1_INGEST_NORMALIZE", now),
  ];

  writeJson(indexPath, index);
  index.push(artifactEntry("artifact_index_001", "artifact_index", "artifact_index.json", hashFile(indexPath), "S1_INGEST_NORMALIZE", now));
  writeJson(indexPath, index);

  return run.run_id;
}

export async function cmdRunFull(baseDir: string = "."): Promise<void> {
  const controller = createRunController(baseDir);

  console.log("\n[1/2] Creating new run via ICP...");
  const run = await controller.createRun({});
  const runId = run.run_id;
  const runDir = join(baseDir, ".axion", "runs", runId);
  const now = isoNow();

  const manifest = icpRunToManifest(run);
  const manifestPath = join(runDir, "run_manifest.json");
  writeJson(manifestPath, manifest);

  const indexPath = join(runDir, "artifact_index.json");
  const index: ArtifactIndexEntry[] = [
    artifactEntry("manifest_001", "run_manifest", "run_manifest.json", hashFile(manifestPath), "S1_INGEST_NORMALIZE", now),
  ];
  writeJson(indexPath, index);
  index.push(artifactEntry("artifact_index_001", "artifact_index", "artifact_index.json", hashFile(indexPath), "S1_INGEST_NORMALIZE", now));
  writeJson(indexPath, index);

  console.log(`\n[2/2] Executing ${STAGE_ORDER.length} stages via ICP control plane...`);

  for (const stageId of STAGE_ORDER) {
    await controller.advanceStage(runId, stageId);

    const generatedAt = run.created_at;
    const result = executeStageWithGates(baseDir, runDir, runId, stageId as StageId, generatedAt);

    const stageResult = result.passed ? "pass" : "fail";
    await controller.recordStageResult(runId, stageId, stageResult as "pass" | "fail", result.reportRelPath);

    if (!result.passed) {
      console.error(`Pipeline halted: stage ${stageId} failed`);
      process.exit(1);
    }
  }

  await controller.completeRun(runId);

  console.log(`\nDone. Run ${runId} released. Artifacts in: ${runDir}`);
}
