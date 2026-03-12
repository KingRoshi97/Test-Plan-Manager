import { createHash } from "node:crypto";
import type {
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQTraceEntry,
  BAQWorkUnit,
  BAQAcceptanceItem,
  BAQUnmappedRequirement,
} from "./types.js";

function stableId(prefix: string, ...parts: string[]): string {
  const hash = createHash("sha256").update(parts.join(":")).digest("hex").slice(0, 8);
  return `${prefix}-${hash}`;
}

export function buildRequirementTraceMap(
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
): BAQRequirementTraceMap {
  const now = new Date().toISOString();
  const traceMapId = stableId("BAQT", derivedInputs.run_id, inventory.inventory_id);

  const traces: BAQTraceEntry[] = [];
  const unmapped: BAQUnmappedRequirement[] = [];
  const fileIndex = new Map<string, typeof inventory.files[0]>();
  for (const f of inventory.files) fileIndex.set(f.file_id, f);

  const proofTargets = inventory.files.filter(f => f.role === "proof_target" || f.role === "test");
  const proofTargetByTraceRef = new Map<string, string[]>();
  for (const pt of proofTargets) {
    for (const ref of pt.trace_refs) {
      const existing = proofTargetByTraceRef.get(ref) ?? [];
      existing.push(pt.file_id);
      proofTargetByTraceRef.set(ref, existing);
    }
  }

  for (const feature of derivedInputs.feature_map) {
    const fileRefs = inventory.files
      .filter(f =>
        f.trace_refs.includes(feature.feature_id) ||
        f.source_refs.includes(feature.feature_id),
      )
      .map(f => f.file_id);

    const moduleRefs = resolveModuleRefs(fileRefs, inventory);

    const verificationRefs = derivedInputs.verification_obligations
      .filter(v => v.feature_ref === feature.feature_id)
      .map(v => v.obligation_id);

    const featureProofTargets = [...(proofTargetByTraceRef.get(feature.feature_id) ?? [])];
    for (const vref of verificationRefs) {
      const oblProofs = proofTargetByTraceRef.get(vref) ?? [];
      for (const p of oblProofs) {
        if (!featureProofTargets.includes(p)) featureProofTargets.push(p);
      }
    }

    const implementingFiles = fileRefs.filter(id => {
      const f = fileIndex.get(id);
      return f && f.role !== "proof_target" && f.role !== "test";
    });

    const workUnits = buildWorkUnits(feature, implementingFiles, featureProofTargets, derivedInputs, inventory);

    const coverageStatus = determineCoverage(implementingFiles.length, feature.deliverables.length, featureProofTargets.length);

    traces.push({
      trace_id: stableId("TRACE", derivedInputs.run_id, feature.feature_id),
      requirement_id: feature.feature_id,
      requirement_description: `Feature: ${feature.name} — ${feature.description}`,
      feature_refs: [feature.feature_id],
      file_refs: [...new Set([...fileRefs, ...featureProofTargets])],
      module_refs: moduleRefs,
      verification_refs: verificationRefs,
      work_units: workUnits,
      coverage_status: coverageStatus,
    });

    if (coverageStatus === "not_covered") {
      const isMust = feature.priority === "must" || feature.priority === "critical";
      unmapped.push({
        requirement_id: feature.feature_id,
        requirement_type: "feature",
        description: `Feature "${feature.name}" has no implementing files`,
        severity: isMust ? "critical" : "warning",
        reason: "No inventory files trace to this feature",
      });
    }
  }

  for (const obligation of derivedInputs.verification_obligations) {
    const alreadyFullyTraced = traces.some(t =>
      t.verification_refs.includes(obligation.obligation_id) && t.coverage_status === "fully_covered",
    );
    if (alreadyFullyTraced) continue;

    const featureRef = obligation.feature_ref;
    const fileRefs = featureRef
      ? inventory.files
          .filter(f =>
            f.trace_refs.includes(featureRef) ||
            f.source_refs.includes(featureRef) ||
            f.trace_refs.includes(obligation.obligation_id) ||
            f.source_refs.includes(obligation.obligation_id),
          )
          .map(f => f.file_id)
      : inventory.files
          .filter(f =>
            f.trace_refs.includes(obligation.obligation_id) ||
            f.source_refs.includes(obligation.obligation_id),
          )
          .map(f => f.file_id);

    const moduleRefs = resolveModuleRefs(fileRefs, inventory);

    const oblProofTargets = proofTargetByTraceRef.get(obligation.obligation_id) ?? [];
    const allFileRefs = [...new Set([...fileRefs, ...oblProofTargets])];

    const implementingFiles = fileRefs.filter(id => {
      const f = fileIndex.get(id);
      return f && f.role !== "proof_target" && f.role !== "test";
    });

    const coverageStatus = implementingFiles.length > 0
      ? oblProofTargets.length > 0 ? "fully_covered" as const : "partially_covered" as const
      : "not_covered" as const;

    const oblWorkUnit: BAQWorkUnit = {
      work_unit_id: stableId("WU", derivedInputs.run_id, obligation.obligation_id),
      description: `Implement and verify: ${obligation.description}`,
      feature_ref: featureRef || "",
      file_targets: implementingFiles,
      acceptance_items: [{
        acceptance_id: stableId("ACC", derivedInputs.run_id, obligation.obligation_id, "verify"),
        description: `Verify obligation: ${obligation.description}`,
        work_unit_ref: stableId("WU", derivedInputs.run_id, obligation.obligation_id),
        file_targets: implementingFiles,
        proof_targets: oblProofTargets,
        fulfilled: oblProofTargets.length > 0 && implementingFiles.length > 0,
      }],
    };

    traces.push({
      trace_id: stableId("TRACE", derivedInputs.run_id, obligation.obligation_id),
      requirement_id: obligation.obligation_id,
      requirement_description: `Obligation: ${obligation.description}`,
      feature_refs: featureRef ? [featureRef] : [],
      file_refs: allFileRefs,
      module_refs: moduleRefs,
      verification_refs: [obligation.obligation_id],
      work_units: [oblWorkUnit],
      coverage_status: coverageStatus,
    });

    if (coverageStatus === "not_covered") {
      const isHardGate = obligation.gating === "hard_gate";
      unmapped.push({
        requirement_id: obligation.obligation_id,
        requirement_type: "obligation",
        description: `Obligation "${obligation.description}" has no implementing or proof files`,
        severity: isHardGate ? "critical" : "warning",
        reason: isHardGate ? "Hard-gate obligation requires proof target" : "Soft-gate obligation lacks file coverage",
      });
    }
  }

  for (const entity of derivedInputs.domain_model.entities) {
    const fileRefs = inventory.files
      .filter(f =>
        f.source_refs.includes(entity.source_ref) ||
        f.source_refs.includes(entity.entity_id) ||
        f.trace_refs.includes(entity.entity_id),
      )
      .map(f => f.file_id);

    const moduleRefs = resolveModuleRefs(fileRefs, inventory);
    const coverageStatus = fileRefs.length > 0 ? "fully_covered" as const : "not_covered" as const;

    const entityWorkUnit: BAQWorkUnit = {
      work_unit_id: stableId("WU", derivedInputs.run_id, entity.entity_id),
      description: `Define type for entity: ${entity.name}`,
      feature_ref: "",
      file_targets: fileRefs,
      acceptance_items: [{
        acceptance_id: stableId("ACC", derivedInputs.run_id, entity.entity_id, "type"),
        description: `Type definition file exists for ${entity.name}`,
        work_unit_ref: stableId("WU", derivedInputs.run_id, entity.entity_id),
        file_targets: fileRefs,
        proof_targets: [],
        fulfilled: fileRefs.length > 0,
      }],
    };

    traces.push({
      trace_id: stableId("TRACE", derivedInputs.run_id, entity.entity_id),
      requirement_id: entity.entity_id,
      requirement_description: `Domain entity: ${entity.name}`,
      feature_refs: [],
      file_refs: fileRefs,
      module_refs: moduleRefs,
      verification_refs: [],
      work_units: [entityWorkUnit],
      coverage_status: coverageStatus,
    });

    if (coverageStatus === "not_covered") {
      unmapped.push({
        requirement_id: entity.entity_id,
        requirement_type: "entity",
        description: `Entity "${entity.name}" has no type definition file`,
        severity: "warning",
        reason: "Domain entity not represented in file inventory",
      });
    }
  }

  for (const ep of derivedInputs.api_surface.endpoints) {
    const fileRefs = inventory.files
      .filter(f =>
        f.source_refs.includes(ep.source_ref) ||
        f.source_refs.includes(ep.endpoint_id) ||
        f.trace_refs.includes(ep.endpoint_id),
      )
      .map(f => f.file_id);

    const moduleRefs = resolveModuleRefs(fileRefs, inventory);

    const hasClient = fileRefs.some(id => { const f = fileIndex.get(id); return f && f.role === "api_client"; });
    const hasHandler = fileRefs.some(id => { const f = fileIndex.get(id); return f && f.role === "route_handler"; });

    const coverageStatus = hasClient && hasHandler
      ? "fully_covered" as const
      : fileRefs.length > 0
        ? "partially_covered" as const
        : "not_covered" as const;

    const clientFiles = fileRefs.filter(id => { const f = fileIndex.get(id); return f && f.role === "api_client"; });
    const handlerFiles = fileRefs.filter(id => { const f = fileIndex.get(id); return f && f.role === "route_handler"; });
    const testFiles = fileRefs.filter(id => { const f = fileIndex.get(id); return f && (f.role === "test" || f.role === "proof_target"); });

    const epWorkUnit: BAQWorkUnit = {
      work_unit_id: stableId("WU", derivedInputs.run_id, ep.endpoint_id),
      description: `Implement ${ep.method} ${ep.path}`,
      feature_ref: "",
      file_targets: [...clientFiles, ...handlerFiles],
      acceptance_items: [
        {
          acceptance_id: stableId("ACC", derivedInputs.run_id, ep.endpoint_id, "handler"),
          description: `Route handler exists for ${ep.method} ${ep.path}`,
          work_unit_ref: stableId("WU", derivedInputs.run_id, ep.endpoint_id),
          file_targets: handlerFiles,
          proof_targets: testFiles,
          fulfilled: hasHandler,
        },
        {
          acceptance_id: stableId("ACC", derivedInputs.run_id, ep.endpoint_id, "client"),
          description: `API client exists for ${ep.method} ${ep.path}`,
          work_unit_ref: stableId("WU", derivedInputs.run_id, ep.endpoint_id),
          file_targets: clientFiles,
          proof_targets: [],
          fulfilled: hasClient,
        },
      ],
    };

    traces.push({
      trace_id: stableId("TRACE", derivedInputs.run_id, ep.endpoint_id),
      requirement_id: ep.endpoint_id,
      requirement_description: `API endpoint: ${ep.method} ${ep.path}`,
      feature_refs: [],
      file_refs: fileRefs,
      module_refs: moduleRefs,
      verification_refs: [],
      work_units: [epWorkUnit],
      coverage_status: coverageStatus,
    });

    if (coverageStatus === "not_covered") {
      unmapped.push({
        requirement_id: ep.endpoint_id,
        requirement_type: "endpoint",
        description: `Endpoint ${ep.method} ${ep.path} has no implementing files`,
        severity: "warning",
        reason: "API endpoint not covered by route handler or client",
      });
    }
  }

  const fullyCovered = traces.filter(t => t.coverage_status === "fully_covered").length;
  const partiallyCovered = traces.filter(t => t.coverage_status === "partially_covered").length;
  const notCovered = traces.filter(t => t.coverage_status === "not_covered").length;
  const total = traces.length;
  const coveragePercent = total > 0
    ? Math.round(((fullyCovered + partiallyCovered * 0.5) / total) * 100)
    : 0;

  const unmappedCritical = unmapped.filter(u => u.severity === "critical").length;

  return {
    schema_version: "1.0.0",
    trace_map_id: traceMapId,
    run_id: derivedInputs.run_id,
    inventory_ref: inventory.inventory_id,
    traces,
    unmapped_requirements: unmapped,
    summary: {
      total_requirements: total,
      fully_covered: fullyCovered,
      partially_covered: partiallyCovered,
      not_covered: notCovered,
      coverage_percent: coveragePercent,
      unmapped_critical: unmappedCritical,
      unmapped_total: unmapped.length,
    },
    created_at: now,
    updated_at: now,
  };
}

