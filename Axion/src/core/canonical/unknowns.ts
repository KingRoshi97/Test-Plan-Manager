import type { UnknownEntity } from "./specBuilder.js";
import type { NormalizedInputRecord } from "../intake/normalizer.js";
import type { CanonicalSpec } from "./specBuilder.js";
import { ENTITY_PREFIXES } from "../ids/idRules.js";

export interface UnknownDetectionResult {
  unknowns: UnknownEntity[];
  unknown_index: Record<string, UnknownEntity>;
  stats: {
    total: number;
    blocking: number;
    high_impact: number;
  };
}

function makeUnknownId(index: number): string {
  const padded = String(index + 1).padStart(3, "0");
  return `${ENTITY_PREFIXES.unknown}${padded}`;
}

export function extractUnknowns(normalizedInput: unknown, spec: unknown): UnknownDetectionResult {
  const normalized = normalizedInput as NormalizedInputRecord;
  const canonicalSpec = spec as CanonicalSpec;
  const unknowns: UnknownEntity[] = [];
  let idx = 0;

  if (!normalized.project.project_overview || normalized.project.project_overview.length < 10) {
    unknowns.push({
      unknown_id: makeUnknownId(idx++),
      area: "project",
      summary: "Project overview is missing or too brief to derive detailed requirements",
      impact: "medium",
      blocking: false,
      needs: "Clarification from stakeholder on project scope and goals",
      refs: [],
    });
  }

  if (canonicalSpec.entities.roles.length === 0) {
    unknowns.push({
      unknown_id: makeUnknownId(idx++),
      area: "roles",
      summary: "No user roles defined in the intake submission",
      impact: "high",
      blocking: false,
      needs: "Define at least one user role with permissions",
      refs: [],
    });
  }

  if (canonicalSpec.entities.features.length === 0) {
    unknowns.push({
      unknown_id: makeUnknownId(idx++),
      area: "features",
      summary: "No features defined in the intake submission",
      impact: "high",
      blocking: true,
      needs: "Define must-have features to produce a meaningful spec",
      refs: [],
    });
  }

  if (canonicalSpec.entities.workflows.length === 0) {
    unknowns.push({
      unknown_id: makeUnknownId(idx++),
      area: "workflows",
      summary: "No workflows defined in the intake submission",
      impact: "medium",
      blocking: false,
      needs: "Define key user workflows to ensure feature coverage",
      refs: [],
    });
  }

  const constraintKeys = Object.keys(normalized.constraints);
  if (constraintKeys.length === 0) {
    unknowns.push({
      unknown_id: makeUnknownId(idx++),
      area: "constraints",
      summary: "No non-functional requirements or constraints specified",
      impact: "low",
      blocking: false,
      needs: "Specify performance, security, and compliance constraints if applicable",
      refs: [],
    });
  }

  const unknown_index: Record<string, UnknownEntity> = {};
  for (const u of unknowns) {
    unknown_index[u.unknown_id] = u;
  }

  return {
    unknowns,
    unknown_index,
    stats: {
      total: unknowns.length,
      blocking: unknowns.filter((u) => u.blocking).length,
      high_impact: unknowns.filter((u) => u.impact === "high").length,
    },
  };
}

export function mergeUnknowns(existing: UnknownEntity[], newUnknowns: UnknownEntity[]): UnknownEntity[] {
  const seen = new Set(existing.map((u) => u.unknown_id));
  const merged = [...existing];
  for (const u of newUnknowns) {
    if (!seen.has(u.unknown_id)) {
      merged.push(u);
      seen.add(u.unknown_id);
    }
  }
  return merged;
}
