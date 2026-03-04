import { NotImplementedError } from "../../utils/errors.js";
import type { KitManifest } from "./schemas.js";

export interface KitBuildResult {
  manifest: KitManifest;
  outputDir: string;
}

export function buildKit(_runId: string, _runDir: string): KitBuildResult {
  throw new NotImplementedError("buildKit");
}
