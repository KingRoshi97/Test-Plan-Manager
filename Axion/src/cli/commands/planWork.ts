import { join } from "node:path";
import { createPlaceholderWorkBreakdown, writeWorkBreakdown } from "../../core/planning/workBreakdown.js";
import { createPlaceholderAcceptanceMap, writeAcceptanceMap } from "../../core/planning/acceptanceMap.js";
import { createPlaceholderSequencingReport, writeSequencingReport } from "../../core/planning/sequencing.js";

export function cmdPlanWork(runId: string, runDir: string): void {
  const planDir = join(runDir, "planning");

  const wb = createPlaceholderWorkBreakdown(runId);
  writeWorkBreakdown(join(planDir, "work_breakdown.json"), wb);
  console.log(`  Wrote work_breakdown.json`);

  const am = createPlaceholderAcceptanceMap(runId);
  writeAcceptanceMap(join(planDir, "acceptance_map.json"), am);
  console.log(`  Wrote acceptance_map.json`);

  const sr = createPlaceholderSequencingReport(runId);
  writeSequencingReport(join(planDir, "sequencing_report.json"), sr);
  console.log(`  Wrote sequencing_report.json`);
}
