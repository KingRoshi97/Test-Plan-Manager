import { createHash } from "node:crypto";
import type {
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
  BAQSufficiencyDimension,
  BAQSufficiencyGap,
} from "./types.js";

function stableId(prefix: string, ...parts: string[]): string {
  const hash = createHash("sha256").update(parts.join(":")).digest("hex").slice(0, 8);
  return `${prefix}-${hash}`;
}

export type ArtifactFamily = "required" | "optional" | "proof" | "test" | "config" | "runtime" | "docs" | "inferred";

export interface ArtifactFamilyClassification {
  file_id: string;
  path: string;
  family: ArtifactFamily;
  is_placeholder: boolean;
  placeholder_risk: "none" | "low" | "medium" | "high";
  is_inferred: boolean;
  overreach: boolean;
}

export function evaluateSufficiency(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
  traceMap: BAQRequirementTraceMap,
): BAQSufficiencyEvaluation {
  const now = new Date().toISOString();
  const evalId = stableId("BAQS", derivedInputs.run_id, inventory.inventory_id, traceMap.trace_map_id);

  const classifications = classifyArtifactFamilies(inventory, traceMap, derivedInputs);
  const crossSchemaIssues = validateCrossSchemaIntegrity(inventory, traceMap, derivedInputs);

  const dimensions: BAQSufficiencyDimension[] = [];
  const gaps: BAQSufficiencyGap[] = [];

  const featureCoverage = evaluateFeatureCoverage(derivedInputs, traceMap);
  const featureDimId = stableId("DIM", derivedInputs.run_id, "feature_coverage");
  dimensions.push({
    dimension_id: featureDimId,
    name: "Feature Coverage",
    score: featureCoverage.score,
    threshold: 60,
    passed: featureCoverage.score >= 60,
    detail: featureCoverage.detail,
  });
  for (const gap of featureCoverage.gaps) {
    gaps.push({ ...gap, gap_id: stableId("GAP", derivedInputs.run_id, "feature", gap.description.slice(0, 30)), dimension_ref: featureDimId });
  }

  const structuralCompleteness = evaluateStructuralCompleteness(derivedInputs, inventory);
  const structDimId = stableId("DIM", derivedInputs.run_id, "structural_completeness");
  dimensions.push({
    dimension_id: structDimId,
    name: "Structural Completeness",
    score: structuralCompleteness.score,
    threshold: 70,
    passed: structuralCompleteness.score >= 70,
    detail: structuralCompleteness.detail,
  });
  for (const gap of structuralCompleteness.gaps) {
    gaps.push({ ...gap, gap_id: stableId("GAP", derivedInputs.run_id, "structural", gap.description.slice(0, 30)), dimension_ref: structDimId });
  }

  const apiCoverage = evaluateAPICoverage(derivedInputs, inventory);
  const apiDimId = stableId("DIM", derivedInputs.run_id, "api_coverage");
  dimensions.push({
    dimension_id: apiDimId,
    name: "API Coverage",
    score: apiCoverage.score,
    threshold: 50,
    passed: apiCoverage.score >= 50,
    detail: apiCoverage.detail,
  });
  for (const gap of apiCoverage.gaps) {
    gaps.push({ ...gap, gap_id: stableId("GAP", derivedInputs.run_id, "api", gap.description.slice(0, 30)), dimension_ref: apiDimId });
  }

  const domainCoverage = evaluateDomainCoverage(derivedInputs, inventory);
  const domainDimId = stableId("DIM", derivedInputs.run_id, "domain_coverage");
  dimensions.push({
    dimension_id: domainDimId,
    name: "Domain Model Coverage",
    score: domainCoverage.score,
    threshold: 50,
    passed: domainCoverage.score >= 50,
    detail: domainCoverage.detail,
  });
  for (const gap of domainCoverage.gaps) {
    gaps.push({ ...gap, gap_id: stableId("GAP", derivedInputs.run_id, "domain", gap.description.slice(0, 30)), dimension_ref: domainDimId });
  }

  const obligationCoverage = evaluateObligationCoverage(derivedInputs, traceMap);
  const oblDimId = stableId("DIM", derivedInputs.run_id, "obligation_coverage");
  dimensions.push({
    dimension_id: oblDimId,
    name: "Obligation Coverage",
    score: obligationCoverage.score,
    threshold: 40,
    passed: obligationCoverage.score >= 40,
    detail: obligationCoverage.detail,
  });
  for (const gap of obligationCoverage.gaps) {
    gaps.push({ ...gap, gap_id: stableId("GAP", derivedInputs.run_id, "obligation", gap.description.slice(0, 30)), dimension_ref: oblDimId });
  }

  const placeholderResult = evaluatePlaceholderRisk(classifications);
  const placeholderDimId = stableId("DIM", derivedInputs.run_id, "placeholder_risk");
  dimensions.push({
    dimension_id: placeholderDimId,
    name: "Placeholder Risk",
    score: placeholderResult.score,
    threshold: 70,
    passed: placeholderResult.score >= 70,
    detail: placeholderResult.detail,
  });
  for (const gap of placeholderResult.gaps) {
    gaps.push({ ...gap, gap_id: stableId("GAP", derivedInputs.run_id, "placeholder", gap.description.slice(0, 30)), dimension_ref: placeholderDimId });
  }

  const overreachResult = evaluateOptionalOverreach(classifications, derivedInputs);
  const overreachDimId = stableId("DIM", derivedInputs.run_id, "optional_overreach");
  dimensions.push({
    dimension_id: overreachDimId,
    name: "Optional Overreach",
    score: overreachResult.score,
    threshold: 60,
    passed: overreachResult.score >= 60,
    detail: overreachResult.detail,
  });
  for (const gap of overreachResult.gaps) {
    gaps.push({ ...gap, gap_id: stableId("GAP", derivedInputs.run_id, "overreach", gap.description.slice(0, 30)), dimension_ref: overreachDimId });
  }

  const crossSchemaDimId = stableId("DIM", derivedInputs.run_id, "cross_schema_integrity");
  const crossSchemaScore = crossSchemaIssues.length === 0 ? 100 : Math.max(0, 100 - crossSchemaIssues.length * 15);
  dimensions.push({
    dimension_id: crossSchemaDimId,
    name: "Cross-Schema Integrity",
    score: crossSchemaScore,
    threshold: 70,
    passed: crossSchemaScore >= 70,
    detail: crossSchemaIssues.length === 0
      ? "All cross-schema references are valid"
      : `${crossSchemaIssues.length} cross-schema integrity issues`,
  });
  for (const issue of crossSchemaIssues) {
    gaps.push({
      ...issue,
      gap_id: stableId("GAP", derivedInputs.run_id, "xschema", issue.description.slice(0, 30)),
      dimension_ref: crossSchemaDimId,
    });
  }

  const passingDimensions = dimensions.filter(d => d.passed).length;
  const overallScore = dimensions.length > 0
    ? Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length)
    : 0;

  const criticalGaps = gaps.filter(g => g.severity === "critical").length;
  const status: BAQSufficiencyEvaluation["status"] =
    criticalGaps > 0 || overallScore < 40
      ? "insufficient"
      : overallScore < 60
        ? "marginal"
        : "sufficient";

  return {
    schema_version: "1.0.0",
    evaluation_id: evalId,
    run_id: derivedInputs.run_id,
    inventory_ref: inventory.inventory_id,
    trace_map_ref: traceMap.trace_map_id,
    overall_score: overallScore,
    status,
    dimensions,
    gaps,
    summary: {
      total_dimensions: dimensions.length,
      passing_dimensions: passingDimensions,
      total_gaps: gaps.length,
      critical_gaps: criticalGaps,
      overall_score: overallScore,
    },
    created_at: now,
    updated_at: now,
  };
}

