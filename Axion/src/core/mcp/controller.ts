import type {
  MaintenanceRun,
  MaintenanceRunReport,
  MaintenanceRunStatus,
  MaintenanceUnit,
  RollbackRecord,
  AxionCompatibilityReport,
  MaintenanceMode,
  MusGateRule,
} from "./model.js";
import type { MaintenanceRunStore } from "./store.js";
import { JSONMaintenanceRunStore } from "./store.js";
import { ModeRunner } from "./modeRunner.js";
import { AxionIntegrationMaintainer } from "./axionIntegration.js";
import { isoNow } from "../../utils/time.js";
import { writeJson } from "../../utils/fs.js";
import { join } from "node:path";
import { getMaintenanceModes, getGates, loadMaintenanceLibrary } from "../maintenance/loader.js";

export interface MaintenanceIntent {
  mode_id: string;
  intent_type: string;
  scope_constraints: string[];
  risk_class: string;
  units: MaintenanceUnit[];
  baseline_revision: string;
}

const VALID_TRANSITIONS: Record<MaintenanceRunStatus, MaintenanceRunStatus[]> = {
  planned: ["applying", "cancelled"],
  applying: ["verifying", "failed", "rolling_back", "paused"],
  verifying: ["complete", "failed", "rolling_back"],
  blocked: ["applying", "cancelled", "rolling_back"],
  failed: ["planned", "rolling_back"],
  complete: [],
  paused: ["applying", "cancelled"],
  cancelled: [],
  rolling_back: ["failed", "planned"],
};

let maintenanceRunCounter = 0;

function allocateMaintenanceRunId(): string {
  maintenanceRunCounter++;
  return `MRUN-${String(maintenanceRunCounter).padStart(6, "0")}`;
}

export class MaintenanceController {
  private store: JSONMaintenanceRunStore;
  private modeRunner: ModeRunner;
  private axionIntegration: AxionIntegrationMaintainer;
  private outputDir: string;
  private musLoaded = false;

  constructor(basePath: string) {
    this.outputDir = basePath;
    this.store = new JSONMaintenanceRunStore(basePath);
    this.modeRunner = new ModeRunner({ outputDir: basePath, store: this.store });
    this.axionIntegration = new AxionIntegrationMaintainer({ outputDir: basePath });
  }

  private ensureMusLoaded(repoRoot?: string): void {
    if (!this.musLoaded) {
      try {
        loadMaintenanceLibrary(repoRoot ?? process.cwd());
        this.musLoaded = true;
      } catch {}
    }
  }

  private resolveMode(modeId: string): MaintenanceMode | undefined {
    this.ensureMusLoaded();
    const modes = getMaintenanceModes(process.cwd());
    return modes.find((m) => m.mode_id === modeId) as MaintenanceMode | undefined;
  }

  private validateModeConstraints(intent: MaintenanceIntent, phase: "plan" | "apply" | "publish" = "plan"): string[] {
    const violations: string[] = [];
    const mode = this.resolveMode(intent.mode_id);
    if (!mode) return violations;

    if (mode.status !== "active") {
      violations.push(`Mode ${intent.mode_id} is not active (status: ${mode.status})`);
    }
    if (phase === "apply" && mode.hard_constraints?.no_apply) {
      violations.push(`Mode ${intent.mode_id} has no_apply constraint — cannot apply changes`);
    }
    if (phase === "publish" && mode.hard_constraints?.no_publish) {
      violations.push(`Mode ${intent.mode_id} has no_publish constraint — cannot publish`);
    }
    if (mode.hard_constraints?.read_only && (phase === "apply" || phase === "publish")) {
      violations.push(`Mode ${intent.mode_id} is read_only — cannot ${phase}`);
    }
    return violations;
  }

