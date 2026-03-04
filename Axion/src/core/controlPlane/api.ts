import type { Run } from "./model.js";
import type { RunStore } from "./store.js";
import { NotImplementedError } from "../../utils/errors.js";

export class RunController {
  constructor(
    private store: RunStore,
  ) {}

  async createRun(_config: Record<string, unknown>): Promise<Run> {
    throw new NotImplementedError("RunController.createRun");
  }

  async advanceStage(_runId: string, _stageId: string): Promise<void> {
    throw new NotImplementedError("RunController.advanceStage");
  }

  async completeRun(_runId: string): Promise<void> {
    throw new NotImplementedError("RunController.completeRun");
  }

  async getRunStatus(_runId: string): Promise<Run | null> {
    throw new NotImplementedError("RunController.getRunStatus");
  }
}
