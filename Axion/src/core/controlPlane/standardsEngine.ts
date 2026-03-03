import type { RunContext, RiskClass } from "../../types/controlPlane.js";
import { sha256 } from "../../utils/hash.js";

export interface StandardsPack {
  pack_id: string;
  pack_version: string;
  category: string;
  applies_when: {
    routing?: Record<string, unknown>;
    gates?: Record<string, unknown>;
    risk_class?: RiskClass[];
    platforms?: string[];
  };
  priority: number;
  rule_count: number;
  file_path: string;
}

export interface StandardsIndex {
  $schema: string;
  standards_library_version: string;
  categories: Array<{ category_id: string; name: string; description: string }>;
  packs: StandardsPack[];
}

export interface ApplicabilityResult {
  pack_id: string;
  pack_version: string;
  category: string;
  applicable: boolean;
  reason: string;
  specificity_score: number;
}

export interface StandardsApplicabilityOutput {
  run_context_summary: {
    risk_class: RiskClass;
    platforms: string[];
    domains: string[];
  };
  results: ApplicabilityResult[];
  applicable_count: number;
  total_count: number;
  computed_at: string;
}

export interface PrecedenceRule {
  higher_priority_pack: string;
  lower_priority_pack: string;
}

export interface ResolvedStandardEntry {
  pack_id: string;
  pack_version: string;
  category: string;
  priority: number;
  rule_count: number;
  source_path: string;
}

export interface ConflictRecord {
  field: string;
  packs: string[];
  resolution: string;
}

export interface ResolvedStandardsSnapshot {
  snapshot_id: string;
  run_id: string;
  resolved_packs: ResolvedStandardEntry[];
  conflicts: ConflictRecord[];
  total_rules_resolved: number;
  snapshot_hash: string;
  resolved_at: string;
}

function computeSpecificityScore(pack: StandardsPack, context: RunContext): number {
  let score = 0;
  const appliesWhen = pack.applies_when;

  if (appliesWhen.risk_class && appliesWhen.risk_class.length > 0) {
    if (appliesWhen.risk_class.includes(context.risk_class)) {
      score += 10;
    }
  }

  if (appliesWhen.platforms && appliesWhen.platforms.length > 0) {
    const matchCount = appliesWhen.platforms.filter(
      (p: string) => context.targets.platforms.includes(p as never)
    ).length;
    score += matchCount * 5;
  }

  if (appliesWhen.routing && Object.keys(appliesWhen.routing).length > 0) {
    score += Object.keys(appliesWhen.routing).length * 2;
  }

  if (appliesWhen.gates && Object.keys(appliesWhen.gates).length > 0) {
    score += Object.keys(appliesWhen.gates).length * 2;
  }

  return score;
}

function isPackApplicable(pack: StandardsPack, context: RunContext): { applicable: boolean; reason: string } {
  const appliesWhen = pack.applies_when;

  if (
    (!appliesWhen.routing || Object.keys(appliesWhen.routing).length === 0) &&
    (!appliesWhen.gates || Object.keys(appliesWhen.gates).length === 0) &&
    (!appliesWhen.risk_class || appliesWhen.risk_class.length === 0) &&
    (!appliesWhen.platforms || appliesWhen.platforms.length === 0)
  ) {
    return { applicable: true, reason: "Universal pack (no filters)" };
  }

  if (appliesWhen.risk_class && appliesWhen.risk_class.length > 0) {
    if (!appliesWhen.risk_class.includes(context.risk_class)) {
      return { applicable: false, reason: `Risk class ${context.risk_class} not in ${appliesWhen.risk_class.join(",")}` };
    }
  }

  if (appliesWhen.platforms && appliesWhen.platforms.length > 0) {
    const hasMatch = appliesWhen.platforms.some(
      (p: string) => context.targets.platforms.includes(p as never)
    );
    if (!hasMatch) {
      return { applicable: false, reason: `No platform match for ${context.targets.platforms.join(",")}` };
    }
  }

  return { applicable: true, reason: "Filters matched" };
}