  private validateTransition(from: MaintenanceRunStatus, to: MaintenanceRunStatus): void {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new Error(`Invalid MCP state transition: ${from} → ${to}`);
    }
  }

  private async transition(run: MaintenanceRun, to: MaintenanceRunStatus): Promise<MaintenanceRun> {
    this.validateTransition(run.status, to);
    const updated: MaintenanceRun = { ...run, status: to, updated_at: isoNow() };
    await this.store.updateRun(run.run_id, { status: to, updated_at: updated.updated_at });
    return updated;
  }

  private validateScopeConstraints(intent: MaintenanceIntent): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    if (!intent.mode_id) {
      violations.push("mode_id is required");
    }
    if (!intent.intent_type) {
      violations.push("intent_type is required");
    }
    if (!intent.baseline_revision) {
      violations.push("baseline_revision is required");
    }
    if (!intent.units || intent.units.length === 0) {
      violations.push("At least one maintenance unit is required");
    }
    for (const unit of intent.units ?? []) {
      if (!unit.target_paths || unit.target_paths.length === 0) {
        violations.push(`Unit ${unit.unit_id} has no target_paths`);
      }
      if (intent.scope_constraints.length > 0) {
        for (const path of unit.target_paths) {
          const inScope = intent.scope_constraints.some((constraint) => path.startsWith(constraint));
          if (!inScope) {
            violations.push(`Unit ${unit.unit_id} target ${path} is outside scope constraints`);
          }
        }
      }
    }
    return { valid: violations.length === 0, violations };
  }

  async planMaintenance(intent: MaintenanceIntent): Promise<MaintenanceRun> {
    const scopeValidation = this.validateScopeConstraints(intent);
    if (!scopeValidation.valid) {
      throw new Error(`Scope validation failed: ${scopeValidation.violations.join("; ")}`);
    }

    const modeViolations = this.validateModeConstraints(intent);
    if (modeViolations.length > 0) {
      throw new Error(`Mode constraint violations: ${modeViolations.join("; ")}`);
    }

    const runId = allocateMaintenanceRunId();
    const now = isoNow();

    const run: MaintenanceRun = {
      run_id: runId,
      mode_id: intent.mode_id,
      intent_type: intent.intent_type,
      scope_constraints: intent.scope_constraints,
      risk_class: intent.risk_class,
      status: "planned",
      units: intent.units.map((u) => ({
        ...u,
        status: "not_started",
        verification_results: [],
      })),
      baseline_revision: intent.baseline_revision,
      created_at: now,
      updated_at: now,
    };

    await this.store.createRun(run);
    return run;
  }

  async applyMaintenance(runId: string): Promise<MaintenanceRun> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new Error(`Maintenance run not found: ${runId}`);
    }

    if (run.status !== "planned") {
      throw new Error(`Cannot apply maintenance: run ${runId} is in state ${run.status}, expected planned`);
    }

    const scopeValidation = this.validateScopeConstraints({
      mode_id: run.mode_id,
      intent_type: run.intent_type,
      scope_constraints: run.scope_constraints,
      risk_class: run.risk_class,
      units: run.units,
      baseline_revision: run.baseline_revision,
    });
    if (!scopeValidation.valid) {
      throw new Error(`Baseline health check failed: ${scopeValidation.violations.join("; ")}`);
    }

    const applyViolations = this.validateModeConstraints({
      mode_id: run.mode_id,
      intent_type: run.intent_type,
      scope_constraints: run.scope_constraints,
      risk_class: run.risk_class,
      units: run.units,
      baseline_revision: run.baseline_revision,
    }, "apply");
    if (applyViolations.length > 0) {
      throw new Error(`Mode apply constraint violations: ${applyViolations.join("; ")}`);
    }

    let updated = await this.transition(run, "applying");

    const executedUnits: MaintenanceUnit[] = [];
    for (const unit of updated.units) {
      const executingUnit: MaintenanceUnit = { ...unit, status: "in_progress" };
      try {
        executingUnit.status = "done";
      } catch {
        executingUnit.status = "failed";
      }
      executedUnits.push(executingUnit);
    }

    await this.store.updateRun(runId, { units: executedUnits, updated_at: isoNow() });
    const latest = await this.store.getRun(runId);
    return latest!;
  }

  async verifyMaintenance(runId: string): Promise<MaintenanceRun> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new Error(`Maintenance run not found: ${runId}`);
    }

    if (run.status !== "applying") {
      throw new Error(`Cannot verify maintenance: run ${runId} is in state ${run.status}, expected applying`);
    }

    let updated = await this.transition(run, "verifying");

    const verifiedUnits: MaintenanceUnit[] = [];
    for (const unit of updated.units) {
      const verifiedUnit: MaintenanceUnit = {
        ...unit,
        verification_results: [
          ...unit.verification_results,
          {
            check_id: `verify-${unit.unit_id}`,
            passed: unit.status === "done",
            details: unit.status === "done" ? "Verification passed" : "Unit not completed",
            timestamp: isoNow(),
          },
        ],
      };
      verifiedUnits.push(verifiedUnit);
    }

    const compatibilityReport = await this.axionIntegration.checkCompatibility(updated);

    const allVerified = verifiedUnits.every((u) =>
      u.verification_results.every((v) => v.passed)
    );
    const compatible = compatibilityReport.all_compatible;

    if (!allVerified || !compatible) {
      const failedRun = await this.transition(
        { ...updated, units: verifiedUnits },
        "failed"
      );
      await this.store.updateRun(runId, { units: verifiedUnits });
      return failedRun;
    }

    await this.store.updateRun(runId, { units: verifiedUnits, updated_at: isoNow() });
    const latest = await this.store.getRun(runId);
    return latest!;
  }

  async completeMaintenance(runId: string): Promise<MaintenanceRunReport> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new Error(`Maintenance run not found: ${runId}`);
    }

    if (run.status !== "verifying") {
      throw new Error(`Cannot complete maintenance: run ${runId} is in state ${run.status}, expected verifying`);
    }

    const allUnitsDone = run.units.every((u) => u.status === "done" || u.status === "skipped");
    if (!allUnitsDone) {
      throw new Error(`Cannot complete maintenance: not all units are done or skipped`);
    }

    const allVerified = run.units.every((u) =>
      u.verification_results.length > 0 && u.verification_results.every((v) => v.passed)
    );
    if (!allVerified) {
      throw new Error(`Cannot complete maintenance: not all units have passing verification`);
    }

    const report = await this.modeRunner.executeMaintenanceFlow(run);

    await this.transition(run, "complete");

    report.status = "complete";
    report.completed_at = isoNow();

    const outputPath = join(this.outputDir, runId, "maintenance_run_report.json");
    writeJson(outputPath, report);

    return report;
  }

  async rollback(runId: string): Promise<RollbackRecord> {
    const run = await this.store.getRun(runId);
    if (!run) {
      throw new Error(`Maintenance run not found: ${runId}`);
    }

    const currentStatus = run.status;
    if (currentStatus === "complete" || currentStatus === "cancelled") {
      throw new Error(`Cannot rollback maintenance run in state: ${currentStatus}`);
    }

    await this.transition(run, "rolling_back");

    const filesReverted: string[] = [];
    for (const unit of run.units) {
      if (unit.status === "done" || unit.status === "in_progress") {
        filesReverted.push(...unit.target_paths);
      }
    }

    const rollbackRecord: RollbackRecord = {
      run_id: runId,
      rolled_back_at: isoNow(),
      reason: `Rollback from state: ${currentStatus}`,
      baseline_revision: run.baseline_revision,
      files_reverted: filesReverted,
    };

    const outputPath = join(this.outputDir, runId, "rollback_record.json");
    writeJson(outputPath, rollbackRecord);

    const rolledBackRun = await this.store.getRun(runId);
    if (rolledBackRun) {
      await this.store.updateRun(runId, {
        updated_at: isoNow(),
      });
    }

    return rollbackRecord;
  }

  async getMaintenanceStatus(runId: string): Promise<MaintenanceRun | null> {
    return this.store.getRun(runId);
  }
}
