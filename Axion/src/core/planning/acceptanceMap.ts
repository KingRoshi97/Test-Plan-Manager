import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { isoNow } from "../../utils/time.js";
import type { CanonicalSpec } from "../canonical/specBuilder.js";
import type { WorkBreakdownOutput, WorkUnit } from "./workBreakdown.js";

export interface AcceptanceItem {
  acceptance_id: string;
  unit_id: string;
  unit_ref: string;
  title: string;
  statement: string;
  criterion_type: "functional_check" | "verification" | "performance" | "security" | "compliance";
  proof_required: boolean;
  proof_type: "test_run" | "lint_run" | "typecheck" | "screenshot" | "api_trace" | "log_excerpt" | "manual_check" | "benchmark";
  how_to_verify: string;
  gating: "hard_gate" | "soft_gate";
  scope_refs: string[];
  category: "screen" | "endpoint" | "entity" | "business_rule" | "component" | "acceptance_criterion" | "test_case" | "flow" | "nonfunctional";
  criteria: string[];
}

export interface UnitAcceptanceIndex {
  [unit_id: string]: string[];
}

export interface AcceptanceMapOutput {
  acceptance_map_id: string;
  work_breakdown_id: string;
  version: string;
  run_id: string;
  spec_id: string;
  created_at: string;
  acceptance_items: AcceptanceItem[];
  acceptance: AcceptanceItem[];
  unit_acceptance_index: UnitAcceptanceIndex;
}

interface AcceptanceOrder {
  primary: string[];
  tie_breakers: string[];
}

function loadAcceptanceOrder(repoRoot: string): AcceptanceOrder {
  const policyPath = join(repoRoot, "libraries", "planning", "sequencing_policy.v1.json");
  if (existsSync(policyPath)) {
    const policy = JSON.parse(readFileSync(policyPath, "utf-8"));
    return policy.acceptance_order ?? { primary: [], tie_breakers: ["acceptance_id_asc"] };
  }
  return {
    primary: ["entity", "business_rule", "endpoint", "flow", "component", "screen", "test_case", "acceptance_criterion", "nonfunctional"],
    tie_breakers: ["acceptance_id_asc"],
  };
}

function sortAcceptance(items: AcceptanceItem[], order: AcceptanceOrder): AcceptanceItem[] {
  const catOrder = order.primary;
  return [...items].sort((a, b) => {
    const aIdx = catOrder.indexOf(a.category);
    const bIdx = catOrder.indexOf(b.category);
    const aPri = aIdx === -1 ? catOrder.length : aIdx;
    const bPri = bIdx === -1 ? catOrder.length : bIdx;
    if (aPri !== bPri) return aPri - bPri;
    return a.acceptance_id.localeCompare(b.acceptance_id);
  });
}

function proofTypeForUnit(unitType: string): AcceptanceItem["proof_type"] {
  switch (unitType) {
    case "backend": return "test_run";
    case "frontend": return "screenshot";
    case "security": return "lint_run";
    case "qa": return "test_run";
    case "contracts": return "typecheck";
    case "spec": return "manual_check";
    case "docs": return "manual_check";
    default: return "manual_check";
  }
}

function categoryForType(unitType: string): AcceptanceItem["category"] {
  switch (unitType) {
    case "backend": return "endpoint";
    case "frontend": return "screen";
    case "contracts": return "entity";
    case "security": return "business_rule";
    case "qa": return "test_case";
    case "spec": return "acceptance_criterion";
    case "docs": return "acceptance_criterion";
    default: return "component";
  }
}

function gatingForType(unitType: string): "hard_gate" | "soft_gate" {
  switch (unitType) {
    case "spec": return "hard_gate";
    case "backend": return "hard_gate";
    case "contracts": return "hard_gate";
    case "security": return "hard_gate";
    case "qa": return "hard_gate";
    case "frontend": return "soft_gate";
    case "docs": return "soft_gate";
    default: return "soft_gate";
  }
}

