import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { readJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { WorkUnitState } from "../../types/controlPlane.js";
import type { PlanUnit, UnitStatusIndex, UnitStatusEntry } from "./types.js";
import { transitionWorkUnit } from "./stateMachine.js";

export function loadPlanUnits(kitDir: string): PlanUnit[] {
  const unitsDir = join(kitDir, "plan_units");
  if (!existsSync(unitsDir)) {
    return [];
  }
  const files = readdirSync(unitsDir).filter((f) => f.endsWith(".json")).sort();
  return files.map((f) => readJson<PlanUnit>(join(unitsDir, f)));
}

export function enforceOneTarget(unit: PlanUnit): void {
  const targets = unit.target.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
  if (targets.length > 1) {
    throw new Error(
      `Plan unit ${unit.unit_id} violates 1-target rule: found ${targets.length} targets (${targets.join(", ")}). Each unit must target exactly one artifact.`
    );
  }
  if (targets.length === 0) {
    throw new Error(`Plan unit ${unit.unit_id} has no target defined.`);
  }
}

export function recommendNextUnit(
  units: PlanUnit[],
  completedUnits: Set<string>
): PlanUnit | null {
  const candidates = units.filter((u) => {
    if (completedUnits.has(u.unit_id)) return false;
    return u.dependencies.every((dep) => completedUnits.has(dep));
  });

  candidates.sort((a, b) => a.unit_id.localeCompare(b.unit_id));

  return candidates[0] ?? null;
}

export function createUnitStatusIndex(kitId: string, units: PlanUnit[]): UnitStatusIndex {
  const entries: Record<string, UnitStatusEntry> = {};
  for (const unit of units) {
    entries[unit.unit_id] = {
      unit_id: unit.unit_id,
      state: "NOT_STARTED",
      attempt_id: `attempt_${unit.unit_id}_001`,
      started_at: null,
      completed_at: null,
      prior_attempt_refs: [],
    };
  }
  return { kit_id: kitId, units: entries, updated_at: isoNow() };
}

export function trackUnitStatus(
  index: UnitStatusIndex,
  unitId: string,
  state: WorkUnitState,
  attemptId: string
): UnitStatusIndex {
  const entry = index.units[unitId];
  if (!entry) {
    throw new Error(`Unit ${unitId} not found in status index`);
  }

  transitionWorkUnit(entry.state, state);

  const now = isoNow();
  const updatedEntry: UnitStatusEntry = {
    ...entry,
    state,
    attempt_id: attemptId,
    started_at: state === "IN_PROGRESS" ? now : entry.started_at,
    completed_at: state === "DONE" || state === "FAILED" || state === "SKIPPED" ? now : entry.completed_at,
    prior_attempt_refs:
      attemptId !== entry.attempt_id
        ? [...entry.prior_attempt_refs, entry.attempt_id]
        : entry.prior_attempt_refs,
  };

  return {
    ...index,
    units: { ...index.units, [unitId]: updatedEntry },
    updated_at: now,
  };
}
