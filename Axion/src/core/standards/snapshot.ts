import { NotImplementedError } from "../../utils/errors.js";
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

export function writeSnapshot(_runDir: string, _snapshot: StandardsSnapshot): void {
  throw new NotImplementedError("writeSnapshot");
}

export function loadSnapshot(_runDir: string): StandardsSnapshot {
  throw new NotImplementedError("loadSnapshot");
}
