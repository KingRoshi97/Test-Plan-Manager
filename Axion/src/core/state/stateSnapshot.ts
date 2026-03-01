import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";

export interface StateSnapshot {
  run_id: string;
  status: string;
  snapshot_at: string;
  completed_stages: string[];
  pending_stages: string[];
  artifacts_written: string[];
  errors: string[];
}

export function createPlaceholderStateSnapshot(runId: string): StateSnapshot {
  return {
    run_id: runId,
    status: "created",
    snapshot_at: isoNow(),
    completed_stages: [],
    pending_stages: [],
    artifacts_written: [],
    errors: [],
  };
}

export function writeStateSnapshot(outputPath: string, snapshot: StateSnapshot): void {
  writeJson(outputPath, snapshot);
}
