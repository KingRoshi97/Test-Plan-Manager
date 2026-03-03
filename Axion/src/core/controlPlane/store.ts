import type { Run } from "./model.js";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ensureDir, writeJson, readJson } from "../../utils/fs.js";

export interface RunStore {
  createRun(run: Run): Promise<void>;
  getRun(runId: string): Promise<Run | null>;
  updateRun(runId: string, updates: Partial<Run>): Promise<void>;
  listRuns(): Promise<Run[]>;
}

export class JSONRunStore implements RunStore {
  constructor(private basePath: string) {
    ensureDir(this.basePath);
  }

  private runPath(runId: string): string {
    return join(this.basePath, `${runId}.json`);
  }

  async createRun(run: Run): Promise<void> {
    const p = this.runPath(run.run_id);
    if (existsSync(p)) {
      throw new Error(`Run ${run.run_id} already exists`);
    }
    writeJson(p, run);
  }

  async getRun(runId: string): Promise<Run | null> {
    const p = this.runPath(runId);
    if (!existsSync(p)) return null;
    return readJson<Run>(p);
  }

  async updateRun(runId: string, updates: Partial<Run>): Promise<void> {
    const existing = await this.getRun(runId);
    if (!existing) {
      throw new Error(`Run ${runId} not found`);
    }
    const merged: Run = { ...existing, ...updates, updated_at: new Date().toISOString() };
    writeJson(this.runPath(runId), merged);
  }

  async listRuns(): Promise<Run[]> {
    if (!existsSync(this.basePath)) return [];
    const files = readdirSync(this.basePath).filter((f) => f.endsWith(".json"));
    return files.map((f) => readJson<Run>(join(this.basePath, f)));
  }
}
