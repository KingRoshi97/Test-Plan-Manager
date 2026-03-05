import { isoNow } from "../../utils/time.js";
import { shortHash } from "../../utils/hash.js";
import { canonicalJsonString } from "../../utils/canonicalJson.js";
import type { RoutingSnapshot } from "../intake/normalizer.js";
import type { StandardsPack, PackRule, ResolverRules, LoadedStandardsRegistry } from "./registryLoader.js";
import type { ApplicabilityMatch } from "./applicability.js";

export interface ResolverContext {
  routing: RoutingSnapshot;
  gates: {
    data_enabled: boolean;
    auth_required: boolean;
    integrations_enabled: boolean;
  };
  compliance_flags: string[];
  delivery: {
    scope: string;
    priority_bias: string;
  };
}

export interface SelectedPack {
  pack_id: string;
  pack_version: string;
  category: string;
  applies_when: Record<string, unknown>;
  specificity_score: number;
  priority: number;
}

export interface ResolvedRule {
  rule_id: string;
  category: string;
  name: string;
  description: string;
  rule_type: "requirement" | "constraint" | "default" | "prohibition";
  value: unknown;
  fixed: boolean;
  sources: string[];
  resolved_by: "exact_match" | "precedence" | "override";
}

export interface ConflictEntry {
  rule_id: string;
  packs: string[];
  values: unknown[];
  resolution: string;
}

export interface ResolverOutput {
  resolver_context: ResolverContext;
  selected_packs: SelectedPack[];
  resolved_rules: ResolvedRule[];
  overrides_applied: OverrideRecord[];
  overrides_blocked: OverrideRecord[];
  conflict_log: ConflictEntry[];
}

export interface OverrideRecord {
  override_id: string;
  rule_id: string;
  before: unknown;
  after: unknown;
  source: "user" | "admin" | "system";
  reason?: string;
  status: "applied" | "blocked";
  timestamp: string;
}

export interface ResolvedStandard {
  standard_id: string;
  title: string;
  namespace: string;
  source_pack: string;
  version: string;
  content: unknown;
}

export interface ResolverTraceEntry {
  pack_id: string;
  version: string;
  rule_id: string;
  merged_at: string;
  namespace: string;
}

export interface FixedVsConfigurable {
  [rule_id: string]: "fixed" | "configurable";
}

export interface ResolvedStandardsSnapshot {
  resolved_standards_id: string;
  submission_id: string;
  created_at: string;
  system_version: string;
  schema_version_used: string;
  standards_library_version_used: string;
  resolver_version: string;
  resolver_context: ResolverContext;
  selected_packs: SelectedPack[];
  rules: ResolvedRule[];
  fixed_vs_configurable: FixedVsConfigurable;
  overrides_applied: OverrideRecord[];
  overrides_blocked: OverrideRecord[];
  conflicts: ConflictEntry[];
  run_id: string;
  resolved_standards: ResolvedStandard[];
  resolver_trace: ResolverTraceEntry[];
}

function deriveNamespace(ruleId: string): string {
  if (ruleId.startsWith("SEC-")) return "security";
  if (ruleId.startsWith("QA-")) return "quality";
  if (ruleId.startsWith("ENG-")) return "stack";
  if (ruleId.startsWith("OPS-")) return "operations";
  if (ruleId.startsWith("API-")) return "interface";
  return "general";
}

function orderPacks(
  packs: StandardsPack[],
  matchedPacks: ApplicabilityMatch[],
  resolverRules: ResolverRules
): StandardsPack[] {
  const matchMap = new Map(matchedPacks.map((m) => [m.pack_id, m]));
  const matchedPackObjs = packs.filter((p) => matchMap.has(p.pack_id));

  return matchedPackObjs.sort((a, b) => {
    if (resolverRules.order.priority_direction === "desc") {
      if (b.priority !== a.priority) return b.priority - a.priority;
    } else {
      if (a.priority !== b.priority) return a.priority - b.priority;
    }
    for (const tb of resolverRules.order.tiebreakers) {
      if (tb === "pack_id_asc") {
        const cmp = a.pack_id.localeCompare(b.pack_id);
        if (cmp !== 0) return cmp;
      } else if (tb === "version_asc") {
        const cmp = a.pack_version.localeCompare(b.pack_version);
        if (cmp !== 0) return cmp;
      }
    }
    return 0;
  });
}

function resolveConflict(
  existing: { rule: PackRule; pack: StandardsPack },
  incoming: { rule: PackRule; pack: StandardsPack },
  resolverRules: ResolverRules
): { winner: "existing" | "incoming"; resolution: string } {
  const namespace = deriveNamespace(incoming.rule.rule_id);
  const nsConfig = resolverRules.conflicts.by_rule_namespace.find((n) => n.namespace === namespace);
  const strategy = nsConfig?.strategy ?? resolverRules.conflicts.default_strategy;

  if (strategy === "stricter_wins") {
    if (incoming.rule.fixed && !existing.rule.fixed) {
      return { winner: "incoming", resolution: `stricter_wins: fixed rule from ${incoming.pack.pack_id} overrides configurable from ${existing.pack.pack_id}` };
    }
    if (existing.rule.fixed && !incoming.rule.fixed) {
      return { winner: "existing", resolution: `stricter_wins: fixed rule from ${existing.pack.pack_id} kept over configurable from ${incoming.pack.pack_id}` };
    }
    return { winner: "incoming", resolution: `stricter_wins: later pack ${incoming.pack.pack_id} wins tie` };
  }

  if (strategy === "fixed_over_configurable") {
    if (incoming.rule.fixed && !existing.rule.fixed) {
      return { winner: "incoming", resolution: `fixed_over_configurable: ${incoming.pack.pack_id}` };
    }
    if (existing.rule.fixed && !incoming.rule.fixed) {
      return { winner: "existing", resolution: `fixed_over_configurable: ${existing.pack.pack_id}` };
    }
  }

  return { winner: "incoming", resolution: `last_write_wins: ${incoming.pack.pack_id} overrides ${existing.pack.pack_id}` };
}

