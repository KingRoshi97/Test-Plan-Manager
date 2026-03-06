import { join } from "node:path";
import { readFileSync, existsSync, unlinkSync, copyFileSync } from "node:fs";
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
import { getStageOrder } from "../../core/orchestration/loader.js";
import { setActiveRun, getRunUsage } from "../../core/usage/tracker.js";

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

  const pendingIntakePath = process.env.AXION_PENDING_INTAKE || join(baseDir, ".axion", "pending_intake.json");
  if (existsSync(pendingIntakePath)) {
    const intakeDir = join(runDir, "intake");
    ensureDir(intakeDir);
    copyFileSync(pendingIntakePath, join(intakeDir, "raw_submission.json"));
    try { unlinkSync(pendingIntakePath); } catch {}
    console.log("  Intake payload loaded from pending submission");
  }

  const orchOrder = getStageOrder(baseDir);
  const effectiveOrder = orchOrder.length > 0 ? orchOrder : [...STAGE_ORDER];

  setActiveRun(runId);

  console.log(`\n[2/2] Executing ${effectiveOrder.length} stages via ICP control plane...`);

  for (const stageId of effectiveOrder) {
    await controller.advanceStage(runId, stageId);

    const generatedAt = run.created_at;
    const result = await executeStageWithGates(baseDir, runDir, runId, stageId as StageId, generatedAt);

    const stageResult = result.passed ? "pass" : "fail";
    await controller.recordStageResult(runId, stageId, stageResult as "pass" | "fail", result.reportRelPath);

    if (!result.passed) {
      console.error(`Pipeline halted: stage ${stageId} failed`);
      process.exit(1);
    }
  }

  await controller.completeRun(runId);

  const usageSummary = getRunUsage(runId) ?? {
    run_id: runId,
    total_prompt_tokens: 0,
    total_completion_tokens: 0,
    total_tokens: 0,
    total_cost_usd: 0,
    api_calls: 0,
    by_stage: {},
    entries: [],
  };
  writeJson(join(runDir, "token_usage.json"), usageSummary);
  if (usageSummary.api_calls > 0) {
    console.log(`  [IA] Token usage: ${usageSummary.total_tokens} tokens, $${usageSummary.total_cost_usd.toFixed(4)} estimated cost, ${usageSummary.api_calls} API calls`);
  }

  console.log(`\nDone. Run ${runId} released. Artifacts in: ${runDir}`);
}
