import type { MaintenanceRun, AxionCompatibilityReport } from "./model.js";
import { isoNow } from "../../utils/time.js";
import { writeJson } from "../../utils/fs.js";
import { join } from "node:path";

export interface AxionIntegrationOptions {
  outputDir: string;
}

const AXION_CONTRACTS = [
  "intake_schema",
  "canonical_spec",
  "kit_manifest",
  "gate_model",
  "proof_log",
  "pipeline_definition",
  "template_index",
  "run_state_machine",
];

export class AxionIntegrationMaintainer {
  constructor(private options: AxionIntegrationOptions) {}

  async checkCompatibility(run: MaintenanceRun): Promise<AxionCompatibilityReport> {
    const breakingChanges: string[] = [];

    for (const unit of run.units) {
      for (const path of unit.target_paths) {
        for (const contract of AXION_CONTRACTS) {
          if (path.includes(contract)) {
            breakingChanges.push(
              `Unit ${unit.unit_id} modifies AXION contract artifact: ${path}`
            );
          }
        }
      }
    }

    const report: AxionCompatibilityReport = {
      run_id: run.run_id,
      contracts_checked: AXION_CONTRACTS,
      all_compatible: breakingChanges.length === 0,
      breaking_changes: breakingChanges,
      timestamp: isoNow(),
    };

    const outputPath = join(
      this.options.outputDir,
      run.run_id,
      "axion_compatibility_report.json"
    );
    writeJson(outputPath, report);
    return report;
  }

  async produceReport(run: MaintenanceRun): Promise<AxionCompatibilityReport> {
    return this.checkCompatibility(run);
  }
}
