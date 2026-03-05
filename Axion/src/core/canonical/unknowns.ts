import type { UnknownEntity, CanonicalSpec } from "./specBuilder.js";
import type { NormalizedInputRecord } from "../intake/normalizer.js";

export interface UnknownDetectionResult {
  unknowns: UnknownEntity[];
  unknown_index: Record<string, UnknownEntity>;
  stats: {
    total: number;
    blocking: number;
    high_impact: number;
  };
}

function generateUnknownId(index: number): string {
  return `UNK-${String(index + 1).padStart(3, "0")}`;
}

export function extractUnknowns(normalizedInput: unknown, spec: unknown): UnknownDetectionResult {
  const input = normalizedInput as NormalizedInputRecord;
  const canonical = spec as CanonicalSpec;
  const unknowns: UnknownEntity[] = [];
  let idx = 0;

  if (!input.spec.must_have_features || input.spec.must_have_features.length === 0) {
    unknowns.push({
      unknown_id: generateUnknownId(idx++),
      area: "features",
      summary: "No features defined in intake",
      impact: "high",
      blocking: true,
      needs: "At least one feature must be specified",
      refs: [],
    });
  }

  for (const feat of input.spec.must_have_features ?? []) {
    if (!feat.description) {
      unknowns.push({
        unknown_id: generateUnknownId(idx++),
        area: "features",
        summary: `Feature "${feat.name}" has no description`,
        impact: "low",
        blocking: false,
        needs: "Description for feature clarity",
        refs: [],
      });
    }
  }

  if (!input.spec.roles || input.spec.roles.length === 0) {
    unknowns.push({
      unknown_id: generateUnknownId(idx++),
      area: "roles",
      summary: "No roles defined in intake",
      impact: "high",
      blocking: true,
      needs: "At least one role must be specified",
      refs: [],
    });
  }

  if (!input.spec.workflows || input.spec.workflows.length === 0) {
    unknowns.push({
      unknown_id: generateUnknownId(idx++),
      area: "workflows",
      summary: "No workflows defined in intake",
      impact: "medium",
      blocking: false,
      needs: "Workflows help define user journeys",
      refs: [],
    });
  }

  for (const wf of canonical.entities.workflows) {
    const roleExists = canonical.entities.roles.some(
      (r) => r.role_id === wf.actor_role_ref
    );
    if (!roleExists) {
      unknowns.push({
        unknown_id: generateUnknownId(idx++),
        area: "workflows",
        summary: `Workflow "${wf.name}" references unknown role ${wf.actor_role_ref}`,
        impact: "high",
        blocking: true,
        needs: "Valid role reference for workflow actor",
        refs: [wf.workflow_id, wf.actor_role_ref],
      });
    }
  }

  const constraintsObj = input.constraints as Record<string, unknown>;
  if (!constraintsObj || Object.keys(constraintsObj).length === 0) {
    unknowns.push({
      unknown_id: generateUnknownId(idx++),
      area: "constraints",
      summary: "No constraints provided - defaults will be used",
      impact: "low",
      blocking: false,
      needs: "Explicit constraints improve spec quality",
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
  const existingSummaries = new Set(existing.map((u) => u.summary));
  const merged = [...existing];
  for (const u of newUnknowns) {
    if (!existingSummaries.has(u.summary)) {
      merged.push(u);
    }
  }
  return merged;
}
