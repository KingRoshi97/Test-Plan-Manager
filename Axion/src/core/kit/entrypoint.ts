import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { Entrypoint } from "./schemas.js";

export function createPlaceholderEntrypoint(runId: string): Entrypoint {
  return {
    kit_id: `kit_${runId}`,
    run_id: runId,
    entry_type: "placeholder",
    created_at: isoNow(),
    instructions: [],
  };
}

export function writeEntrypoint(outputPath: string, entrypoint: Entrypoint): void {
  writeJson(outputPath, entrypoint);
}
