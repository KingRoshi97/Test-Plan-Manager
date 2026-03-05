import type { RoutingSnapshot } from "../intake/normalizer.js";
import type { PackIndexEntry, ResolverRules, StandardsPack } from "./registryLoader.js";

export interface ApplicabilityMatch {
  pack_id: string;
  version: string;
  rationale: string;
  match_score: number;
}

export interface ApplicabilityOutput {
  run_id: string;
  evaluated_at: string;
  matched_packs: ApplicabilityMatch[];
  unmatched_packs: string[];
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function computeMatchScore(
  appliesWhen: Record<string, unknown>,
  context: Record<string, unknown>,
  applicabilityFields: string[]
): { score: number; matched: string[] } {
  const routing = (appliesWhen.routing ?? {}) as Record<string, unknown>;
  const gates = (appliesWhen.gates ?? {}) as Record<string, unknown>;

  const routingKeys = Object.keys(routing);
  const gatesKeys = Object.keys(gates);

  if (routingKeys.length === 0 && gatesKeys.length === 0) {
    return { score: 1, matched: ["universal_pack"] };
  }

  const matched: string[] = [];
  let total = 0;
  let hits = 0;

  for (const key of routingKeys) {
    total++;
    const contextVal = getNestedValue(context, `routing.${key}`);
    if (contextVal !== undefined && String(contextVal).toLowerCase() === String(routing[key]).toLowerCase()) {
      hits++;
      matched.push(`routing.${key}=${routing[key]}`);
    }
  }

  for (const key of gatesKeys) {
    total++;
    const contextVal = getNestedValue(context, `gates.${key}`);
    if (contextVal !== undefined && contextVal === gates[key]) {
      hits++;
      matched.push(`gates.${key}=${gates[key]}`);
    }
  }

  if (total === 0) return { score: 1, matched: ["universal_pack"] };
  return { score: hits / total, matched };
}

export function evaluateApplicability(
  routing: RoutingSnapshot,
  constraints: Record<string, unknown>,
  packs: Array<{ pack_id: string; pack_version: string; applies_when: Record<string, unknown> }>,
  resolverRules: ResolverRules,
  runId: string,
  evaluatedAt: string
): ApplicabilityOutput {
  const context: Record<string, unknown> = {
    routing,
    constraints,
    gates: {
      data_enabled: true,
      auth_required: true,
      integrations_enabled: false,
    },
  };

  const matched: ApplicabilityMatch[] = [];
  const unmatched: string[] = [];

  for (const pack of packs) {
    const result = computeMatchScore(pack.applies_when, context, resolverRules.selection.applicability_fields);

    if (result.score > 0) {
      matched.push({
        pack_id: pack.pack_id,
        version: pack.pack_version,
        rationale: result.matched.length > 0
          ? `Matched on: ${result.matched.join(", ")}`
          : "Universal pack (no constraints)",
        match_score: result.score,
      });
    } else {
      unmatched.push(pack.pack_id);
    }
  }

  return {
    run_id: runId,
    evaluated_at: evaluatedAt,
    matched_packs: matched,
    unmatched_packs: unmatched,
  };
}
