import type { MaintenanceRun, MaintenanceRunReport, MaintenanceRunStatus, MaintenanceMode } from "./model.js";
import type { JSONMaintenanceRunStore } from "./store.js";
import { DependencyManager } from "./dependencyManager.js";
import { MigrationManager } from "./migrationManager.js";
import { TestMaintainer } from "./testMaintainer.js";
import { RefactorManager } from "./refactorManager.js";
import { CIMaintainer } from "./ciMaintainer.js";
import { AxionIntegrationMaintainer } from "./axionIntegration.js";
import { isoNow } from "../../utils/time.js";
import { writeJson } from "../../utils/fs.js";
import { join } from "node:path";
import { getMaintenanceModes, getGates } from "../maintenance/loader.js";

export interface ModeRunnerOptions {
  outputDir: string;
  store: JSONMaintenanceRunStore;
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

export class ModeRunner {
  private depManager: DependencyManager;
  private migrationManager: MigrationManager;
  private testMaintainer: TestMaintainer;
  private refactorManager: RefactorManager;
  private ciMaintainer: CIMaintainer;
  private axionIntegration: AxionIntegrationMaintainer;

  constructor(private options: ModeRunnerOptions) {
    this.depManager = new DependencyManager({ outputDir: options.outputDir });
    this.migrationManager = new MigrationManager({ outputDir: options.outputDir });
    this.testMaintainer = new TestMaintainer({ outputDir: options.outputDir });
    this.refactorManager = new RefactorManager({ outputDir: options.outputDir });
    this.ciMaintainer = new CIMaintainer({ outputDir: options.outputDir });
    this.axionIntegration = new AxionIntegrationMaintainer({ outputDir: options.outputDir });
  }

  private validateTransition(from: MaintenanceRunStatus, to: MaintenanceRunStatus): void {
    const allowed = VALID_TRANSITIONS[from];
    if (!allowed || !allowed.includes(to)) {
      throw new Error(`Invalid MCP state transition: ${from} → ${to}`);
    }
  }

  async transitionRun(run: MaintenanceRun, to: MaintenanceRunStatus): Promise<void> {
    this.validateTransition(run.status, to);
    await this.options.store.updateRun(run.run_id, {
      status: to,
      updated_at: isoNow(),
    });
  }

  private resolveMode(modeId: string): MaintenanceMode | undefined {
    const modes = getMaintenanceModes();
    return modes.find((m) => m.mode_id === modeId);
  }

  private enforceModeBudgets(run: MaintenanceRun): { allowed: boolean; reason?: string } {
    const mode = this.resolveMode(run.mode_id);
    if (!mode) return { allowed: true };

    if (mode.hard_constraints?.read_only) {
      return { allowed: false, reason: `Mode ${mode.mode_id} (${mode.name}) is read-only` };
    }
    if (mode.default_budgets?.max_assets_touched > 0 && run.units.length > mode.default_budgets.max_assets_touched) {
      return { allowed: false, reason: `Unit count (${run.units.length}) exceeds mode budget max_assets_touched (${mode.default_budgets.max_assets_touched})` };
    }
    return { allowed: true };
  }

  async executeMaintenanceFlow(run: MaintenanceRun): Promise<MaintenanceRunReport> {
    const budgetCheck = this.enforceModeBudgets(run);
    if (!budgetCheck.allowed) {
      throw new Error(`Mode budget violation: ${budgetCheck.reason}`);
    }

    const mode = this.resolveMode(run.mode_id);
    const requiredGates = mode?.required_gates ?? [];
    if (requiredGates.length > 0) {
      const allGates = getGates();
      for (const gateId of requiredGates) {
        const gate = allGates.find((g) => g.gate_rule_id === gateId);
        if (gate && gate.status !== "active") {
          throw new Error(`Required gate ${gateId} is not active (status: ${gate.status})`);
        }
      }
    }

    const report: MaintenanceRunReport = {
      run_id: run.run_id,
      mode_id: run.mode_id,
      status: run.status,
      units: run.units,
      created_at: run.created_at,
      completed_at: isoNow(),
    };

    const unitTypes = new Set(run.units.map((u) => u.type));

    if (unitTypes.has("dep_upgrade")) {
      report.dependency_report = await this.depManager.produceReport(run);
    }
    if (unitTypes.has("migration")) {
      report.migration_report = await this.migrationManager.produceReport(run);
    }
    if (unitTypes.has("test_hardening")) {
      report.test_report = await this.testMaintainer.produceReport(run);
    }
    if (unitTypes.has("refactor")) {
      report.refactor_report = await this.refactorManager.produceReport(run);
    }
    if (unitTypes.has("ci_fix")) {
      report.ci_report = await this.ciMaintainer.produceReport(run);
    }

    report.compatibility_report = await this.axionIntegration.produceReport(run);

    report.status = report.compatibility_report.all_compatible ? "complete" : "failed";

    const outputPath = join(this.options.outputDir, run.run_id, "maintenance_run_report.json");
    writeJson(outputPath, report);

    return report;
  }

  async produceReport(run: MaintenanceRun): Promise<MaintenanceRunReport> {
    return this.executeMaintenanceFlow(run);
  }
}
