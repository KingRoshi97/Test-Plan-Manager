import { join } from "node:path";
import { readFileSync, existsSync } from "node:fs";
import { isoNow } from "../../utils/time.js";
import { writeCanonicalJson } from "../../utils/canonicalJson.js";
import type { CanonicalSpec, FeatureEntity, WorkflowEntity, RoleEntity } from "../canonical/specBuilder.js";

export interface WorkUnit {
  unit_id: string;
  title: string;
  name?: string;
  type: "spec" | "design" | "frontend" | "backend" | "contracts" | "data" | "security" | "qa" | "devops" | "docs";
  description?: string;
  scope_refs: string[];
  depends_on: string[];
  deliverables: string[];
  outputs: string[];
  acceptance_refs?: string[];
}

export interface DependencyEdge {
  from: string;
  to: string;
}

export interface DependencyGraph {
  nodes: string[];
  edges: DependencyEdge[];
}

export interface WorkBreakdownOutput {
  work_breakdown_id: string;
  version: string;
  run_id: string;
  spec_id: string;
  created_at: string;
  units: WorkUnit[];
  dependency_graph: DependencyGraph;
  unit_index: Record<string, WorkUnit>;
}

interface SequencingPolicy {
  unit_order: {
    primary: string[];
    tie_breakers: string[];
  };
}

function loadSequencingPolicy(repoRoot: string): SequencingPolicy {
  const policyPath = join(repoRoot, "libraries", "planning", "sequencing_policy.v1.json");
  if (existsSync(policyPath)) {
    return JSON.parse(readFileSync(policyPath, "utf-8"));
  }
  return {
    unit_order: {
      primary: ["spec", "contracts", "data", "backend", "frontend", "security", "qa", "devops", "docs", "design"],
      tie_breakers: ["unit_id_asc"],
    },
  };
}

function sortUnits(units: WorkUnit[], policy: SequencingPolicy): WorkUnit[] {
  const typeOrder = policy.unit_order.primary;
  return [...units].sort((a, b) => {
    const aIdx = typeOrder.indexOf(a.type);
    const bIdx = typeOrder.indexOf(b.type);
    const aPri = aIdx === -1 ? typeOrder.length : aIdx;
    const bPri = bIdx === -1 ? typeOrder.length : bIdx;
    if (aPri !== bPri) return aPri - bPri;
    return a.unit_id.localeCompare(b.unit_id);
  });
}

function buildDependencyGraph(units: WorkUnit[]): DependencyGraph {
  const nodes = units.map((u) => u.unit_id);
  const edges: DependencyEdge[] = [];
  for (const unit of units) {
    for (const dep of unit.depends_on) {
      edges.push({ from: dep, to: unit.unit_id });
    }
  }
  return { nodes, edges };
}

