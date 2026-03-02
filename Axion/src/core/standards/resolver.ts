import { NotImplementedError } from "../../utils/errors.js";
import type { RoutingSnapshot } from "../intake/normalizer.js";

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

export function computeResolverContext(_normalizedInput: unknown): ResolverContext {
  throw new NotImplementedError("computeResolverContext");
}

export function selectPacks(_context: ResolverContext, _indexPath: string): SelectedPack[] {
  throw new NotImplementedError("selectPacks");
}

export function resolveStandards(_normalizedInput: unknown, _libraryPath: string): ResolverOutput {
  throw new NotImplementedError("resolveStandards");
}
