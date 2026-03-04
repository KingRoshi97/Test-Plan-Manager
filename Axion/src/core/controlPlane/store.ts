import type { Run } from "./model.js";
import { NotImplementedError } from "../../utils/errors.js";

export interface RunStore {
  createRun(run: Run): Promise<void>;
  getRun(runId: string): Promise<Run | null>;
  updateRun(runId: string, updates: Partial<Run>): Promise<void>;
  listRuns(): Promise<Run[]>;
}

export class JSONRunStore implements RunStore {
  constructor(private basePath: string) {}

  async createRun(_run: Run): Promise<void> {
    throw new NotImplementedError("JSONRunStore.createRun");
  }

  async getRun(_runId: string): Promise<Run | null> {
    throw new NotImplementedError("JSONRunStore.getRun");
  }

  async updateRun(_runId: string, _updates: Partial<Run>): Promise<void> {
    throw new NotImplementedError("JSONRunStore.updateRun");
  }

  async listRuns(): Promise<Run[]> {
    throw new NotImplementedError("JSONRunStore.listRuns");
  }
}