function buildWorkUnits(
  feature: BAQDerivedBuildInputs["feature_map"][0],
  implementingFileIds: string[],
  proofTargetIds: string[],
  derivedInputs: BAQDerivedBuildInputs,
  inventory: BAQRepoInventory,
): BAQWorkUnit[] {
  const workUnits: BAQWorkUnit[] = [];

  for (let i = 0; i < feature.deliverables.length; i++) {
    const deliverable = feature.deliverables[i];
    const wuId = stableId("WU", derivedInputs.run_id, feature.feature_id, String(i));

    const relatedFiles = implementingFileIds.filter(fid => {
      const f = inventory.files.find(file => file.file_id === fid);
      return f && (
        f.description.toLowerCase().includes(deliverable.toLowerCase()) ||
        f.trace_refs.includes(feature.feature_id)
      );
    });
    const deliverableFileTargets = relatedFiles.length > 0 ? relatedFiles : implementingFileIds;

    const acceptanceItem: BAQAcceptanceItem = {
      acceptance_id: stableId("ACC", derivedInputs.run_id, feature.feature_id, String(i)),
      description: `Deliverable: ${deliverable}`,
      work_unit_ref: wuId,
      file_targets: deliverableFileTargets,
      proof_targets: proofTargetIds,
      fulfilled: deliverableFileTargets.length > 0,
    };

    workUnits.push({
      work_unit_id: wuId,
      description: `Implement: ${deliverable}`,
      feature_ref: feature.feature_id,
      file_targets: deliverableFileTargets,
      acceptance_items: [acceptanceItem],
    });
  }

  if (workUnits.length === 0 && implementingFileIds.length > 0) {
    const wuId = stableId("WU", derivedInputs.run_id, feature.feature_id, "default");
    workUnits.push({
      work_unit_id: wuId,
      description: `Implement feature: ${feature.name}`,
      feature_ref: feature.feature_id,
      file_targets: implementingFileIds,
      acceptance_items: [{
        acceptance_id: stableId("ACC", derivedInputs.run_id, feature.feature_id, "default"),
        description: `Feature ${feature.name} implemented`,
        work_unit_ref: wuId,
        file_targets: implementingFileIds,
        proof_targets: proofTargetIds,
        fulfilled: implementingFileIds.length > 0,
      }],
    });
  }

  return workUnits;
}

