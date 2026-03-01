import { join } from "node:path";
import { createPlaceholderKitManifest, writeKitManifest } from "../../core/kit/manifest.js";
import { createPlaceholderEntrypoint, writeEntrypoint } from "../../core/kit/entrypoint.js";
import { createPlaceholderVersionStamp, writeVersionStamp } from "../../core/kit/versions.js";

export function cmdPackageKit(runId: string, runDir: string): void {
  const kitDir = join(runDir, "kit");

  const manifest = createPlaceholderKitManifest(runId);
  writeKitManifest(join(kitDir, "kit_manifest.json"), manifest);
  console.log(`  Wrote kit_manifest.json`);

  const entrypoint = createPlaceholderEntrypoint(runId);
  writeEntrypoint(join(kitDir, "entrypoint.json"), entrypoint);
  console.log(`  Wrote entrypoint.json`);

  const stamp = createPlaceholderVersionStamp(runId);
  writeVersionStamp(join(kitDir, "version_stamp.json"), stamp);
  console.log(`  Wrote version_stamp.json`);
}