export function computeResolverContext(normalizedInput: unknown): ResolverContext {
  const input = normalizedInput as Record<string, unknown>;
  const routing = (input.routing ?? {}) as RoutingSnapshot;
  const constraints = (input.constraints ?? {}) as Record<string, unknown>;

  return {
    routing,
    gates: {
      data_enabled: true,
      auth_required: true,
      integrations_enabled: false,
    },
    compliance_flags: [],
    delivery: {
      scope: String((constraints.delivery as Record<string, unknown>)?.scope ?? "full"),
      priority_bias: String((constraints.delivery as Record<string, unknown>)?.priority_bias ?? "none"),
    },
  };
}

export function resolveStandards(
  normalizedInput: unknown,
  registry: LoadedStandardsRegistry,
  matchedPacks: ApplicabilityMatch[],
  runId: string
): { snapshot: ResolvedStandardsSnapshot; resolverOutput: ResolverOutput } {
  const context = computeResolverContext(normalizedInput);
  const matchMap = new Map(matchedPacks.map((m) => [m.pack_id, m]));

  const orderedPacks = orderPacks(registry.packs, matchedPacks, registry.resolverRules);

  const selectedPacks: SelectedPack[] = orderedPacks.map((p) => ({
    pack_id: p.pack_id,
    pack_version: p.pack_version,
    category: p.category,
    applies_when: p.applies_when,
    specificity_score: matchMap.get(p.pack_id)?.match_score ?? 0,
    priority: p.priority,
  }));

  const ruleMap = new Map<string, { rule: PackRule; pack: StandardsPack }>();
  const conflictLog: ConflictEntry[] = [];
  const resolverTrace: ResolverTraceEntry[] = [];
  const resolvedRules: ResolvedRule[] = [];

  for (const pack of orderedPacks) {
    const allRules = [...pack.fixed_rules, ...pack.configurable_rules];
    for (const rule of allRules) {
      const now = isoNow();
      if (ruleMap.has(rule.rule_id)) {
        const existing = ruleMap.get(rule.rule_id)!;
        const conflict = resolveConflict(existing, { rule, pack }, registry.resolverRules);

        conflictLog.push({
          rule_id: rule.rule_id,
          packs: [existing.pack.pack_id, pack.pack_id],
          values: [existing.rule.value, rule.value],
          resolution: conflict.resolution,
        });

        if (conflict.winner === "incoming") {
          ruleMap.set(rule.rule_id, { rule, pack });
        }
      } else {
        ruleMap.set(rule.rule_id, { rule, pack });
      }

      resolverTrace.push({
        pack_id: pack.pack_id,
        version: pack.pack_version,
        rule_id: rule.rule_id,
        merged_at: now,
        namespace: deriveNamespace(rule.rule_id),
      });
    }
  }

  for (const [, { rule, pack }] of ruleMap) {
    resolvedRules.push({
      rule_id: rule.rule_id,
      category: pack.category,
      name: rule.name,
      description: rule.description,
      rule_type: rule.rule_type,
      value: rule.value,
      fixed: rule.fixed,
      sources: [pack.pack_id],
      resolved_by: "exact_match",
    });
  }

  resolvedRules.sort((a, b) => a.rule_id.localeCompare(b.rule_id));

  const resolvedStandards: ResolvedStandard[] = resolvedRules.map((r) => ({
    standard_id: r.rule_id,
    title: r.name,
    namespace: deriveNamespace(r.rule_id),
    source_pack: r.sources[0],
    version: registry.index.standards_library_version,
    content: r.value,
  }));

  const snapshotId = `${registry.resolverRules.output.snapshot_id_prefix}${shortHash(canonicalJsonString({ runId, rules: resolvedRules }), 12)}`;
  const createdAt = isoNow();

  const fixedVsConfigurable: Record<string, "fixed" | "configurable"> = {};
  for (const [, { rule }] of ruleMap) {
    fixedVsConfigurable[rule.rule_id] = rule.fixed ? "fixed" : "configurable";
  }

  const submissionId = (() => {
    const input = normalizedInput as Record<string, unknown>;
    return String(input.submission_id ?? "unknown");
  })();

  const snapshot: ResolvedStandardsSnapshot = {
    resolved_standards_id: snapshotId,
    submission_id: submissionId,
    created_at: createdAt,
    system_version: "1.0.0",
    schema_version_used: "1.0.0",
    standards_library_version_used: registry.index.standards_library_version,
    resolver_version: registry.resolverRules.version,
    resolver_context: context,
    selected_packs: selectedPacks,
    rules: resolvedRules,
    fixed_vs_configurable: fixedVsConfigurable,
    overrides_applied: [],
    overrides_blocked: [],
    conflicts: conflictLog,
    run_id: runId,
    resolved_standards: resolvedStandards,
    resolver_trace: resolverTrace,
  };

  const resolverOutput: ResolverOutput = {
    resolver_context: context,
    selected_packs: selectedPacks,
    resolved_rules: resolvedRules,
    overrides_applied: [],
    overrides_blocked: [],
    conflict_log: conflictLog,
  };

  return { snapshot, resolverOutput };
}
