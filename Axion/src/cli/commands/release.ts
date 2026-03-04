import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { isoNow } from "../../utils/time.js";

export interface ReleaseRecord {
  release_id: string;
  run_id: string;
  version: string;
  released_at: string;
  manifest_hash: string;
  kit_hash: string;
  status: "released" | "draft";
}

export function cmdRelease(runDir: string, version: string): void {
  if (!existsSync(runDir)) {
    console.error(`Run directory not found: ${runDir}`);
    process.exit(1);
  }

  const manifestPath = join(runDir, "run_manifest.json");
  if (!existsSync(manifestPath)) {
    console.error("No run_manifest.json found");
    process.exit(1);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const runId = manifest.run_id ?? "unknown";

  const kitManifestPath = join(runDir, "kit", "packaging_manifest.json");
  if (!existsSync(kitManifestPath)) {
    console.error("No packaging_manifest.json found — run must complete S10 before release");
    process.exit(1);
  }

  const kitManifest = readFileSync(kitManifestPath, "utf-8");
  const kitHash = createHash("sha256").update(kitManifest).digest("hex");
  const manifestHash = createHash("sha256").update(readFileSync(manifestPath, "utf-8")).digest("hex");

  const releaseId = `REL-${version.replace(/\./g, "-")}-${Date.now()}`;

  const record: ReleaseRecord = {
    release_id: releaseId,
    run_id: runId,
    version,
    released_at: isoNow(),
    manifest_hash: manifestHash,
    kit_hash: kitHash,
    status: "released",
  };

  const releasesDir = join(runDir, "releases");
  mkdirSync(releasesDir, { recursive: true });
  writeFileSync(join(releasesDir, `${releaseId}.json`), JSON.stringify(record, null, 2));

  console.log(`Released: ${releaseId}`);
  console.log(`  Run: ${runId}`);
  console.log(`  Version: ${version}`);
  console.log(`  Kit hash: ${kitHash.slice(0, 12)}...`);
}