interface DimensionResult {
  score: number;
  detail: string;
  gaps: Omit<BAQSufficiencyGap, "gap_id" | "dimension_ref">[];
}

export function classifyArtifactFamilies(
  inventory: BAQRepoInventory,
  traceMap: BAQRequirementTraceMap,
  derivedInputs: BAQDerivedBuildInputs,
): ArtifactFamilyClassification[] {
  const tracedFileIds = new Set(traceMap.traces.flatMap(t => t.file_refs));
  const requiredFileIds = new Set<string>();
  for (const trace of traceMap.traces) {
    if (trace.coverage_status !== "not_covered") {
      for (const fid of trace.file_refs) requiredFileIds.add(fid);
    }
  }

  const featureIds = new Set(derivedInputs.feature_map.map(f => f.feature_id));
  const obligationIds = new Set(derivedInputs.verification_obligations.map(o => o.obligation_id));
  const endpointIds = new Set(derivedInputs.api_surface.endpoints.map(e => e.endpoint_id));

  return inventory.files.map(file => {
    const family = classifyFamily(file, tracedFileIds, requiredFileIds);
    const isPlaceholder = detectPlaceholder(file);
    const placeholderRisk = isPlaceholder ? assessPlaceholderRisk(file, featureIds, obligationIds) : "none" as const;

    const hasTraceRef = file.trace_refs.some(r => featureIds.has(r) || obligationIds.has(r) || endpointIds.has(r));
    const hasSourceRef = file.source_refs.length > 0;
    const isInferred = !hasTraceRef && !hasSourceRef && file.role !== "config" && file.role !== "manifest" && file.role !== "entry" && file.role !== "style";

    const overreach = family === "optional" && !tracedFileIds.has(file.file_id) && !hasSourceRef;

    return {
      file_id: file.file_id,
      path: file.path,
      family,
      is_placeholder: isPlaceholder,
      placeholder_risk: placeholderRisk,
      is_inferred: isInferred,
      overreach,
    };
  });
}

