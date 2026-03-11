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

const REQUIRED_MANIFEST_FIELDS: (keyof RunManifest)[] = [
  "run_id",
  "status",
  "created_at",
  "updated_at",
  "pipeline",
  "profile",
  "stage_order",
  "stages",
];

function validateManifest(manifest: RunManifest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (manifest[field] === undefined || manifest[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  if (manifest.run_id && typeof manifest.run_id !== "string") {
    errors.push("run_id must be a string");
  }
  if (manifest.stages && !Array.isArray(manifest.stages)) {
    errors.push("stages must be an array");
  }
  if (manifest.stage_order && !Array.isArray(manifest.stage_order)) {
    errors.push("stage_order must be an array");
  }
  return { valid: errors.length === 0, errors };
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
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Manifest validation failed on create: ${validation.errors.join("; ")}`);
    }
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

    if (updates.version !== undefined && updates.version !== existing.version) {
      throw new Error(
        `Optimistic lock conflict for run ${runId}: expected version ${updates.version}, found ${existing.version}. Another update may have occurred concurrently.`,
      );
    }

    const merged: ICPRun = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
      version: existing.version + 1,
    };

    const manifest = icpRunToManifest(merged);
    const validation = validateManifest(manifest);
    if (!validation.valid) {
      throw new Error(`Manifest validation failed on update: ${validation.errors.join("; ")}`);
    }
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
