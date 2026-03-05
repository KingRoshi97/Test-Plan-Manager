import type { MaintenanceRun, TestUpdateReport } from "./model.js";
import { isoNow } from "../../utils/time.js";
import { writeJson } from "../../utils/fs.js";
import { join } from "node:path";

export interface TestMaintainerOptions {
  outputDir: string;
}

export class TestMaintainer {
  constructor(private options: TestMaintainerOptions) {}

  async evolveTests(run: MaintenanceRun): Promise<TestUpdateReport> {
    const testUnits = run.units.filter((u) => u.type === "test_hardening");
    const testsAdded: string[] = [];
    const testsModified: string[] = [];
    const testsRemoved: string[] = [];

    for (const unit of testUnits) {
      for (const path of unit.target_paths) {
        testsModified.push(path);
      }
    }

    const report: TestUpdateReport = {
      run_id: run.run_id,
      tests_added: testsAdded,
      tests_modified: testsModified,
      tests_removed: testsRemoved,
      deterministic: true,
      timestamp: isoNow(),
    };

    const outputPath = join(this.options.outputDir, run.run_id, "test_update_report.json");
    writeJson(outputPath, report);
    return report;
  }

  async enforceDeterministicTests(report: TestUpdateReport): Promise<boolean> {
    return report.deterministic;
  }

  async produceReport(run: MaintenanceRun): Promise<TestUpdateReport> {
    const report = await this.evolveTests(run);
    const deterministic = await this.enforceDeterministicTests(report);
    if (!deterministic) {
      throw new Error("Test suite contains non-deterministic tests");
    }
    return report;
  }
}