function classifyFamily(
  file: BAQRepoInventory["files"][0],
  tracedFileIds: Set<string>,
  requiredFileIds: Set<string>,
): ArtifactFamily {
  if (file.role === "proof_target" || file.role === "test") return "proof";
  if (file.layer === "test") return "test";
  if (file.role === "config" || file.role === "manifest" || file.layer === "config") return "config";
  if (file.role === "docs" || file.role === "ops_doc" || file.layer === "docs") return "docs";

  if (requiredFileIds.has(file.file_id)) return "required";
  if (tracedFileIds.has(file.file_id)) return "required";

  if (file.role === "entry" || file.role === "layout" || file.role === "style") return "runtime";

  if (file.source_refs.length === 0 && file.trace_refs.length === 0) return "inferred";

  return "optional";
}

function detectPlaceholder(file: BAQRepoInventory["files"][0]): boolean {
  if (file.generation_method === "deterministic" && file.role !== "config" && file.role !== "manifest" && file.role !== "entry" && file.role !== "style") {
    return false;
  }

  if (file.description.toLowerCase().includes("placeholder") ||
      file.description.toLowerCase().includes("stub") ||
      file.description.toLowerCase().includes("todo") ||
      file.justification.toLowerCase().includes("placeholder") ||
      file.justification.toLowerCase().includes("stub")) {
    return true;
  }

  if (file.source_refs.length === 0 && file.trace_refs.length === 0 &&
      file.role !== "config" && file.role !== "manifest" && file.role !== "entry" &&
      file.role !== "style" && file.role !== "utility" && file.role !== "docs") {
    return false;
  }

  return false;
}

function assessPlaceholderRisk(
  file: BAQRepoInventory["files"][0],
  featureIds: Set<string>,
  obligationIds: Set<string>,
): "none" | "low" | "medium" | "high" {
  const refsHardGateObligations = file.trace_refs.some(r => obligationIds.has(r));
  if (refsHardGateObligations) return "high";

  const refsFeatures = file.trace_refs.some(r => featureIds.has(r));
  if (refsFeatures) return "medium";

  if (file.role === "entry" || file.role === "layout") return "medium";

  return "low";
}

