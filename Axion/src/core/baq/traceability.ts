import type {
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQTraceEntry,
} from "./types.js";

export function buildRequirementTraceMap(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
): BAQRequirementTraceMap {
  const now = new Date().toISOString();
  const traceMapId = `BAQT-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;

  const traces: BAQTraceEntry[] = [];
  let counter = 1;

  for (const feature of derivedInputs.feature_map) {
    const fileRefs = inventory.files
      .filter(f =>
        f.trace_refs.includes(feature.feature_id) ||
        f.source_refs.includes(feature.feature_id),
      )
      .map(f => f.file_id);

    const moduleRefs = [...new Set(
      inventory.files
        .filter(f => fileRefs.includes(f.file_id))
        .map(f => f.module_ref)
        .filter(Boolean),
    )];

    const verificationRefs = derivedInputs.verification_obligations
      .filter(v => v.feature_ref === feature.feature_id)
      .map(v => v.obligation_id);

    const coverageStatus = determineCoverage(fileRefs.length, feature.deliverables.length);

    traces.push({
      trace_id: `TRACE-${String(counter++).padStart(4, "0")}`,
      requirement_id: feature.feature_id,
      requirement_description: `Feature: ${feature.name} — ${feature.description}`,
      feature_refs: [feature.feature_id],
      file_refs: fileRefs,
      module_refs: moduleRefs,
      verification_refs: verificationRefs,
      coverage_status: coverageStatus,
    });
  }

  for (const obligation of derivedInputs.verification_obligations) {
    const alreadyTraced = traces.some(t =>
      t.verification_refs.includes(obligation.obligation_id),
    );
    if (alreadyTraced) continue;

    const featureRef = obligation.feature_ref;
    const fileRefs = featureRef
      ? inventory.files
          .filter(f =>
            f.trace_refs.includes(featureRef) ||
            f.source_refs.includes(featureRef),
          )
          .map(f => f.file_id)
      : [];

    const moduleRefs = [...new Set(
      inventory.files
        .filter(f => fileRefs.includes(f.file_id))
        .map(f => f.module_ref)
        .filter(Boolean),
    )];

    const coverageStatus = fileRefs.length > 0 ? "partially_covered" as const : "not_covered" as const;

    traces.push({
      trace_id: `TRACE-${String(counter++).padStart(4, "0")}`,
      requirement_id: obligation.obligation_id,
      requirement_description: `Obligation: ${obligation.description}`,
      feature_refs: featureRef ? [featureRef] : [],
      file_refs: fileRefs,
      module_refs: moduleRefs,
      verification_refs: [obligation.obligation_id],
      coverage_status: coverageStatus,
    });
  }

  for (const entity of derivedInputs.domain_model.entities) {
    const fileRefs = inventory.files
      .filter(f => f.source_refs.includes(entity.source_ref))
      .map(f => f.file_id);

    const moduleRefs = [...new Set(
      inventory.files
        .filter(f => fileRefs.includes(f.file_id))
        .map(f => f.module_ref)
        .filter(Boolean),
    )];

    const coverageStatus = fileRefs.length > 0 ? "fully_covered" as const : "not_covered" as const;

    traces.push({
      trace_id: `TRACE-${String(counter++).padStart(4, "0")}`,
      requirement_id: entity.entity_id,
      requirement_description: `Domain entity: ${entity.name}`,
      feature_refs: [],
      file_refs: fileRefs,
      module_refs: moduleRefs,
      verification_refs: [],
      coverage_status: coverageStatus,
    });
  }

  for (const ep of derivedInputs.api_surface.endpoints) {
    const fileRefs = inventory.files
      .filter(f => f.source_refs.includes(ep.source_ref))
      .map(f => f.file_id);

    const moduleRefs = [...new Set(
      inventory.files
        .filter(f => fileRefs.includes(f.file_id))
        .map(f => f.module_ref)
        .filter(Boolean),
    )];

    const coverageStatus = fileRefs.length >= 2
      ? "fully_covered" as const
      : fileRefs.length === 1
        ? "partially_covered" as const
        : "not_covered" as const;

    traces.push({
      trace_id: `TRACE-${String(counter++).padStart(4, "0")}`,
      requirement_id: ep.endpoint_id,
      requirement_description: `API endpoint: ${ep.method} ${ep.path}`,
      feature_refs: [],
      file_refs: fileRefs,
      module_refs: moduleRefs,
      verification_refs: [],
      coverage_status: coverageStatus,
    });
  }

  const fullyCovered = traces.filter(t => t.coverage_status === "fully_covered").length;
  const partiallyCovered = traces.filter(t => t.coverage_status === "partially_covered").length;
  const notCovered = traces.filter(t => t.coverage_status === "not_covered").length;
  const total = traces.length;
  const coveragePercent = total > 0
    ? Math.round(((fullyCovered + partiallyCovered * 0.5) / total) * 100)
    : 0;

  return {
    schema_version: "1.0.0",
    trace_map_id: traceMapId,
    run_id: derivedInputs.run_id,
    inventory_ref: inventory.inventory_id,
    traces,
    summary: {
      total_requirements: total,
      fully_covered: fullyCovered,
      partially_covered: partiallyCovered,
      not_covered: notCovered,
      coverage_percent: coveragePercent,
    },
    created_at: now,
    updated_at: now,
  };
}

function determineCoverage(
  fileCount: number,
  deliverableCount: number,
): BAQTraceEntry["coverage_status"] {
  if (fileCount === 0) return "not_covered";
  if (deliverableCount <= 1 && fileCount >= 1) return "fully_covered";
  if (fileCount >= deliverableCount) return "fully_covered";
  return "partially_covered";
}

export function checkBAQTraceabilityGate(traceMap: BAQRequirementTraceMap): {
  passed: boolean;
  blockers: string[];
  gate_id: "G-BQ-03";
} {
  const blockers: string[] = [];

  if (traceMap.traces.length === 0) {
    blockers.push("Trace map contains no requirement traces");
  }

  if (traceMap.summary.coverage_percent < 30) {
    blockers.push(
      `Traceability coverage too low: ${traceMap.summary.coverage_percent}% (minimum 30%)`,
    );
  }

  const notCoveredRatio = traceMap.summary.total_requirements > 0
    ? traceMap.summary.not_covered / traceMap.summary.total_requirements
    : 0;
  if (notCoveredRatio > 0.5) {
    blockers.push(
      `Too many uncovered requirements: ${traceMap.summary.not_covered}/${traceMap.summary.total_requirements} (${Math.round(notCoveredRatio * 100)}%)`,
    );
  }

  return {
    passed: blockers.length === 0,
    blockers,
    gate_id: "G-BQ-03",
  };
}
