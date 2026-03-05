import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { ICPRun } from "./model.js";
import { icpRunToManifest, manifestToICPRun } from "./model.js";
import type { RunManifest } from "../../types/run.js";
import { ensureDir, writeJson, readJson } from "../../utils/fs.js";

export interface RunStore {
  createRun(run: ICPRun): Promise<void>;
  getRun(runId: string): Promise<ICPRun | null>;
  updateRun(runId: string, updates: Partial<ICPRun>): Promise<void>;
  listRuns(): Promise<ICPRun[]>;
}

export class JSONRunStore implements RunStore {
  constructor(private basePath: string) {}

  private runDir(runId: string): string {
    return join(this.basePath, "runs", runId);
  }

  private manifestPath(runId: string): string {
    return join(this.runDir(runId), "run_manifest.json");
  }

  async createRun(run: ICPRun): Promise<void> {
    const dir = this.runDir(run.run_id);
    ensureDir(dir);
    const manifest = icpRunToManifest(run);
    writeJson(this.manifestPath(run.run_id), manifest);
  }

  async getRun(runId: string): Promise<ICPRun | null> {
    const path = this.manifestPath(runId);
    if (!existsSync(path)) {
      return null;
    }
    const manifest = readJson<RunManifest>(path);
    return manifestToICPRun(manifest);
  }

  async updateRun(runId: string, updates: Partial<ICPRun>): Promise<void> {
    const existing = await this.getRun(runId);
    if (!existing) {
      throw new Error(`Run ${runId} not found`);
    }
    const merged: ICPRun = { ...existing, ...updates, updated_at: new Date().toISOString() };
    const manifest = icpRunToManifest(merged);
    writeJson(this.manifestPath(runId), manifest);
  }

  async listRuns(): Promise<ICPRun[]> {
    const runsDir = join(this.basePath, "runs");
    if (!existsSync(runsDir)) {
      return [];
    }
    const entries = readdirSync(runsDir, { withFileTypes: true });
    const runs: ICPRun[] = [];
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