function evaluateFeatureCoverage(
  derivedInputs: BAQDerivedBuildInputs,
  traceMap: BAQRequirementTraceMap,
): DimensionResult {
  const featureTraces = traceMap.traces.filter(t =>
    derivedInputs.feature_map.some(f => f.feature_id === t.requirement_id),
  );

  if (featureTraces.length === 0) {
    return {
      score: derivedInputs.feature_map.length === 0 ? 100 : 0,
      detail: derivedInputs.feature_map.length === 0
        ? "No features defined; vacuously sufficient"
        : `0/${derivedInputs.feature_map.length} features traced`,
      gaps: derivedInputs.feature_map.length === 0 ? [] : [{
        severity: "critical",
        description: "No features have traceability coverage",
        affected_refs: derivedInputs.feature_map.map(f => f.feature_id),
        recommendation: "Ensure planned files reference feature IDs in trace_refs",
      }],
    };
  }

  const covered = featureTraces.filter(t => t.coverage_status !== "not_covered").length;
  const score = Math.round((covered / derivedInputs.feature_map.length) * 100);

  const uncoveredFeatures = derivedInputs.feature_map.filter(f =>
    !featureTraces.some(t => t.requirement_id === f.feature_id && t.coverage_status !== "not_covered"),
  );

  const gaps: DimensionResult["gaps"] = [];
  if (uncoveredFeatures.length > 0) {
    gaps.push({
      severity: uncoveredFeatures.length > derivedInputs.feature_map.length / 2 ? "critical" : "warning",
      description: `${uncoveredFeatures.length} features lack file coverage`,
      affected_refs: uncoveredFeatures.map(f => f.feature_id),
      recommendation: "Add files for uncovered features or link existing files via trace_refs",
    });
  }

  return { score, detail: `${covered}/${derivedInputs.feature_map.length} features covered`, gaps };
}

function evaluateStructuralCompleteness(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
): DimensionResult {
  let checks = 0;
  let passed = 0;
  const gaps: DimensionResult["gaps"] = [];

  checks++;
  if (inventory.files.some(f => f.role === "entry")) passed++;
  else gaps.push({ severity: "critical", description: "No entry point file planned", affected_refs: [], recommendation: "Add main entry file (e.g., src/main.tsx)" });

  checks++;
  if (inventory.files.some(f => f.role === "config" || f.role === "manifest")) passed++;
  else gaps.push({ severity: "warning", description: "No config/manifest files planned", affected_refs: [], recommendation: "Add project config files (package.json, tsconfig.json)" });

  checks++;
  if (inventory.files.some(f => f.layer === "frontend")) passed++;
  else if (derivedInputs.ui_surface_map.length > 0) {
    gaps.push({ severity: "critical", description: "UI pages defined but no frontend files planned", affected_refs: derivedInputs.ui_surface_map.map(p => p.page_id), recommendation: "Add page components to the inventory" });
  } else {
    passed++;
  }

  checks++;
  if (inventory.files.some(f => f.layer === "backend") || derivedInputs.api_surface.endpoints.length === 0) passed++;
  else gaps.push({ severity: "warning", description: "API endpoints defined but no backend files planned", affected_refs: derivedInputs.api_surface.endpoints.map(e => e.endpoint_id), recommendation: "Add route handler files" });

  checks++;
  if (inventory.files.some(f => f.layer === "security") || derivedInputs.auth_model.auth_type === "unknown") passed++;
  else gaps.push({ severity: "warning", description: "Auth model defined but no security files planned", affected_refs: [], recommendation: "Add auth provider and protected route files" });

  checks++;
  if (inventory.files.some(f => f.layer === "data") || derivedInputs.storage_model.schemas.length === 0) passed++;
  else gaps.push({ severity: "warning", description: "Storage schemas defined but no data files planned", affected_refs: derivedInputs.storage_model.schemas.map(s => s.schema_id), recommendation: "Add data access layer files" });

  checks++;
  if (inventory.files.some(f => f.role === "type_definition")) passed++;
  else if (derivedInputs.domain_model.entities.length > 0) {
    gaps.push({ severity: "warning", description: "Domain entities defined but no type definition files planned", affected_refs: derivedInputs.domain_model.entities.map(e => e.entity_id), recommendation: "Add type definition files for domain entities" });
  } else {
    passed++;
  }

  checks++;
  if (inventory.files.some(f => f.role === "validation_schema") || derivedInputs.api_surface.endpoints.length === 0) passed++;
  else gaps.push({ severity: "info" as BAQSufficiencyGap["severity"], description: "No validation schema files planned for API endpoints", affected_refs: [], recommendation: "Add Zod/schema validation files for API contracts" });

  const score = checks > 0 ? Math.round((passed / checks) * 100) : 100;
  return { score, detail: `${passed}/${checks} structural checks passed`, gaps };
}