export function buildWorkBreakdown(canonicalSpec: CanonicalSpec, runId: string, repoRoot: string): WorkBreakdownOutput {
  const specId = canonicalSpec.meta.spec_id;
  const policy = loadSequencingPolicy(repoRoot);
  const units: WorkUnit[] = [];
  let unitCounter = 0;

  const specUnit: WorkUnit = {
    unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
    title: "Specification & Requirements",
    name: "Specification & Requirements",
    type: "spec",
    description: "Define and validate project requirements from canonical spec",
    scope_refs: [specId],
    depends_on: [],
    deliverables: ["canonical_spec.json", "unknowns.json"],
    outputs: ["canonical_spec.json", "unknowns.json"],
  };
  units.push(specUnit);

  for (const feature of canonicalSpec.entities.features) {
    const backendUnit: WorkUnit = {
      unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
      title: `Backend: ${feature.name}`,
      name: feature.name,
      type: "backend",
      description: feature.description ?? `Implement backend logic for ${feature.name}`,
      scope_refs: [feature.feature_id],
      depends_on: [specUnit.unit_id],
      deliverables: [`backend/${feature.feature_id.toLowerCase()}.ts`],
      outputs: [`backend/${feature.feature_id.toLowerCase()}.ts`],
    };
    units.push(backendUnit);

    const frontendUnit: WorkUnit = {
      unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
      title: `Frontend: ${feature.name}`,
      name: feature.name,
      type: "frontend",
      description: `Build UI components for ${feature.name}`,
      scope_refs: [feature.feature_id],
      depends_on: [backendUnit.unit_id],
      deliverables: [`frontend/${feature.feature_id.toLowerCase()}.tsx`],
      outputs: [`frontend/${feature.feature_id.toLowerCase()}.tsx`],
    };
    units.push(frontendUnit);
  }

  if (canonicalSpec.entities.workflows.length > 0) {
    const contractsUnit: WorkUnit = {
      unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
      title: "API Contracts & Interfaces",
      name: "API Contracts & Interfaces",
      type: "contracts",
      description: "Define API contracts for all workflows",
      scope_refs: canonicalSpec.entities.workflows.map((w) => w.workflow_id),
      depends_on: [specUnit.unit_id],
      deliverables: ["contracts/api_schema.json"],
      outputs: ["contracts/api_schema.json"],
    };
    units.push(contractsUnit);
  }

  if (canonicalSpec.entities.roles.length > 0) {
    const rolesUnit: WorkUnit = {
      unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
      title: "Roles & Access Control",
      name: "Roles & Access Control",
      type: "security",
      description: "Define and implement user roles and access levels",
      scope_refs: canonicalSpec.entities.roles.map((r) => r.role_id),
      depends_on: [specUnit.unit_id],
      deliverables: ["security/roles.ts"],
      outputs: ["security/roles.ts"],
    };
    units.push(rolesUnit);
  }

  if (canonicalSpec.entities.permissions.length > 0) {
    const securityUnit: WorkUnit = {
      unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
      title: "Security & Permissions",
      name: "Security & Permissions",
      type: "security",
      description: "Implement role-based permissions and security controls",
      scope_refs: canonicalSpec.entities.permissions.map((p) => p.perm_id),
      depends_on: [specUnit.unit_id],
      deliverables: ["security/rbac.ts", "security/policies.json"],
      outputs: ["security/rbac.ts", "security/policies.json"],
    };
    units.push(securityUnit);
  }

  const qaUnit: WorkUnit = {
    unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
    title: "Quality Assurance & Testing",
    name: "Quality Assurance & Testing",
    type: "qa",
    description: "Write and run tests for all features and workflows",
    scope_refs: canonicalSpec.entities.features.map((f) => f.feature_id),
    depends_on: units.filter((u) => u.type === "backend" || u.type === "frontend").map((u) => u.unit_id),
    deliverables: ["tests/test_results.json"],
    outputs: ["tests/test_results.json"],
  };
  units.push(qaUnit);

  const docsUnit: WorkUnit = {
    unit_id: `WU-${String(++unitCounter).padStart(3, "0")}`,
    title: "Documentation",
    name: "Documentation",
    type: "docs",
    description: "Generate project documentation from templates and specs",
    scope_refs: [specId],
    depends_on: [specUnit.unit_id],
    deliverables: ["docs/README.md", "docs/api_reference.md"],
    outputs: ["docs/README.md", "docs/api_reference.md"],
  };
  units.push(docsUnit);

  const sorted = sortUnits(units, policy);

  const dependencyGraph = buildDependencyGraph(sorted);

  const unitIndex: Record<string, WorkUnit> = {};
  for (const unit of sorted) {
    unitIndex[unit.unit_id] = unit;
  }

  return {
    work_breakdown_id: `WBD-${runId}`,
    version: "1.0.0",
    run_id: runId,
    spec_id: specId,
    created_at: isoNow(),
    units: sorted,
    dependency_graph: dependencyGraph,
    unit_index: unitIndex,
  };
}
