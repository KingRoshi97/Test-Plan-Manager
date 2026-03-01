import { writeJson } from "../../utils/fs.js";
import { isoNow } from "../../utils/time.js";
import type { KitManifest } from "./schemas.js";

export function createPlaceholderKitManifest(runId: string): KitManifest {
  return {
    kit_id: `kit_${runId}`,
    run_id: runId,
    version: "0.0.0",
    created_at: isoNow(),
    artifacts: [],
    metadata: {},
  };
}

export function writeKitManifest(outputPath: string, manifest: KitManifest): void {
  writeJson(outputPath, manifest);
}