function evaluateAPICoverage(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
): DimensionResult {
  const endpoints = derivedInputs.api_surface.endpoints;
  if (endpoints.length === 0) {
    return { score: 100, detail: "No API endpoints defined; vacuously sufficient", gaps: [] };
  }

  let clientCovered = 0;
  let handlerCovered = 0;
  const uncoveredClients: string[] = [];
  const uncoveredHandlers: string[] = [];

  for (const ep of endpoints) {
    const hasClient = inventory.files.some(f =>
      f.role === "api_client" &&
      (f.source_refs.includes(ep.source_ref) || f.source_refs.includes(ep.endpoint_id) || f.trace_refs.includes(ep.endpoint_id)),
    );
    const hasHandler = inventory.files.some(f =>
      f.role === "route_handler" &&
      (f.source_refs.includes(ep.source_ref) || f.source_refs.includes(ep.endpoint_id) || f.trace_refs.includes(ep.endpoint_id)),
    );
    if (hasClient) clientCovered++;
    else uncoveredClients.push(ep.endpoint_id);
    if (hasHandler) handlerCovered++;
    else uncoveredHandlers.push(ep.endpoint_id);
  }

  const bothCovered = Math.min(clientCovered, handlerCovered);
  const score = Math.round(((clientCovered + handlerCovered) / (endpoints.length * 2)) * 100);
  const gaps: DimensionResult["gaps"] = [];

  if (uncoveredHandlers.length > 0) {
    gaps.push({
      severity: uncoveredHandlers.length > endpoints.length / 2 ? "critical" : "warning",
      description: `${uncoveredHandlers.length} endpoints lack route handler files`,
      affected_refs: uncoveredHandlers,
      recommendation: "Ensure route handler files reference endpoint IDs",
    });
  }

  if (uncoveredClients.length > 0) {
    gaps.push({
      severity: "warning",
      description: `${uncoveredClients.length} endpoints lack API client files`,
      affected_refs: uncoveredClients,
      recommendation: "Ensure API client files reference endpoint IDs",
    });
  }

  return { score, detail: `${bothCovered}/${endpoints.length} endpoints fully covered (client+handler)`, gaps };
}

function evaluateDomainCoverage(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
): DimensionResult {
  const entities = derivedInputs.domain_model.entities;
  if (entities.length === 0) {
    return { score: 100, detail: "No domain entities defined; vacuously sufficient", gaps: [] };
  }

  let covered = 0;
  const uncovered: string[] = [];

  for (const entity of entities) {
    const hasFile = inventory.files.some(f =>
      f.source_refs.includes(entity.source_ref) ||
      f.source_refs.includes(entity.entity_id) ||
      f.trace_refs.includes(entity.entity_id),
    );
    if (hasFile) covered++;
    else uncovered.push(entity.entity_id);
  }

  const score = Math.round((covered / entities.length) * 100);
  const gaps: DimensionResult["gaps"] = [];

  if (uncovered.length > 0) {
    gaps.push({
      severity: "warning",
      description: `${uncovered.length} domain entities lack type definition files`,
      affected_refs: uncovered,
      recommendation: "Add type files for uncovered entities",
    });
  }

  return { score, detail: `${covered}/${entities.length} entities covered`, gaps };
}

function evaluateObligationCoverage(
  derivedInputs: BAQDerivedBuildInputs,
  traceMap: BAQRequirementTraceMap,
): DimensionResult {
  const obligations = derivedInputs.verification_obligations;
  if (obligations.length === 0) {
    return { score: 100, detail: "No verification obligations; vacuously sufficient", gaps: [] };
  }

  const coveredObligations = new Set<string>();
  for (const trace of traceMap.traces) {
    if (trace.coverage_status !== "not_covered") {
      for (const vref of trace.verification_refs) {
        coveredObligations.add(vref);
      }
      const matchedObl = obligations.find(o => o.obligation_id === trace.requirement_id);
      if (matchedObl) coveredObligations.add(matchedObl.obligation_id);
    }
  }

  const covered = coveredObligations.size;
  const score = Math.round((covered / obligations.length) * 100);
  const gaps: DimensionResult["gaps"] = [];

  const uncoveredHardGates = obligations.filter(o => o.gating === "hard_gate" && !coveredObligations.has(o.obligation_id));
  if (uncoveredHardGates.length > 0) {
    gaps.push({
      severity: "critical",
      description: `${uncoveredHardGates.length} hard-gate obligations lack coverage`,
      affected_refs: uncoveredHardGates.map(o => o.obligation_id),
      recommendation: "Ensure hard-gate obligations are traced to implementing and proof target files",
    });
  }

  const uncoveredSoftGates = obligations.filter(o => o.gating !== "hard_gate" && !coveredObligations.has(o.obligation_id));
  if (uncoveredSoftGates.length > 0) {
    gaps.push({
      severity: "warning",
      description: `${uncoveredSoftGates.length} soft-gate obligations lack coverage`,
      affected_refs: uncoveredSoftGates.map(o => o.obligation_id),
      recommendation: "Link soft-gate obligations to implementing files",
    });
  }

  return { score, detail: `${covered}/${obligations.length} obligations covered`, gaps };
}