export function computeApplicability(
  runContext: RunContext,
  standardsIndex: StandardsIndex
): StandardsApplicabilityOutput {
  const results: ApplicabilityResult[] = [];

  const sortedPacks = [...standardsIndex.packs].sort((a, b) =>
    a.pack_id.localeCompare(b.pack_id)
  );

  for (const pack of sortedPacks) {
    const { applicable, reason } = isPackApplicable(pack, runContext);
    const specificityScore = applicable ? computeSpecificityScore(pack, runContext) : 0;

    results.push({
      pack_id: pack.pack_id,
      pack_version: pack.pack_version,
      category: pack.category,
      applicable,
      reason,
      specificity_score: specificityScore,
    });
  }

  return {
    run_context_summary: {
      risk_class: runContext.risk_class,
      platforms: [...runContext.targets.platforms].sort(),
      domains: [...runContext.targets.domains].sort(),
    },
    results,
    applicable_count: results.filter((r) => r.applicable).length,
    total_count: results.length,
    computed_at: new Date().toISOString(),
  };
}

export function resolveStandards(
  applicability: StandardsApplicabilityOutput,
  packs: StandardsPack[],
  precedenceRules: PrecedenceRule[],
  runId: string
): ResolvedStandardsSnapshot {
  const applicablePackIds = new Set(
    applicability.results.filter((r) => r.applicable).map((r) => r.pack_id)
  );

  const applicablePacks = packs
    .filter((p) => applicablePackIds.has(p.pack_id))
    .sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return a.pack_id.localeCompare(b.pack_id);
    });

  const precedenceMap = new Map<string, Set<string>>();
  for (const rule of precedenceRules) {
    if (!precedenceMap.has(rule.higher_priority_pack)) {
      precedenceMap.set(rule.higher_priority_pack, new Set());
    }
    precedenceMap.get(rule.higher_priority_pack)!.add(rule.lower_priority_pack);
  }

  const conflicts: ConflictRecord[] = [];
  const categoryPacks = new Map<string, StandardsPack[]>();
  for (const pack of applicablePacks) {
    if (!categoryPacks.has(pack.category)) {
      categoryPacks.set(pack.category, []);
    }
    categoryPacks.get(pack.category)!.push(pack);
  }

  for (const [category, packsInCategory] of categoryPacks) {
    if (packsInCategory.length > 1) {
      const packIds = packsInCategory.map((p) => p.pack_id);
      let resolution = "priority_order";

      for (const rule of precedenceRules) {
        if (packIds.includes(rule.higher_priority_pack) && packIds.includes(rule.lower_priority_pack)) {
          resolution = `explicit_precedence: ${rule.higher_priority_pack} > ${rule.lower_priority_pack}`;
          break;
        }
      }

      conflicts.push({
        field: category,
        packs: packIds,
        resolution,
      });
    }
  }

  const resolvedPacks: ResolvedStandardEntry[] = applicablePacks.map((pack) => ({
    pack_id: pack.pack_id,
    pack_version: pack.pack_version,
    category: pack.category,
    priority: pack.priority,
    rule_count: pack.rule_count,
    source_path: pack.file_path,
  }));

  const totalRules = resolvedPacks.reduce((sum, p) => sum + p.rule_count, 0);
  const snapshotContent = JSON.stringify(resolvedPacks);
  const snapshotHash = sha256(snapshotContent);
  const snapshotId = `stdsnapshot_${runId}_${snapshotHash.slice(0, 8)}`;

  return {
    snapshot_id: snapshotId,
    run_id: runId,
    resolved_packs: resolvedPacks,
    conflicts,
    total_rules_resolved: totalRules,
    snapshot_hash: snapshotHash,
    resolved_at: new Date().toISOString(),
  };
}
