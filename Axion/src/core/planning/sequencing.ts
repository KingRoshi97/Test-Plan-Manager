import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { SequencingReport } from "./outputs.js";

export function createPlaceholderSequencingReport(runId: string): SequencingReport {
  return {
    run_id: runId,
    created_at: isoNow(),
    steps: [],
  };
}

export function writeSequencingReport(outputPath: string, sr: SequencingReport): void {
  writeJson(outputPath, sr);
}
