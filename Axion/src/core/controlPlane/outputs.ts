import { writeFileSync, appendFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import type {
  RunContext,
  RunLogEntry,
  ICPStageReport,
  ICPGateReport,
  Pinset,
  StateSnapshot,
  EvidencePointer,
} from "../../types/controlPlane.js";
import type { Run } from "./model.js";
import { canonicalJsonString } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";

function ensureParent(filePath: string): void {
  mkdirSync(dirname(filePath), { recursive: true });
}

export function writeRunManifest(runDir: string, run: Run): string {
  const outPath = join(runDir, "run_manifest.json");
  ensureParent(outPath);
  const manifest = {
    run_id: run.run_id,
    state: run.state,
    run_context: run.run_context,
    pinset_ref: run.pinset_ref,
    stages: run.stages.map((s) => ({
      stage_id: s.stage_id,
      state: s.state,
      stage_report_ref: s.stage_report_ref,
      attempt_count: s.attempts.length,
    })),
    gate_reports: run.gate_reports,
    audit_trail_ref: run.audit_trail_ref,
    created_at: run.created_at,
    updated_at: run.updated_at,
  };
  writeFileSync(outPath, canonicalJsonString(manifest));
  return outPath;
}

export function writeRunLog(runDir: string, entry: RunLogEntry): string {
  const outPath = join(runDir, "run_log.jsonl");
  ensureParent(outPath);
  appendFileSync(outPath, JSON.stringify(entry) + "\n");
  return outPath;
}

export function appendRunLogEntry(
  runDir: string,
  runId: string,
  eventType: RunLogEntry["event_type"],
  message: string,
  refs: Record<string, string> = {},
  stageId?: string,
  gateId?: string,
): void {
  const entry: RunLogEntry = {
    timestamp: isoNow(),
    event_type: eventType,
    run_id: runId,
    stage_id: stageId,
    gate_id: gateId,
    message,
    refs,
  };
  writeRunLog(runDir, entry);
}

export function writeICPStageReport(runDir: string, report: ICPStageReport): string {
  const outPath = join(runDir, "stage_reports", `${report.stage_id}.json`);
  ensureParent(outPath);
  writeFileSync(outPath, canonicalJsonString(report));
  return outPath;
}

export function writeICPGateReport(runDir: string, report: ICPGateReport): string {
  const outPath = join(runDir, "gates", "icp_gate_report.json");
  ensureParent(outPath);
  writeFileSync(outPath, canonicalJsonString(report));
  return outPath;
}

export function writePinset(runDir: string, pinset: Pinset): string {
  const outPath = join(runDir, "pinset.json");
  ensureParent(outPath);
  writeFileSync(outPath, canonicalJsonString(pinset));
  return outPath;
}

export function writeStateSnapshot(runDir: string, snapshot: StateSnapshot): string {
  const outPath = join(runDir, "state", "state_snapshot.json");
  ensureParent(outPath);
  writeFileSync(outPath, canonicalJsonString(snapshot));
  return outPath;
}

export function buildStateSnapshot(
  runId: string,
  stageStatuses: Record<string, string>,
  artifactInventory: EvidencePointer[],
  lastKnownGood: string | null = null,
  rollbackPointer: string | null = null,
): StateSnapshot {
  return {
    run_id: runId,
    stage_statuses: stageStatuses as Record<string, import("../../types/controlPlane.js").StageState>,
    artifact_inventory: artifactInventory,
    last_known_good: lastKnownGood,
    rollback_pointer: rollbackPointer,
    captured_at: isoNow(),
  };
}
