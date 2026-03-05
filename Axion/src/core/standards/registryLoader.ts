import { join } from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { readJson } from "../../utils/fs.js";

export interface PackIndexEntry {
  pack_id: string;
  pack_version: string;
  category: string;
  applies_when: Record<string, unknown>;
  priority: number;
  rule_count: number;
  file_path: string;
}

export interface StandardsIndex {
  standards_library_version: string;
  description: string;
  categories: Array<{ category_id: string; name: string; description: string }>;
  packs: PackIndexEntry[];
}

export interface PackRule {
  rule_id: string;
  name: string;
  description: string;
  rule_type: "requirement" | "constraint" | "default" | "prohibition";
  value: unknown;
  fixed: boolean;
  source_pack: string;
}

export interface StandardsPack {
  pack_id: string;
  pack_version: string;
  category: string;
  description: string;
  applies_when: Record<string, unknown>;
  priority: number;
  fixed_rules: PackRule[];
  configurable_rules: PackRule[];
}

export interface ResolverRules {
  version: string;
  description: string;
  selection: {
    include_by_default: string[];
    exclude_pack_ids: string[];
    include_pack_ids: string[];
    applicability_fields: string[];
  };
  order: {
    strategy: string;
    priority_field: string;
    priority_direction: string;
    tiebreakers: string[];
  };
  conflicts: {
    default_strategy: string;
    by_rule_namespace: Array<{ namespace: string; strategy: string }>;
    stricter_wins: {
      severity_order: string[];
      truthy_order: boolean[];
    };
  };
  overrides: {
    allow_user_overrides: boolean;
    override_sources_order: string[];
    override_policy: Record<string, boolean>;
  };
  output: {
    snapshot_id_prefix: string;
    include_provenance: boolean;
    provenance_fields: string[];
  };
}

export interface LoadedStandardsRegistry {
  index: StandardsIndex;
  packs: StandardsPack[];
  resolverRules: ResolverRules;
}

export function loadStandardsRegistry(repoRoot: string): LoadedStandardsRegistry {
  const libDir = join(repoRoot, "libraries", "standards");

  const indexPath = join(libDir, "standards_index.json");
  if (!existsSync(indexPath)) {
    throw new Error(`Standards index not found: ${indexPath}`);
  }
  const index = readJson<StandardsIndex>(indexPath);

  const rulesPath = join(libDir, "resolver_rules.v1.json");
  if (!existsSync(rulesPath)) {
    throw new Error(`Resolver rules not found: ${rulesPath}`);
  }
  const resolverRules = readJson<ResolverRules>(rulesPath);

  const packs: StandardsPack[] = [];
  for (const packEntry of index.packs) {
    const packPath = join(libDir, packEntry.file_path);
    if (!existsSync(packPath)) {
      throw new Error(`Standards pack not found: ${packPath} (pack_id: ${packEntry.pack_id})`);
    }
    const pack = readJson<StandardsPack>(packPath);
    packs.push(pack);
  }

  return { index, packs, resolverRules };
}