function evaluatePlaceholderRisk(
  classifications: ArtifactFamilyClassification[],
): DimensionResult {
  const placeholders = classifications.filter(c => c.is_placeholder);
  const total = classifications.length;

  if (placeholders.length === 0) {
    return { score: 100, detail: "No placeholder files detected", gaps: [] };
  }

  const highRisk = placeholders.filter(c => c.placeholder_risk === "high");
  const mediumRisk = placeholders.filter(c => c.placeholder_risk === "medium");
  const placeholderRatio = placeholders.length / total;

  const score = Math.max(0, Math.round((1 - placeholderRatio * 2) * 100));
  const gaps: DimensionResult["gaps"] = [];

  if (highRisk.length > 0) {
    gaps.push({
      severity: "critical",
      description: `${highRisk.length} placeholder files with high risk (linked to obligations)`,
      affected_refs: highRisk.map(c => c.file_id),
      recommendation: "Replace placeholder stubs with real implementations for obligation-linked files",
    });
  }

  if (mediumRisk.length > 0) {
    gaps.push({
      severity: "warning",
      description: `${mediumRisk.length} placeholder files with medium risk (linked to features)`,
      affected_refs: mediumRisk.map(c => c.file_id),
      recommendation: "Ensure feature-linked files have real implementations, not stubs",
    });
  }

  return { score, detail: `${placeholders.length}/${total} files are placeholders`, gaps };
}

function evaluateOptionalOverreach(
  classifications: ArtifactFamilyClassification[],
  derivedInputs: BAQDerivedBuildInputs,
): DimensionResult {
  const overreachFiles = classifications.filter(c => c.overreach);
  const inferredFiles = classifications.filter(c => c.is_inferred);
  const requiredFiles = classifications.filter(c => c.family === "required");
  const total = classifications.length;

  if (overreachFiles.length === 0 && inferredFiles.length === 0) {
    return { score: 100, detail: "No optional overreach or inferred outputs detected", gaps: [] };
  }

  const overreachRatio = total > 0 ? overreachFiles.length / total : 0;
  const inferredRatio = total > 0 ? inferredFiles.length / total : 0;

  const score = Math.max(0, Math.round((1 - overreachRatio * 3 - inferredRatio * 1.5) * 100));
  const gaps: DimensionResult["gaps"] = [];

  if (overreachFiles.length > 0) {
    gaps.push({
      severity: overreachRatio > 0.3 ? "critical" : "warning",
      description: `${overreachFiles.length} files are optional overreach (no traced requirement or source ref)`,
      affected_refs: overreachFiles.map(c => c.file_id),
      recommendation: "Remove files that don't trace to any requirement, or add explicit justification and source refs",
    });
  }

  if (inferredFiles.length > 0 && inferredFiles.length > requiredFiles.length * 0.5) {
    gaps.push({
      severity: "warning",
      description: `${inferredFiles.length} files are inferred outputs (no explicit requirement linkage)`,
      affected_refs: inferredFiles.map(c => c.file_id),
      recommendation: "Link inferred files to requirements via trace_refs or source_refs, or document justification",
    });
  }

  return {
    score,
    detail: `${overreachFiles.length} overreach, ${inferredFiles.length} inferred out of ${total} files`,
    gaps,
  };
}

