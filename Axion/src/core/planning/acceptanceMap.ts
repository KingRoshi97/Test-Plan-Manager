import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import type { CanonicalSpec } from "../canonical/specBuilder.js";
import type { WorkBreakdownOutput, WorkUnit } from "./workBreakdown.js";

export interface RequiredProof {
  type: "test_run" | "lint_run" | "typecheck" | "screenshot" | "api_trace" | "log_excerpt" | "manual_check" | "benchmark";
  ref: string;
  notes?: string;
}

export interface AcceptanceItem {
  acceptance_id: string;
  title: string;
  unit_ref: string;
  category: "screen" | "endpoint" | "entity" | "business_rule" | "component" | "acceptance_criterion" | "test_case" | "flow" | "nonfunctional";
  criteria: string[];
  required_proof: RequiredProof[];
}

export interface AcceptanceMapOutput {
  version: string;
  run_id: string;
  spec_id: string;
  acceptance: AcceptanceItem[];
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

function proofForType(unitType: string): RequiredProof[] {
  switch (unitType) {
    case "backend":
      return [
        { type: "test_run", ref: "unit_tests" },
        { type: "typecheck", ref: "tsc_check" },
      ];
    case "frontend":
      return [
        { type: "test_run", ref: "component_tests" },
        { type: "screenshot", ref: "ui_screenshot" },
      ];
    case "security":
      return [
        { type: "lint_run", ref: "security_scan" },
        { type: "test_run", ref: "auth_tests" },
      ];
    case "qa":
      return [
        { type: "test_run", ref: "integration_tests" },
        { type: "log_excerpt", ref: "test_logs" },
      ];
    case "contracts":
      return [
        { type: "typecheck", ref: "schema_validation" },
        { type: "api_trace", ref: "contract_trace" },
      ];
    case "spec":
      return [{ type: "manual_check", ref: "spec_review" }];
    case "docs":
      return [{ type: "manual_check", ref: "docs_review" }];
    default:
      return [{ type: "manual_check", ref: `${unitType}_review` }];
  }
}

function categoryForType(unitType: string): AcceptanceItem["category"] {
  switch (unitType) {
    case "backend":
      return "endpoint";
    case "frontend":
      return "screen";
    case "contracts":
      return "entity";
    case "security":
      return "business_rule";
    case "qa":
      return "test_case";
    case "spec":
      return "acceptance_criterion";
    case "docs":
      return "acceptance_criterion";
    default:
      return "component";
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

    items.push({
      acceptance_id: acceptanceId,
      title: `Acceptance: ${unit.title}`,
      unit_ref: unit.unit_id,
      category: categoryForType(unit.type),
      criteria,
      required_proof: proofForType(unit.type),
    });

    unit.acceptance_refs = [acceptanceId];
  }

  const sorted = sortAcceptance(items, order);

  return {
    version: "1.0.0",
    run_id: runId,
    spec_id: specId,
    acceptance: sorted,
  };
}
