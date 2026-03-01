import { join } from "node:path";
import { createPlaceholderGateReport, writeGateReport } from "../../core/gates/report.js";

export function cmdRunGates(runId: string, runDir: string): void {
  const gateId = "gate_placeholder";
  const report = createPlaceholderGateReport(gateId, runId);
  const outputPath = join(runDir, "gates", `${gateId}.gate_report.json`);
  writeGateReport(outputPath, report);
  console.log(`  Wrote gate report: ${outputPath}`);
}
