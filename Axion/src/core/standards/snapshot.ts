import { join } from "node:path";
import { writeCanonicalJson, canonicalHash } from "../../utils/canonicalJson.js";
import { readJson } from "../../utils/fs.js";
import type { ResolverContext, SelectedPack, ResolvedRule, OverrideRecord, ConflictEntry } from "./resolver.js";

export interface StandardsSnapshot {
  resolved_standards_id: string;
  submission_id: string;
  spec_id?: string;
  created_at: string;
  versions: {
    system_version: string;
    schema_version_used: string;
    standards_library_version_used: string;
    template_library_version_used?: string;
    resolver_ruleset_version_used: string;
  };
  resolver_context: ResolverContext;
  selected_packs: SelectedPack[];
  rules: ResolvedRule[];
  fixed_vs_configurable: Record<string, "fixed" | "configurable">;
  overrides_applied: OverrideRecord[];
  overrides_blocked: OverrideRecord[];
  conflicts: ConflictEntry[];
  snapshot_hash?: string;
}

export function writeSnapshot(runDir: string, snapshot: StandardsSnapshot): void {
  const outPath = join(runDir, "standards", "resolved_standards_snapshot.json");
  const hashableSnapshot = { ...snapshot };
  delete hashableSnapshot.snapshot_hash;
  hashableSnapshot.snapshot_hash = canonicalHash(hashableSnapshot);
  writeCanonicalJson(outPath, hashableSnapshot);
}

export function loadSnapshot(runDir: string): StandardsSnapshot {
  const snapshotPath = join(runDir, "standards", "resolved_standards_snapshot.json");
  return readJson<StandardsSnapshot>(snapshotPath);
}
