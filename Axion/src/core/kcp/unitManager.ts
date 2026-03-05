import type { KitWorkUnit, WorkUnitStatus } from "./model.js";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";

export interface UnitStatusIndex {
  kit_run_id: string;
  total: number;
  by_status: Record<WorkUnitStatus, number>;
  units: Array<{ unit_id: string; status: WorkUnitStatus }>;
  next_unit_id: string | null;
  timestamp: string;
}

export interface PlanUnit {
  unit_id: string;
  target: string;
  dependencies: string[];
  acceptance_ids: string[];
}

export function loadPlanUnits(
  workBreakdown: Record<string, unknown>,
): PlanUnit[] {
  const units = workBreakdown.units as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(units)) return [];

  return units.map((u) => ({
    unit_id: (u.unit_id as string) ?? `UNIT-${sha256(JSON.stringify(u)).slice(0, 8)}`,
    target: (u.target as string) ?? (u.title as string) ?? "unknown",
    dependencies: Array.isArray(u.dependencies) ? (u.dependencies as string[]) : [],
    acceptance_ids: Array.isArray(u.acceptance_ids) ? (u.acceptance_ids as string[]) : [],
  }));
}

export function createWorkUnits(planUnits: PlanUnit[]): KitWorkUnit[] {
  return planUnits.map((pu) => ({
    unit_id: pu.unit_id,
    status: "not_started" as WorkUnitStatus,
    attempt_history: [],
    implementation_refs: [],
    proof_refs: [],
    verification_results: [],
  }));
}

export function enforceOneTargetRule(planUnits: PlanUnit[]): string[] {
  const violations: string[] = [];
  const targets = new Set<string>();

  for (const unit of planUnits) {
    if (targets.has(unit.target)) {
      violations.push(`Duplicate target "${unit.target}" in unit ${unit.unit_id}`);
    }
    targets.add(unit.target);
  }

  return violations;
}

export function getNextUnit(units: KitWorkUnit[]): KitWorkUnit | null {
  return units.find((u) => u.status === "not_started") ?? null;
}

export function buildUnitStatusIndex(
  kitRunId: string,
  units: KitWorkUnit[],
): UnitStatusIndex {
  const byStatus: Record<WorkUnitStatus, number> = {
    not_started: 0,
    in_progress: 0,
    done: 0,
    failed: 0,
    skipped: 0,
  };

  for (const unit of units) {
    byStatus[unit.status]++;
  }

  const nextUnit = getNextUnit(units);

  return {
    kit_run_id: kitRunId,
    total: units.length,
    by_status: byStatus,
    units: units.map((u) => ({ unit_id: u.unit_id, status: u.status })),
    next_unit_id: nextUnit?.unit_id ?? null,
    timestamp: isoNow(),
  };
}