function resolveModuleRefs(fileIds: string[], inventory: BAQRepoInventory): string[] {
  return [...new Set(
    inventory.files
      .filter(f => fileIds.includes(f.file_id))
      .map(f => f.module_ref)
      .filter(Boolean),
  )];
}

function determineCoverage(
  implementingFileCount: number,
  deliverableCount: number,
  proofTargetCount: number,
): BAQTraceEntry["coverage_status"] {
  if (implementingFileCount === 0) return "not_covered";
  if (deliverableCount <= 1 && implementingFileCount >= 1 && proofTargetCount > 0) return "fully_covered";
  if (implementingFileCount >= deliverableCount && proofTargetCount > 0) return "fully_covered";
  if (implementingFileCount >= deliverableCount) return "partially_covered";
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

  if (traceMap.summary.unmapped_critical > 0) {
    const criticalUnmapped = traceMap.unmapped_requirements.filter(u => u.severity === "critical");
    const criticalDescs = criticalUnmapped.map(u => `${u.requirement_id}: ${u.reason}`).join("; ");
    blockers.push(
      `${traceMap.summary.unmapped_critical} critical unmapped requirements: ${criticalDescs}`,
    );
  }

  const unfulfilledHardGateAcceptance = traceMap.traces.flatMap(t =>
    t.work_units.flatMap(wu =>
      wu.acceptance_items.filter(ai => !ai.fulfilled && ai.proof_targets.length === 0)
    )
  ).filter(ai => {
    const trace = traceMap.traces.find(t =>
      t.work_units.some(wu => wu.acceptance_items.includes(ai))
    );
    return trace && trace.verification_refs.length > 0;
  });

  if (unfulfilledHardGateAcceptance.length > 0) {
    blockers.push(
      `${unfulfilledHardGateAcceptance.length} acceptance items for verification-linked traces have no file targets or proof targets`,
    );
  }

  const featureTracesWithNoFiles = traceMap.traces.filter(t =>
    t.feature_refs.length > 0 && t.file_refs.length === 0,
  );
  const allFeatureTraces = traceMap.traces.filter(t => t.feature_refs.length > 0);
  if (featureTracesWithNoFiles.length > 0 && featureTracesWithNoFiles.length === allFeatureTraces.length) {
    blockers.push(`All feature traces lack file references — no features are covered`);
  }

  return {
    passed: blockers.length === 0,
    blockers,
    gate_id: "G-BQ-03",
  };
}

