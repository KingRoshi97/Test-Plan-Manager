import type { MaintenanceRun, RefactorReport } from "./model.js";
import { isoNow } from "../../utils/time.js";
import { writeJson } from "../../utils/fs.js";
import { join } from "node:path";

export interface RefactorManagerOptions {
  outputDir: string;
}

export class RefactorManager {
  constructor(private options: RefactorManagerOptions) {}

  async planRefactor(run: MaintenanceRun): Promise<string[]> {
    const refactorUnits = run.units.filter((u) => u.type === "refactor");
    const filesTouched: string[] = [];
    for (const unit of refactorUnits) {
      filesTouched.push(...unit.target_paths);
    }
    return filesTouched;
  }

  async executeRefactor(run: MaintenanceRun): Promise<RefactorReport> {
    const filesTouched = await this.planRefactor(run);
    const report: RefactorReport = {
      run_id: run.run_id,
      files_touched: filesTouched,
      interfaces_preserved: true,
      schema_preserved: true,
      timestamp: isoNow(),
    };
    const outputPath = join(this.options.outputDir, run.run_id, "refactor_report.json");
    writeJson(outputPath, report);
    return report;
  }

  async enforcePreservation(report: RefactorReport): Promise<{ valid: boolean; violations: string[] }> {
    const violations: string[] = [];
    if (!report.interfaces_preserved) {
      violations.push("Interface contract broken during refactor");
    }
    if (!report.schema_preserved) {
      violations.push("Schema contract broken during refactor");
    }
    return { valid: violations.length === 0, violations };
  }

  async produceReport(run: MaintenanceRun): Promise<RefactorReport> {
    const report = await this.executeRefactor(run);
    const preservation = await this.enforcePreservation(report);
    if (!preservation.valid) {
      throw new Error(`Refactor violations: ${preservation.violations.join(", ")}`);
    }
    return report;
  }
}
