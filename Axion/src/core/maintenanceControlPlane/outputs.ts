import type { MaintenanceRunReport } from "../../types/controlPlane.js";
import type {
  MaintenanceRun,
  DependencyUpdateReport,
  MigrationPlan,
  MigrationVerificationReport,
  TestUpdateReport,
  RefactorReport,
  CIUpdateReport,
  AxionCompatibilityReport,
  MaintenanceFailureReport,
} from "./types.js";
import { writeJson, appendJsonl, ensureDir } from "../../utils/fs.js";
import { join } from "node:path";

export function writeMaintenanceRunManifest(runDir: string, run: MaintenanceRun): string {
  const path = join(runDir, "maintenance_run_manifest.json");
  writeJson(path, {
    artifact_type: "O-01_maintenance_run_manifest",
    ...run,
  });
  return path;
}

export function writeMaintenanceRunLog(runDir: string, entry: Record<string, unknown>): string {
  const path = join(runDir, "maintenance_run_log.jsonl");
  appendJsonl(path, entry);
  return path;
}

export function writeDependencyUpdateReport(runDir: string, report: DependencyUpdateReport): string {
  const path = join(runDir, "dependency_update_report.json");
  writeJson(path, { artifact_type: "O-03_dependency_update_report", ...report });
  return path;
}

export function writeMigrationPlan(runDir: string, plan: MigrationPlan): string {
  const path = join(runDir, "migration_plan.json");
  writeJson(path, { artifact_type: "O-04_migration_plan", ...plan });
  return path;
}

export function writeMigrationVerificationReport(runDir: string, report: MigrationVerificationReport): string {
  const path = join(runDir, "migration_verification_report.json");
  writeJson(path, { artifact_type: "O-05_migration_verification_report", ...report });
  return path;
}

export function writeTestUpdateReport(runDir: string, report: TestUpdateReport): string {
  const path = join(runDir, "test_update_report.json");
  writeJson(path, { artifact_type: "O-06_test_update_report", ...report });
  return path;
}

export function writeRefactorReport(runDir: string, report: RefactorReport): string {
  const path = join(runDir, "refactor_report.json");
  writeJson(path, { artifact_type: "O-07_refactor_report", ...report });
  return path;
}

export function writeCIUpdateReport(runDir: string, report: CIUpdateReport): string {
  const path = join(runDir, "ci_update_report.json");
  writeJson(path, { artifact_type: "O-08_ci_update_report", ...report });
  return path;
}

export function writeAxionCompatibilityReport(runDir: string, report: AxionCompatibilityReport): string {
  const path = join(runDir, "axion_compatibility_report.json");
  writeJson(path, { artifact_type: "O-09_axion_compatibility_report", ...report });
  return path;
}

export function writeMaintenanceRunReport(runDir: string, report: MaintenanceRunReport): string {
  const path = join(runDir, "maintenance_run_report.json");
  writeJson(path, { artifact_type: "O-10_maintenance_run_report", ...report });
  return path;
}

export function writeMaintenanceFailureReport(runDir: string, report: MaintenanceFailureReport): string {
  const path = join(runDir, "maintenance_failure_report.json");
  writeJson(path, { artifact_type: "maintenance_failure_report", ...report });
  return path;
}

export function writeMaintenanceStateSnapshot(
  runDir: string,
  run: MaintenanceRun,
  artifactInventory: Array<{ artifact_id: string; path: string }>,
): string {
  const path = join(runDir, "maintenance_state_snapshot.json");
  writeJson(path, {
    artifact_type: "maintenance_state_snapshot",
    maintenance_run_id: run.maintenance_run_id,
    state: run.state,
    modules_executed: run.modules_executed,
    state_transitions: run.state_transitions,
    artifact_inventory: artifactInventory,
    captured_at: run.updated_at,
  });
  return path;
}

export function initRunDir(baseDir: string, runId: string): string {
  const runDir = join(baseDir, runId);
  ensureDir(runDir);
  return runDir;
}