function howToVerifyForType(unitType: string, title: string): string {
  switch (unitType) {
    case "backend": return `Run unit tests for ${title}; confirm all pass with no failures`;
    case "frontend": return `Take screenshot of ${title} UI; confirm layout matches requirements`;
    case "security": return `Run security scan; confirm no critical findings for ${title}`;
    case "qa": return `Execute integration test suite; confirm all tests in ${title} pass`;
    case "contracts": return `Validate API schema for ${title}; run contract tests`;
    case "spec": return `Review ${title} documentation; confirm all requirements documented`;
    case "docs": return `Review generated documentation for completeness`;
    default: return `Manually verify ${title} is complete and meets acceptance criteria`;
  }
}

export function buildAcceptanceMap(
  canonicalSpec: CanonicalSpec,
  workBreakdown: WorkBreakdownOutput,
  runId: string,
  repoRoot: string
): AcceptanceMapOutput {
  const specId = canonicalSpec.meta.spec_id;
  const order = loadAcceptanceOrder(repoRoot);
  const items: AcceptanceItem[] = [];
  let counter = 0;

  for (const unit of workBreakdown.units) {
    const acceptanceId = `ACC-${String(++counter).padStart(3, "0")}`;

    const criteria: string[] = [];

    if (unit.type === "spec") {
      criteria.push("All requirements documented and validated");
      criteria.push("No blocking unknowns remain");
    } else if (unit.type === "backend" || unit.type === "frontend") {
      const featureRef = unit.scope_refs[0];
      const feature = canonicalSpec.entities.features.find((f) => f.feature_id === featureRef);
      if (feature) {
        criteria.push(`${feature.name} is implemented and functional`);
        criteria.push(`${feature.name} passes all defined tests`);
      } else {
        criteria.push(`${unit.title} is implemented and functional`);
      }
    } else if (unit.type === "security") {
      criteria.push("All permission rules enforced");
      criteria.push("Security scan passes with no critical findings");
    } else if (unit.type === "qa") {
      criteria.push("All test suites pass");
      criteria.push("Code coverage meets minimum threshold");
    } else if (unit.type === "contracts") {
      criteria.push("All API contracts validated against schema");
      criteria.push("Contract tests pass");
    } else if (unit.type === "docs") {
      criteria.push("All required documentation generated");
      criteria.push("Documentation completeness check passes");
    } else {
      criteria.push(`${unit.title} completed and verified`);
    }

    if (canonicalSpec.rules.acceptance_criteria) {
      for (const ac of canonicalSpec.rules.acceptance_criteria) {
        for (const ref of unit.scope_refs) {
          if (ac.startsWith(ref)) {
            criteria.push(ac);
          }
        }
      }
    }

    const item: AcceptanceItem = {
      acceptance_id: acceptanceId,
      unit_id: unit.unit_id,
      unit_ref: unit.unit_id,
      title: `Acceptance: ${unit.title}`,
      statement: criteria[0] ?? `${unit.title} meets all requirements`,
      criterion_type: unit.type === "qa" ? "verification" : "functional_check",
      proof_required: gatingForType(unit.type) === "hard_gate",
      proof_type: proofTypeForUnit(unit.type),
      how_to_verify: howToVerifyForType(unit.type, unit.title),
      gating: gatingForType(unit.type),
      scope_refs: unit.scope_refs,
      category: categoryForType(unit.type),
      criteria,
    };

    items.push(item);
    unit.acceptance_refs = [acceptanceId];
  }

  const sorted = sortAcceptance(items, order);

  const unitAcceptanceIndex: UnitAcceptanceIndex = {};
  for (const item of sorted) {
    if (!unitAcceptanceIndex[item.unit_id]) {
      unitAcceptanceIndex[item.unit_id] = [];
    }
    unitAcceptanceIndex[item.unit_id].push(item.acceptance_id);
  }

  return {
    acceptance_map_id: `ACCMAP-${runId}`,
    work_breakdown_id: workBreakdown.work_breakdown_id,
    version: "1.0.0",
    run_id: runId,
    spec_id: specId,
    created_at: isoNow(),
    acceptance_items: sorted,
    acceptance: sorted,
    unit_acceptance_index: unitAcceptanceIndex,
  };
}
