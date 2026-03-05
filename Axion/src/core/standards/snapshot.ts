import { join } from "node:path";
import { existsSync } from "node:fs";
import { readJson } from "../../utils/fs.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import type { ResolvedStandardsSnapshot } from "./resolver.js";

export type { ResolvedStandardsSnapshot } from "./resolver.js";

export function writeSnapshot(runDir: string, snapshot: ResolvedStandardsSnapshot): void {
  const outPath = join(runDir, "standards", "resolved_standards_snapshot.json");
  writeCanonicalJson(outPath, snapshot);
}

export function loadSnapshot(runDir: string): ResolvedStandardsSnapshot {
  const snapshotPath = join(runDir, "standards", "resolved_standards_snapshot.json");
  if (!existsSync(snapshotPath)) {
    throw new Error(`Standards snapshot not found: ${snapshotPath}`);
  }
  return readJson<ResolvedStandardsSnapshot>(snapshotPath);
}
