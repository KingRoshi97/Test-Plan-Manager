import type { MaintenanceRun } from "./model.js";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";

export interface MaintenanceRunStore {
  createRun(run: MaintenanceRun): Promise<void>;
  getRun(runId: string): Promise<MaintenanceRun | null>;
  updateRun(runId: string, updates: Partial<MaintenanceRun>): Promise<void>;
  listRuns(): Promise<MaintenanceRun[]>;
}

export class JSONMaintenanceRunStore implements MaintenanceRunStore {
  constructor(private basePath: string) {}

  private runDir(runId: string): string {
    return join(this.basePath, runId);
  }

  private manifestPath(runId: string): string {
    return join(this.runDir(runId), "maintenance_manifest.json");
  }

  async createRun(run: MaintenanceRun): Promise<void> {
    const dir = this.runDir(run.run_id);
    ensureDir(dir);
    writeJson(this.manifestPath(run.run_id), run);
  }

  async getRun(runId: string): Promise<MaintenanceRun | null> {
    const path = this.manifestPath(runId);
    if (!existsSync(path)) {
      return null;
    }
    return readJson<MaintenanceRun>(path);
  }

  async updateRun(runId: string, updates: Partial<MaintenanceRun>): Promise<void> {
    const existing = await this.getRun(runId);
    if (!existing) {
      throw new Error(`Maintenance run not found: ${runId}`);
    }
    const updated: MaintenanceRun = { ...existing, ...updates, run_id: runId };
    writeJson(this.manifestPath(runId), updated);
  }

  async listRuns(): Promise<MaintenanceRun[]> {
    if (!existsSync(this.basePath)) {
      return [];
    }
    const entries = readdirSync(this.basePath, { withFileTypes: true });
    const runs: MaintenanceRun[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const run = await this.getRun(entry.name);
        if (run) {
          runs.push(run);
        }
      }
    }
    return runs;
  }
}
