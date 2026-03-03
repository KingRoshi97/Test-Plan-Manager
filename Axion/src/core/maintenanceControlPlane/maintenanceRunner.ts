import type { MaintenanceIntent, MaintenanceRunReport, MaintenanceRunState } from "../../types/controlPlane.js";
import type { MaintenanceRun } from "./types.js";
import { transitionMaintenance } from "./stateMachine.js";
import { isoNow } from "../../utils/time.js";
import { shortHash } from "../../utils/hash.js";

export function interpretMaintenanceMode(modeId: string | undefined): string[] {
  const moduleMap: Record<string, string[]> = {
    dependency_upgrade: ["dependencyManager"],
    migration: ["migrationManager"],
    test_hardening: ["testMaintainer"],
    refactor: ["refactorManager"],
    ci_fix: ["ciMaintainer"],
    axion_compat: ["axionCompat"],
    general: ["dependencyManager", "testMaintainer", "ciMaintainer", "axionCompat"],
  };
  return moduleMap[modeId ?? "general"] ?? moduleMap["general"];
}

export function createMaintenanceRun(
  intent: MaintenanceIntent,
  repoRevision: string,
): MaintenanceRun {
  const runId = `MAINT-${shortHash(JSON.stringify(intent) + repoRevision + isoNow())}`;
  return {
    maintenance_run_id: runId,
    state: "PLANNED",
    intent,
    repo_revision_baseline: repoRevision,
    modules_executed: [],
    state_transitions: ["PLANNED"],
    created_at: isoNow(),
    updated_at: isoNow(),
  };
}

export function advanceMaintenanceState(
  run: MaintenanceRun,
  to: MaintenanceRunState,
): MaintenanceRun {
  const newState = transitionMaintenance(run.state, to);
  return {
    ...run,
    state: newState,
    state_transitions: [...run.state_transitions, newState],
    updated_at: isoNow(),
  };
}

export function recordModuleExecution(
  run: MaintenanceRun,
  moduleId: string,
): MaintenanceRun {
  return {
    ...run,
    modules_executed: [...run.modules_executed, moduleId],
    updated_at: isoNow(),
  };
}

export function executeMaintenanceRun(
  intent: MaintenanceIntent,
  _repoPath: string,
  _policy: Record<string, unknown>,
): MaintenanceRunReport {
  const modules = interpretMaintenanceMode(intent.intent_type);
  const now = isoNow();

  return {
    maintenance_run_id: `MAINT-${shortHash(JSON.stringify(intent) + now)}`,
    repo_revision_baseline: "HEAD",
    intent,
    state: "COMPLETE",
    modules_executed: modules,
    state_transitions: ["PLANNED", "APPLYING", "VERIFYING", "COMPLETE"],
    change_summary: {
      files_touched: 0,
    },
    verification_summary: {
      commands: [],
    },
    created_at: now,
    updated_at: now,
  };
}

export function buildMaintenanceRunReport(
  run: MaintenanceRun,
  changeSummary: MaintenanceRunReport["change_summary"],
  verificationSummary: MaintenanceRunReport["verification_summary"],
  compatibilitySummary?: MaintenanceRunReport["compatibility_summary"],
  remediation?: MaintenanceRunReport["remediation"],
): MaintenanceRunReport {
  return {
    maintenance_run_id: run.maintenance_run_id,
    repo_revision_baseline: run.repo_revision_baseline,
    intent: run.intent,
    state: run.state,
    modules_executed: run.modules_executed,
    state_transitions: run.state_transitions,
    change_summary: changeSummary,
    verification_summary: verificationSummary,
    compatibility_summary: compatibilitySummary,
    remediation,
    created_at: run.created_at,
    updated_at: run.updated_at,
  };
}
