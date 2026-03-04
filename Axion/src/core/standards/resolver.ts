import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { isoNow } from "../../utils/time.js";
import { sha256 } from "../../utils/hash.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import type { RoutingSnapshot, NormalizedInputRecord } from "../intake/normalizer.js";
import { loadPackIndex, matchPacks } from "./selector.js";
import { writeSnapshot } from "./snapshot.js";
import type { StandardsSnapshot } from "./snapshot.js";

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

interface PackRuleRaw {
  rule_id: string;
  name: string;
  description: string;
  rule_type: string;
  value: unknown;
  fixed: boolean;
  source_pack: string;
}

interface PackFile {
  pack_id: string;
  pack_version: string;
  category: string;
  fixed_rules: PackRuleRaw[];
  configurable_rules: PackRuleRaw[];
}

export function computeResolverContext(normalizedInput: unknown): ResolverContext {
  const input = normalizedInput as NormalizedInputRecord;
  const routing = input.routing ?? { skill_level: "", category: "", type_preset: "", build_target: "", audience_context: "" };
  const constraints = (input.constraints ?? {}) as Record<string, unknown>;

  return {
    routing,
    gates: {
      data_enabled: true,
      auth_required: constraints.auth_required === true,
      integrations_enabled: true,
    },
    compliance_flags: Array.isArray(constraints.compliance_flags)
      ? (constraints.compliance_flags as string[])
      : [],
    delivery: {
      scope: String(constraints.desired_scope ?? "mvp"),
      priority_bias: String(constraints.priority_bias ?? "balanced"),
    },
  };
}

export function selectPacks(context: ResolverContext, indexPath: string): SelectedPack[] {
  const index = loadPackIndex(indexPath);
  return matchPacks(index, context);
}

export function resolveStandards(normalizedInput: unknown, libraryPath: string): ResolverOutput {
  const context = computeResolverContext(normalizedInput);
  const indexPath = join(libraryPath, "standards_index.json");
  const selectedPacks = selectPacks(context, indexPath);

  const ruleMap = new Map<string, { rule: ResolvedRule; packKey: string; specificity: number; priority: number }>();
  const conflictLog: ConflictEntry[] = [];

  for (const pack of selectedPacks) {
    const packFilePath = join(libraryPath, "packs", `${pack.pack_id}@${pack.pack_version}.json`);
    if (!existsSync(packFilePath)) continue;

    const packData: PackFile = JSON.parse(readFileSync(packFilePath, "utf-8"));
    const allRules = [...(packData.fixed_rules ?? []), ...(packData.configurable_rules ?? [])];
    const packKey = `${pack.pack_id}@${pack.pack_version}`;

    for (const raw of allRules) {
      const existing = ruleMap.get(raw.rule_id);

      const resolved: ResolvedRule = {
        rule_id: raw.rule_id,
        category: packData.category,
        name: raw.name,
        description: raw.description,
        rule_type: raw.rule_type as ResolvedRule["rule_type"],
        value: raw.value,
        fixed: raw.fixed,
        sources: [packKey],
        resolved_by: "exact_match",
      };

      if (!existing) {
        ruleMap.set(raw.rule_id, { rule: resolved, packKey, specificity: pack.specificity_score, priority: pack.priority });
      } else {
        const existingVal = JSON.stringify(existing.rule.value);
        const newVal = JSON.stringify(raw.value);

        if (existingVal !== newVal) {
          conflictLog.push({
            rule_id: raw.rule_id,
            packs: [existing.packKey, packKey],
            values: [existing.rule.value, raw.value],
            resolution: pack.specificity_score > existing.specificity
              ? `higher_specificity:${packKey}`
              : pack.priority > existing.priority
                ? `higher_priority:${packKey}`
                : `kept:${existing.packKey}`,
          });

          if (pack.specificity_score > existing.specificity || pack.priority > existing.priority) {
            resolved.resolved_by = "precedence";
            resolved.sources = [...existing.rule.sources, packKey];
            ruleMap.set(raw.rule_id, { rule: resolved, packKey, specificity: pack.specificity_score, priority: pack.priority });
          } else {
            existing.rule.sources.push(packKey);
          }
        } else {
          existing.rule.sources.push(packKey);
        }
      }
    }
  }

  const resolvedRules = Array.from(ruleMap.values())
    .map((entry) => entry.rule)
    .sort((a, b) => a.rule_id.localeCompare(b.rule_id));

  return {
    resolver_context: context,
    selected_packs: selectedPacks,
    resolved_rules: resolvedRules,
    overrides_applied: [],
    overrides_blocked: [],
    conflict_log: conflictLog,
  };
}

export function resolveAndWriteStandards(
  runDir: string,
  runId: string,
  normalizedInput: unknown,
  libraryPath: string,
): void {
  const output = resolveStandards(normalizedInput, libraryPath);

  const applicabilityOutput = {
    run_id: runId,
    generated_at: isoNow(),
    resolver_context: output.resolver_context,
    selected_packs: output.selected_packs,
    total_packs_evaluated: output.selected_packs.length,
    conflict_log: output.conflict_log,
  };
  writeCanonicalJson(join(runDir, "standards", "applicability_output.json"), applicabilityOutput);

  const input = normalizedInput as NormalizedInputRecord;
  const fixedVsConfigurable: Record<string, "fixed" | "configurable"> = {};
  for (const rule of output.resolved_rules) {
    fixedVsConfigurable[rule.rule_id] = rule.fixed ? "fixed" : "configurable";
  }

  const index = loadPackIndex(join(libraryPath, "standards_index.json"));

  const snapshot: StandardsSnapshot = {
    resolved_standards_id: `RSTD-${sha256(runId + isoNow()).slice(0, 12).toUpperCase()}`,
    submission_id: input.submission_id ?? runId,
    created_at: isoNow(),
    versions: {
      system_version: "1.0.0",
      schema_version_used: "1.0.0",
      standards_library_version_used: index.standards_library_version,
      resolver_ruleset_version_used: "1.0.0",
    },
    resolver_context: output.resolver_context,
    selected_packs: output.selected_packs,
    rules: output.resolved_rules,
    fixed_vs_configurable: fixedVsConfigurable,
    overrides_applied: output.overrides_applied,
    overrides_blocked: output.overrides_blocked,
    conflicts: output.conflict_log,
  };

  writeSnapshot(runDir, snapshot);
}
