import { runGatesForStage } from "../../core/gates/run.js";

export function cmdRunGates(baseDir: string, runId: string, stageId: string): void {
  console.log(`\nRunning gates for stage ${stageId} on run ${runId}...`);
  const result = runGatesForStage(baseDir, runId, stageId);

  if (result.reports.length === 0) {
    return;
  }

  console.log(`\nResult: ${result.all_passed ? "ALL PASSED" : "FAILED"}`);
  for (const report of result.reports) {
    console.log(`  ${report.gate_id}: ${report.status}`);
    if (report.status === "fail" && report.failure_codes.length > 0) {
      console.log(`    failure_codes: ${report.failure_codes.join(", ")}`);
    }
  }

  if (!result.all_passed) {
    process.exit(1);
  }
}
