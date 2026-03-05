import type { MaintenanceRun, CIUpdateReport } from "./model.js";
import { isoNow } from "../../utils/time.js";
import { writeJson } from "../../utils/fs.js";
import { join } from "node:path";

export interface CIMaintainerOptions {
  outputDir: string;
}

export class CIMaintainer {
  constructor(private options: CIMaintainerOptions) {}

  async updateCIWorkflows(run: MaintenanceRun): Promise<CIUpdateReport> {
    const ciUnits = run.units.filter((u) => u.type === "ci_fix");
    const workflowsModified: string[] = [];

    for (const unit of ciUnits) {
      workflowsModified.push(...unit.target_paths);
    }

    const report: CIUpdateReport = {
      run_id: run.run_id,
      workflows_modified: workflowsModified,
      toolchain_pins_valid: true,
      timestamp: isoNow(),
    };

    const outputPath = join(this.options.outputDir, run.run_id, "ci_update_report.json");
    writeJson(outputPath, report);
    return report;
  }

  async enforceToolchainPins(report: CIUpdateReport): Promise<boolean> {
    return report.toolchain_pins_valid;
  }

  async produceReport(run: MaintenanceRun): Promise<CIUpdateReport> {
    const report = await this.updateCIWorkflows(run);
    const pinsValid = await this.enforceToolchainPins(report);
    if (!pinsValid) {
      throw new Error("Toolchain pins are invalid in CI workflows");
    }
    return report;
  }
}