export function getUnmappedRequirements(
  derivedInputs: BAQDerivedBuildInputs,
  traceMap: BAQRequirementTraceMap,
): BAQUnmappedRequirement[] {
  const additional: BAQUnmappedRequirement[] = [];
  const tracedIds = new Set(traceMap.traces.map(t => t.requirement_id));

  for (const feature of derivedInputs.feature_map) {
    if (!tracedIds.has(feature.feature_id)) {
      const isMust = feature.priority === "must" || feature.priority === "critical";
      additional.push({
        requirement_id: feature.feature_id,
        requirement_type: "feature",
        description: `Feature "${feature.name}" not in trace map`,
        severity: isMust ? "critical" : "warning",
        reason: "Feature was not traced at all",
      });
    }
  }

  for (const obligation of derivedInputs.verification_obligations) {
    const traced = traceMap.traces.some(t =>
      t.requirement_id === obligation.obligation_id || t.verification_refs.includes(obligation.obligation_id),
    );
    if (!traced) {
      const isHardGate = obligation.gating === "hard_gate";
      additional.push({
        requirement_id: obligation.obligation_id,
        requirement_type: "obligation",
        description: `Obligation "${obligation.description}" not in trace map`,
        severity: isHardGate ? "critical" : "info",
        reason: isHardGate ? "Hard-gate obligation is completely untraced" : "Obligation not referenced by any trace",
      });
    }
  }

  return [...traceMap.unmapped_requirements, ...additional];
}
