import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { VersionStamp } from "./schemas.js";

export function createPlaceholderVersionStamp(runId: string): VersionStamp {
  return {
    kit_id: `kit_${runId}`,
    run_id: runId,
    version: "0.0.0",
    created_at: isoNow(),
    content_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    source_run_hash: "0000000000000000000000000000000000000000000000000000000000000000",
  };
}

export function writeVersionStamp(outputPath: string, stamp: VersionStamp): void {
  writeJson(outputPath, stamp);
}
