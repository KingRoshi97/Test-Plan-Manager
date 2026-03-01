import { join } from "node:path";
import { createPlaceholderCompletionReport, writeCompletionReport } from "../../core/verification/completion.js";

export function cmdVerify(runId: string, runDir: string): void {
  const report = createPlaceholderCompletionReport(runId);
  const outputPath = join(runDir, "verification", "completion_report.json");
  writeCompletionReport(outputPath, report);
  console.log(`  Wrote completion_report.json`);
}
