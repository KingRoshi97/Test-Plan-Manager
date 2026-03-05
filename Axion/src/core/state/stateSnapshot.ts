import { join } from "node:path";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import { isoNow } from "../../utils/time.js";
import type { WorkBreakdownOutput } from "../planning/workBreakdown.js";
import type { AcceptanceMapOutput } from "../planning/acceptanceMap.js";

export interface UnitStatus {
  unit_id: string;
  title: string;
  status: "not_started" | "in_progress" | "done" | "blocked";
  started_at?: string;
  completed_at?: string;
  blocked_by?: string;
}

export interface AcceptanceStatus {
  acceptance_id: string;
  unit_id: string;
  status: "not_run" | "pending" | "pass" | "fail";
  proof_refs: string[];
  run_at?: string;
}

export interface Blocker {
  blocker_id: string;
  unit_id: string;
  description: string;
  severity: "low" | "medium" | "high";
  created_at: string;
}

export interface LastKnownGood {
  timestamp: string;
  verification_summary: string;
  gate_ids_passed: string[];
}

export interface StatePointers {
  status: "not_started" | "in_progress" | "completed" | "blocked";
  current_unit_id: string | null;
  next_unit_candidates: string[];
}

export interface StateMeta {
  state_id: string;
  submission_id: string;
  spec_id: string;
  work_breakdown_id: string;
  acceptance_map_id: string;
  run_id: string;
  created_at: string;
  updated_at: string;
  state_format_version: string;
}

export interface StateSnapshot {
  meta: StateMeta;
  pointers: StatePointers;
  unit_status: UnitStatus[];
  acceptance_status: AcceptanceStatus[];
  blockers: Blocker[];
  decisions: unknown[];
  unknowns_status: unknown[];
  last_known_good: LastKnownGood;
}

export function buildStateSnapshot(
  runId: string,
  workBreakdown: WorkBreakdownOutput,
  acceptanceMap: AcceptanceMapOutput
): StateSnapshot {
  const now = isoNow();
  const submissionId = workBreakdown.spec_id.replace(/^SPEC-/, "");
  const firstUnit = workBreakdown.units[0]?.unit_id ?? null;
  const nextCandidates = workBreakdown.units.slice(1, 3).map((u) => u.unit_id);

  const unitStatus: UnitStatus[] = workBreakdown.units.map((u) => ({
    unit_id: u.unit_id,
    title: u.title,
    status: "not_started" as const,
  }));

  const acceptanceStatusItems = acceptanceMap.acceptance_items ?? acceptanceMap.acceptance ?? [];
  const acceptanceStatus: AcceptanceStatus[] = acceptanceStatusItems.map((a) => ({
    acceptance_id: a.acceptance_id,
    unit_id: a.unit_id,
    status: "not_run" as const,
    proof_refs: [],
  }));

  return {
    meta: {
      state_id: `STATE-${runId}`,
      submission_id: submissionId,
      spec_id: workBreakdown.spec_id,
      work_breakdown_id: workBreakdown.work_breakdown_id,
      acceptance_map_id: acceptanceMap.acceptance_map_id,
      run_id: runId,
      created_at: now,
      updated_at: now,
      state_format_version: "1.0.0",
    },
    pointers: {
      status: "in_progress",
      current_unit_id: firstUnit,
      next_unit_candidates: nextCandidates,
    },
    unit_status: unitStatus,
    acceptance_status: acceptanceStatus,
    blockers: [],
    decisions: [],
    unknowns_status: [],
    last_known_good: {
      timestamp: now,
      verification_summary: "initial",
      gate_ids_passed: [],
    },
  };
}

export function writeStateSnapshot(runDir: string, snapshot: StateSnapshot): void {
  const outputPath = join(runDir, "state", "state_snapshot.json");
  writeCanonicalJson(outputPath, snapshot);
}

export function createPlaceholderStateSnapshot(runId: string): StateSnapshot {
  return {
    meta: {
      state_id: `STATE-${runId}`,
      submission_id: "unknown",
      spec_id: "unknown",
      work_breakdown_id: `WBD-${runId}`,
      acceptance_map_id: `ACCMAP-${runId}`,
      run_id: runId,
      created_at: isoNow(),
      updated_at: isoNow(),
      state_format_version: "1.0.0",
    },
    pointers: {
      status: "not_started",
      current_unit_id: null,
      next_unit_candidates: [],
    },
    unit_status: [],
    acceptance_status: [],
    blockers: [],
    decisions: [],
    unknowns_status: [],
    last_known_good: {
      timestamp: isoNow(),
      verification_summary: "initial",
      gate_ids_passed: [],
    },
  };
}
