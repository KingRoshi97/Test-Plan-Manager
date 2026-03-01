import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { AcceptanceMap } from "./outputs.js";

export function createPlaceholderAcceptanceMap(runId: string): AcceptanceMap {
  return {
    run_id: runId,
    created_at: isoNow(),
    entries: [],
  };
}

export function writeAcceptanceMap(outputPath: string, am: AcceptanceMap): void {
  writeJson(outputPath, am);
}
