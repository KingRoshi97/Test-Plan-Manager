import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { KitRun } from "./model.js";
import { writeJson, readJson, ensureDir } from "../../utils/fs.js";

export interface KitRunStore {
  create(run: KitRun): void;
  get(kitRunId: string): KitRun | null;
  update(run: KitRun): void;
  list(): KitRun[];
}

export class JSONKitRunStore implements KitRunStore {
  private readonly baseDir: string;

  constructor(kitOutputDir: string) {
    this.baseDir = join(kitOutputDir, ".kcp", "runs");
    ensureDir(this.baseDir);
  }

  private runPath(kitRunId: string): string {
    return join(this.baseDir, kitRunId, "kit_run.json");
  }

  create(run: KitRun): void {
    const p = this.runPath(run.kit_run_id);
    if (existsSync(p)) {
      throw new Error(`Kit run already exists: ${run.kit_run_id}`);
    }
    writeJson(p, run);
  }

  get(kitRunId: string): KitRun | null {
    const p = this.runPath(kitRunId);
    if (!existsSync(p)) {
      return null;
    }
    return readJson<KitRun>(p);
  }

  update(run: KitRun): void {
    const p = this.runPath(run.kit_run_id);
    if (!existsSync(p)) {
      throw new Error(`Kit run not found: ${run.kit_run_id}`);
    }
    writeJson(p, run);
  }

  list(): KitRun[] {
    if (!existsSync(this.baseDir)) {
      return [];
    }
    const entries = readdirSync(this.baseDir, { withFileTypes: true });
    const runs: KitRun[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const run = this.get(entry.name);
        if (run) {
          runs.push(run);
        }
      }
    }
    return runs;
  }
}
