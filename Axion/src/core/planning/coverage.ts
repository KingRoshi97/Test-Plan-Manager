import { isoNow } from "../../utils/time.js";
import type { CanonicalSpec } from "../canonical/specBuilder.js";
import type { WorkBreakdownOutput } from "./workBreakdown.js";
import type { AcceptanceMapOutput } from "./acceptanceMap.js";

export interface UncoveredItem {
  ref: string;
  type: string;
  reason?: string;
}

export interface CoverageReportOutput {
  run_id: string;
  spec_id: string;
  checked_at: string;
  total_items: number;
  covered_items: number;
  coverage_percent: number;
  uncovered: UncoveredItem[];
}

export function calculateCoverage(
  canonicalSpec: CanonicalSpec,
  workBreakdown: WorkBreakdownOutput,
  acceptanceMap: AcceptanceMapOutput,
  runId: string
): CoverageReportOutput {
  const specId = canonicalSpec.meta.spec_id;

  const specItems: Array<{ ref: string; type: string }> = [];

  for (const f of canonicalSpec.entities.features) {
    specItems.push({ ref: f.feature_id, type: "feature" });
  }
  for (const w of canonicalSpec.entities.workflows) {
    specItems.push({ ref: w.workflow_id, type: "workflow" });
  }
  for (const r of canonicalSpec.entities.roles) {
    specItems.push({ ref: r.role_id, type: "role" });
  }
  for (const p of canonicalSpec.entities.permissions) {
    specItems.push({ ref: p.perm_id, type: "permission" });
  }

  const coveredRefs = new Set<string>();
  for (const unit of workBreakdown.units) {
    for (const ref of unit.scope_refs) {
      coveredRefs.add(ref);
    }
  }

  const uncovered: UncoveredItem[] = [];
  let coveredCount = 0;

  for (const item of specItems) {
    if (coveredRefs.has(item.ref)) {
      coveredCount++;
    } else {
      uncovered.push({
        ref: item.ref,
        type: item.type,
        reason: "No work unit references this spec item",
      });
    }
  }

  const totalItems = specItems.length;
  const coveragePercent = totalItems > 0 ? Math.round((coveredCount / totalItems) * 10000) / 100 : 100;

  return {
    run_id: runId,
    spec_id: specId,
    checked_at: isoNow(),
    total_items: totalItems,
    covered_items: coveredCount,
    coverage_percent: coveragePercent,
    uncovered,
  };
}
