import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { WorkBreakdown } from "./outputs.js";

export function createPlaceholderWorkBreakdown(runId: string): WorkBreakdown {
  return {
    run_id: runId,
    created_at: isoNow(),
    tasks: [],
  };
}

export function writeWorkBreakdown(outputPath: string, wb: WorkBreakdown): void {
  writeJson(outputPath, wb);
}