export function validateCrossSchemaIntegrity(
  inventory: BAQRepoInventory,
  traceMap: BAQRequirementTraceMap,
  derivedInputs: BAQDerivedBuildInputs,
): Omit<BAQSufficiencyGap, "gap_id" | "dimension_ref">[] {
  const issues: Omit<BAQSufficiencyGap, "gap_id" | "dimension_ref">[] = [];

  const inventoryFileIds = new Set(inventory.files.map(f => f.file_id));

  for (const trace of traceMap.traces) {
    const orphanFileRefs = trace.file_refs.filter(fid => !inventoryFileIds.has(fid));
    if (orphanFileRefs.length > 0) {
      issues.push({
        severity: "critical",
        description: `Trace ${trace.trace_id} references ${orphanFileRefs.length} file(s) not in inventory`,
        affected_refs: orphanFileRefs,
        recommendation: "Ensure all trace file_refs reference valid inventory file IDs",
      });
    }
  }

  const inventoryModuleIds = new Set(inventory.modules.map(m => m.module_id));
  for (const trace of traceMap.traces) {
    const orphanModuleRefs = trace.module_refs.filter(mid => !inventoryModuleIds.has(mid));
    if (orphanModuleRefs.length > 0) {
      issues.push({
        severity: "warning",
        description: `Trace ${trace.trace_id} references ${orphanModuleRefs.length} module(s) not in inventory`,
        affected_refs: orphanModuleRefs,
        recommendation: "Ensure all trace module_refs reference valid inventory module IDs",
      });
    }
  }

  const covSummary = traceMap.summary;
  const actualFullyCovered = traceMap.traces.filter(t => t.coverage_status === "fully_covered").length;
  const actualPartiallyCovered = traceMap.traces.filter(t => t.coverage_status === "partially_covered").length;
  const actualNotCovered = traceMap.traces.filter(t => t.coverage_status === "not_covered").length;

  if (covSummary.fully_covered !== actualFullyCovered ||
      covSummary.partially_covered !== actualPartiallyCovered ||
      covSummary.not_covered !== actualNotCovered) {
    issues.push({
      severity: "warning",
      description: "Trace map summary counts don't match actual trace coverage statuses",
      affected_refs: [],
      recommendation: "Recompute trace map summary counts from actual trace data",
    });
  }

  if (covSummary.total_requirements !== traceMap.traces.length) {
    issues.push({
      severity: "warning",
      description: `Trace map total_requirements (${covSummary.total_requirements}) doesn't match trace count (${traceMap.traces.length})`,
      affected_refs: [],
      recommendation: "Ensure total_requirements equals the number of trace entries",
    });
  }

  const inventoryFileSummary = inventory.summary;
  if (inventoryFileSummary.total_files !== inventory.files.length) {
    issues.push({
      severity: "warning",
      description: `Inventory total_files (${inventoryFileSummary.total_files}) doesn't match actual file count (${inventory.files.length})`,
      affected_refs: [],
      recommendation: "Ensure inventory summary total_files equals actual file count",
    });
  }

  if (inventoryFileSummary.total_modules !== inventory.modules.length) {
    issues.push({
      severity: "warning",
      description: `Inventory total_modules (${inventoryFileSummary.total_modules}) doesn't match actual module count (${inventory.modules.length})`,
      affected_refs: [],
      recommendation: "Ensure inventory summary total_modules equals actual module count",
    });
  }

  return issues;
}

export function checkBAQSufficiencyGate(evaluation: BAQSufficiencyEvaluation): {
  passed: boolean;
  blockers: string[];
  gate_id: "G-BQ-03";
} {
  const blockers: string[] = [];

  if (evaluation.status === "insufficient") {
    blockers.push(`Sufficiency evaluation is insufficient (score: ${evaluation.overall_score}%)`);
  }

  if (evaluation.summary.critical_gaps > 0) {
    const criticalDescriptions = evaluation.gaps
      .filter(g => g.severity === "critical")
      .map(g => g.description);
    blockers.push(`${evaluation.summary.critical_gaps} critical sufficiency gaps: ${criticalDescriptions.join("; ")}`);
  }

  return {
    passed: blockers.length === 0,
    blockers,
    gate_id: "G-BQ-03",
  };
}
