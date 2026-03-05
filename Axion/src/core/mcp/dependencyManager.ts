import type { MaintenanceRun, DependencyUpdateReport, DependencyDelta } from "./model.js";
import { isoNow } from "../../utils/time.js";
import { writeJson, readJson } from "../../utils/fs.js";
import { existsSync } from "node:fs";
import { join } from "node:path";

export interface DependencyManagerOptions {
  outputDir: string;
}

export class DependencyManager {
  constructor(private options: DependencyManagerOptions) {}

  async analyzeDependencies(run: MaintenanceRun, lockfilePath: string): Promise<DependencyDelta[]> {
    const deltas: DependencyDelta[] = [];
    const units = run.units.filter((u) => u.type === "dep_upgrade");
    for (const unit of units) {
      for (const targetPath of unit.target_paths) {
        if (existsSync(targetPath)) {
          try {
            const pkg = readJson<Record<string, unknown>>(targetPath);
            const deps = (pkg.dependencies ?? {}) as Record<string, string>;
            for (const [name, version] of Object.entries(deps)) {
              deltas.push({
                package_name: name,
                from_version: version,
                to_version: version,
                breaking: false,
              });
            }
          } catch {
            // skip unparseable files
          }
        }
      }
    }
    return deltas;
  }

  async bumpDependencies(
    run: MaintenanceRun,
    deltas: DependencyDelta[]
  ): Promise<DependencyUpdateReport> {
    const report: DependencyUpdateReport = {
      run_id: run.run_id,
      deltas,
      lockfile_updated: deltas.length > 0,
      timestamp: isoNow(),
    };
    const outputPath = join(this.options.outputDir, run.run_id, "dependency_update_report.json");
    writeJson(outputPath, report);
    return report;
  }

  async validateLockfileDiscipline(lockfilePath: string): Promise<boolean> {
    return existsSync(lockfilePath);
  }

  async produceReport(run: MaintenanceRun): Promise<DependencyUpdateReport> {
    const deltas = await this.analyzeDependencies(run, "");
    return this.bumpDependencies(run, deltas);
  }
}
