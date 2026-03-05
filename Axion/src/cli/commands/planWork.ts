import { join } from "node:path";
import { createPlaceholderSequencingReport, writeSequencingReport } from "../../core/planning/sequencing.js";

export function cmdPlanWork(runId: string, runDir: string): void {
  const planDir = join(runDir, "planning");

  const sr = createPlaceholderSequencingReport(runId);
  writeSequencingReport(join(planDir, "sequencing_report.json"), sr);
  console.log(`  Wrote sequencing_report.json`);
}
