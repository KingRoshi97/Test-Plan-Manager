import type {
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQSufficiencyEvaluation,
  BAQSufficiencyDimension,
  BAQSufficiencyGap,
} from "./types.js";

export function evaluateSufficiency(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
  traceMap: BAQRequirementTraceMap,
): BAQSufficiencyEvaluation {
  const now = new Date().toISOString();
  const evalId = `BAQS-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;

  const dimensions: BAQSufficiencyDimension[] = [];
  const gaps: BAQSufficiencyGap[] = [];
  let dimCounter = 1;
  let gapCounter = 1;

  const featureCoverage = evaluateFeatureCoverage(derivedInputs, traceMap);
  dimensions.push({
    dimension_id: `DIM-${String(dimCounter++).padStart(3, "0")}`,
    name: "Feature Coverage",
    score: featureCoverage.score,
    threshold: 60,
    passed: featureCoverage.score >= 60,
    detail: featureCoverage.detail,
  });
  for (const gap of featureCoverage.gaps) {
    gaps.push({ ...gap, gap_id: `GAP-${String(gapCounter++).padStart(3, "0")}`, dimension_ref: `DIM-${String(dimCounter - 1).padStart(3, "0")}` });
  }

  const structuralCompleteness = evaluateStructuralCompleteness(derivedInputs, inventory);
  dimensions.push({
    dimension_id: `DIM-${String(dimCounter++).padStart(3, "0")}`,
    name: "Structural Completeness",
    score: structuralCompleteness.score,
    threshold: 70,
    passed: structuralCompleteness.score >= 70,
    detail: structuralCompleteness.detail,
  });
  for (const gap of structuralCompleteness.gaps) {
    gaps.push({ ...gap, gap_id: `GAP-${String(gapCounter++).padStart(3, "0")}`, dimension_ref: `DIM-${String(dimCounter - 1).padStart(3, "0")}` });
  }

  const apiCoverage = evaluateAPICoverage(derivedInputs, inventory);
  dimensions.push({
    dimension_id: `DIM-${String(dimCounter++).padStart(3, "0")}`,
    name: "API Coverage",
    score: apiCoverage.score,
    threshold: 50,
    passed: apiCoverage.score >= 50,
    detail: apiCoverage.detail,
  });
  for (const gap of apiCoverage.gaps) {
    gaps.push({ ...gap, gap_id: `GAP-${String(gapCounter++).padStart(3, "0")}`, dimension_ref: `DIM-${String(dimCounter - 1).padStart(3, "0")}` });
  }

  const domainCoverage = evaluateDomainCoverage(derivedInputs, inventory);
  dimensions.push({
    dimension_id: `DIM-${String(dimCounter++).padStart(3, "0")}`,
    name: "Domain Model Coverage",
    score: domainCoverage.score,
    threshold: 50,
    passed: domainCoverage.score >= 50,
    detail: domainCoverage.detail,
  });
  for (const gap of domainCoverage.gaps) {
    gaps.push({ ...gap, gap_id: `GAP-${String(gapCounter++).padStart(3, "0")}`, dimension_ref: `DIM-${String(dimCounter - 1).padStart(3, "0")}` });
  }

  const obligationCoverage = evaluateObligationCoverage(derivedInputs, traceMap);
  dimensions.push({
    dimension_id: `DIM-${String(dimCounter++).padStart(3, "0")}`,
    name: "Obligation Coverage",
    score: obligationCoverage.score,
    threshold: 40,
    passed: obligationCoverage.score >= 40,
    detail: obligationCoverage.detail,
  });
  for (const gap of obligationCoverage.gaps) {
    gaps.push({ ...gap, gap_id: `GAP-${String(gapCounter++).padStart(3, "0")}`, dimension_ref: `DIM-${String(dimCounter - 1).padStart(3, "0")}` });
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

  return {
    score,
    detail: `${covered}/${derivedInputs.feature_map.length} features covered`,
    gaps,
  };
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
  if (inventory.files.some(f => f.role === "config")) passed++;
  else gaps.push({ severity: "warning", description: "No config files planned", affected_refs: [], recommendation: "Add project config files (package.json, tsconfig.json)" });

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

  const score = checks > 0 ? Math.round((passed / checks) * 100) : 100;
  return {
    score,
    detail: `${passed}/${checks} structural checks passed`,
    gaps,
  };
}

function evaluateAPICoverage(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
): DimensionResult {
  const endpoints = derivedInputs.api_surface.endpoints;
  if (endpoints.length === 0) {
    return { score: 100, detail: "No API endpoints defined; vacuously sufficient", gaps: [] };
  }

  let covered = 0;
  const uncovered: string[] = [];

  for (const ep of endpoints) {
    const hasFile = inventory.files.some(f =>
      f.source_refs.includes(ep.source_ref) ||
      f.source_refs.includes(ep.endpoint_id),
    );
    if (hasFile) covered++;
    else uncovered.push(ep.endpoint_id);
  }

  const score = Math.round((covered / endpoints.length) * 100);
  const gaps: DimensionResult["gaps"] = [];

  if (uncovered.length > 0) {
    gaps.push({
      severity: uncovered.length > endpoints.length / 2 ? "critical" : "warning",
      description: `${uncovered.length} API endpoints lack implementing files`,
      affected_refs: uncovered,
      recommendation: "Ensure route handlers reference endpoint source_refs",
    });
  }

  return { score, detail: `${covered}/${endpoints.length} endpoints covered`, gaps };
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
      f.source_refs.includes(entity.entity_id),
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

  const obligationTraces = traceMap.traces.filter(t =>
    obligations.some(o => o.obligation_id === t.requirement_id) ||
    obligations.some(o => t.verification_refs.includes(o.obligation_id)),
  );

  const coveredObligations = new Set<string>();
  for (const trace of obligationTraces) {
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

  const uncoveredHardGates = obligations.filter(
    o => o.gating === "hard_gate" && !coveredObligations.has(o.obligation_id),
  );

  if (uncoveredHardGates.length > 0) {
    gaps.push({
      severity: "critical",
      description: `${uncoveredHardGates.length} hard-gate obligations lack coverage`,
      affected_refs: uncoveredHardGates.map(o => o.obligation_id),
      recommendation: "Ensure hard-gate obligations are traced to implementing files",
    });
  }

  const uncoveredSoftGates = obligations.filter(
    o => o.gating !== "hard_gate" && !coveredObligations.has(o.obligation_id),
  );

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
