import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRepoFileEntry,
  BAQRequirementTraceMap,
  BAQBuildQualityReport,
  BAQGenerationFailureReport,
  BAQSufficiencyEvaluation,
  BAQSufficiencyDimension,
  BAQSufficiencyGap,
  BAQGateResult,
  BAQFailureEntry,
  BAQSeverity,
  GenerationFailureClass,
} from "../../../Axion/src/core/baq/types";

export interface BAQArtifacts {
  extraction: BAQKitExtraction | null;
  derivedInputs: BAQDerivedBuildInputs | null;
  inventory: BAQRepoInventory | null;
  traceMap: BAQRequirementTraceMap | null;
  qualityReport: BAQBuildQualityReport | null;
  failureReport: BAQGenerationFailureReport | null;
  sufficiency: BAQSufficiencyEvaluation | null;
  packagingDecision: PackagingDecisionData | null;
}

export interface PackagingDecisionData {
  allowed: boolean;
  block_reasons: string[];
  missing_artifacts: string[];
  gate_failures: string[];
  inventory_mismatches: Array<{ file_path: string; reason: string }>;
  manifest_mismatches: Array<{ file_path: string; reason: string }>;
  timestamp: string;
}

export type DataAvailability = "full" | "partial" | "empty" | "error";

export function getDataAvailability(artifacts: BAQArtifacts): DataAvailability {
  const coreKeys: (keyof BAQArtifacts)[] = ["extraction", "derivedInputs", "inventory", "traceMap", "qualityReport", "failureReport", "sufficiency"];
  const coreVals = coreKeys.map((k) => artifacts[k]);
  const present = coreVals.filter((v) => v !== null).length;
  if (present === 0) return "empty";
  if (present === coreVals.length) return "full";
  return "partial";
}

export interface FinalBuildDecision {
  decision: "approved" | "approved_with_warnings" | "blocked" | "failed" | "unknown";
  qualityScore: number;
  gatesPassed: number;
  gatesTotal: number;
  gatesFailed: number;
  gatesSkipped: number;
  packagingAllowed: boolean;
  reasons: string[];
  status: string;
}

export function selectFinalBuildDecision(a: BAQArtifacts): FinalBuildDecision {
  const qr = a.qualityReport;
  if (!qr) {
    return {
      decision: "unknown",
      qualityScore: 0,
      gatesPassed: 0,
      gatesTotal: 0,
      gatesFailed: 0,
      gatesSkipped: 0,
      packagingAllowed: false,
      reasons: ["No quality report available"],
      status: "unknown",
    };
  }
  return {
    decision: qr.decision,
    qualityScore: qr.overall_quality_score,
    gatesPassed: qr.gate_summary.passed,
    gatesTotal: qr.gate_summary.total_gates,
    gatesFailed: qr.gate_summary.failed,
    gatesSkipped: qr.gate_summary.skipped,
    packagingAllowed: a.packagingDecision?.allowed ?? (qr.decision === "approved" || qr.decision === "approved_with_warnings"),
    reasons: qr.decision_reasons,
    status: qr.status,
  };
}

export interface CoverageMetrics {
  extractionCoverage: number;
  requirementCoverage: number;
  acceptanceCoverage: number;
  proofCompletion: number;
  inventoryVariance: number;
  placeholderRatio: number;
}

export function selectCoverageMetrics(a: BAQArtifacts): CoverageMetrics {
  const ext = a.extraction;
  const tm = a.traceMap;
  const inv = a.inventory;
  const suf = a.sufficiency;

  const extractionCoverage = ext
    ? Math.round((ext.summary.required_sections_present / Math.max(ext.summary.required_sections_total, 1)) * 100)
    : 0;

  const requirementCoverage = tm ? Math.round(tm.summary.coverage_percent) : 0;

  const acceptanceCoverage = tm
    ? (() => {
        let fulfilled = 0;
        let total = 0;
        for (const t of tm.traces) {
          for (const wu of t.work_units) {
            for (const ai of wu.acceptance_items) {
              total++;
              if (ai.fulfilled) fulfilled++;
            }
          }
        }
        return total > 0 ? Math.round((fulfilled / total) * 100) : 0;
      })()
    : 0;

  const proofCompletion = suf ? Math.round(suf.overall_score) : 0;

  const inventoryVariance = inv
    ? (() => {
        const total = inv.summary.total_files;
        const required = inv.files.filter((f) => f.required).length;
        return total > 0 ? Math.round(((total - required) / total) * 100) : 0;
      })()
    : 0;

  const placeholderRatio = (() => {
    if (!inv) return 0;
    const aiFiles = inv.summary.files_by_generation_method?.["ai_assisted"] ?? 0;
    const total = inv.summary.total_files;
    return total > 0 ? Math.round((aiFiles / total) * 100) : 0;
  })();

  return { extractionCoverage, requirementCoverage, acceptanceCoverage, proofCompletion, inventoryVariance, placeholderRatio };
}

export interface OutputIntegrityMetrics {
  totalFiles: number;
  requiredFiles: number;
  generatedFiles: number;
  missingRequired: number;
  unplannedFiles: number;
}

export function selectOutputIntegrityMetrics(a: BAQArtifacts): OutputIntegrityMetrics {
  const inv = a.inventory;
  if (!inv) return { totalFiles: 0, requiredFiles: 0, generatedFiles: 0, missingRequired: 0, unplannedFiles: 0 };

  const requiredFiles = inv.files.filter((f) => f.required).length;
  const tracedFiles = inv.files.filter((f) => f.trace_refs && f.trace_refs.length > 0).length;
  const presentRequired = inv.files.filter((f) => f.required && f.generation_method !== "missing").length;
  let missingRequired = Math.max(0, requiredFiles - presentRequired);
  if (missingRequired === 0 && a.packagingDecision) {
    missingRequired = a.packagingDecision.inventory_mismatches.filter(
      (m) => m.reason?.toLowerCase().includes("missing") || m.reason?.toLowerCase().includes("not found")
    ).length;
  }
  const unplannedFiles = inv.summary.total_files - tracedFiles;
  return {
    totalFiles: inv.summary.total_files,
    requiredFiles,
    generatedFiles: tracedFiles,
    missingRequired,
    unplannedFiles: Math.max(0, unplannedFiles),
  };
}

export interface ExtractionCoverageRow {
  sectionId: string;
  sectionLabel: string;
  status: string;
  applicability: string;
  fileCount: number;
  byteCount: number;
  notes: string[];
}

export function selectExtractionCoverageRows(a: BAQArtifacts): ExtractionCoverageRow[] {
  if (!a.extraction) return [];
  return a.extraction.sections.map((s) => ({
    sectionId: s.section_id,
    sectionLabel: s.section_label,
    status: s.status,
    applicability: s.applicability,
    fileCount: s.file_count,
    byteCount: s.byte_count,
    notes: s.extraction_notes,
  }));
}

export interface CriticalObligationGroup {
  category: string;
  total: number;
  fulfilled: number;
  items: Array<{
    obligationId: string;
    description: string;
    severity: BAQSeverity;
    fulfilled: boolean;
    fulfillmentRef: string | null;
  }>;
}

export function selectCriticalObligationsByCategory(a: BAQArtifacts): CriticalObligationGroup[] {
  if (!a.extraction) return [];
  const groups = new Map<string, CriticalObligationGroup>();
  for (const ob of a.extraction.critical_obligations) {
    const cat = ob.obligation_type;
    if (!groups.has(cat)) {
      groups.set(cat, { category: cat, total: 0, fulfilled: 0, items: [] });
    }
    const g = groups.get(cat)!;
    g.total++;
    if (ob.fulfilled) g.fulfilled++;
    g.items.push({
      obligationId: ob.obligation_id,
      description: ob.description,
      severity: ob.severity,
      fulfilled: ob.fulfilled,
      fulfillmentRef: ob.fulfillment_ref,
    });
  }
  return Array.from(groups.values());
}

export interface SubsystemSummary {
  subsystemCount: number;
  featureCount: number;
  entityCount: number;
  endpointCount: number;
  pageCount: number;
  completeness: number;
}

export function selectSubsystemSummary(a: BAQArtifacts): SubsystemSummary {
  const d = a.derivedInputs;
  if (!d) return { subsystemCount: 0, featureCount: 0, entityCount: 0, endpointCount: 0, pageCount: 0, completeness: 0 };
  return {
    subsystemCount: d.summary.subsystem_count,
    featureCount: d.summary.feature_count,
    entityCount: d.summary.entity_count,
    endpointCount: d.summary.endpoint_count,
    pageCount: d.summary.page_count,
    completeness: d.summary.derivation_completeness,
  };
}

export interface SurfaceCounts {
  endpoints: number;
  routes: number;
  pages: number;
  entities: number;
  verificationObligations: number;
  opsObligations: number;
  assumptions: number;
  risks: number;
}

export function selectSurfaceCounts(a: BAQArtifacts): SurfaceCounts {
  const d = a.derivedInputs;
  if (!d) return { endpoints: 0, routes: 0, pages: 0, entities: 0, verificationObligations: 0, opsObligations: 0, assumptions: 0, risks: 0 };
  return {
    endpoints: d.api_surface.endpoints.length,
    routes: d.api_surface.routes.length,
    pages: d.ui_surface_map.length,
    entities: d.domain_model.entities.length,
    verificationObligations: d.verification_obligations.length,
    opsObligations: d.ops_obligations.length,
    assumptions: d.assumptions.length,
    risks: d.risks.length,
  };
}

export interface RequiredFileRow {
  fileId: string;
  path: string;
  role: string;
  layer: string;
  required: boolean;
  generationMethod: string;
  traceRefs: string[];
}

export function selectRequiredFileRows(a: BAQArtifacts): RequiredFileRow[] {
  if (!a.inventory) return [];
  return a.inventory.files
    .filter((f) => f.required)
    .map((f) => ({
      fileId: f.file_id,
      path: f.path,
      role: f.role,
      layer: f.layer,
      required: f.required,
      generationMethod: f.generation_method,
      traceRefs: f.trace_refs,
    }));
}

export interface ManifestTargetRow {
  path: string;
  role: string;
  layer: string;
  moduleRef: string;
  subsystemRef: string;
}

export function selectManifestTargetRows(a: BAQArtifacts): ManifestTargetRow[] {
  if (!a.inventory) return [];
  return a.inventory.files.map((f) => ({
    path: f.path,
    role: f.role,
    layer: f.layer,
    moduleRef: f.module_ref,
    subsystemRef: f.subsystem_ref,
  }));
}

export interface TraceCoverageSummary {
  totalRequirements: number;
  fullyCovered: number;
  partiallyCovered: number;
  notCovered: number;
  coveragePercent: number;
  unmappedCritical: number;
  unmappedTotal: number;
}

export function selectTraceCoverageSummary(a: BAQArtifacts): TraceCoverageSummary {
  if (!a.traceMap) return { totalRequirements: 0, fullyCovered: 0, partiallyCovered: 0, notCovered: 0, coveragePercent: 0, unmappedCritical: 0, unmappedTotal: 0 };
  const s = a.traceMap.summary;
  return {
    totalRequirements: s.total_requirements,
    fullyCovered: s.fully_covered,
    partiallyCovered: s.partially_covered,
    notCovered: s.not_covered,
    coveragePercent: s.coverage_percent,
    unmappedCritical: s.unmapped_critical,
    unmappedTotal: s.unmapped_total,
  };
}

export interface RequirementChain {
  traceId: string;
  requirementId: string;
  description: string;
  coverageStatus: string;
  fileRefs: string[];
  featureRefs: string[];
  verificationRefs: string[];
  workUnits: Array<{
    workUnitId: string;
    description: string;
    acceptanceItems: Array<{ acceptanceId: string; description: string; fulfilled: boolean }>;
  }>;
}

export function selectRequirementChains(a: BAQArtifacts): RequirementChain[] {
  if (!a.traceMap) return [];
  return a.traceMap.traces.map((t) => ({
    traceId: t.trace_id,
    requirementId: t.requirement_id,
    description: t.requirement_description,
    coverageStatus: t.coverage_status,
    fileRefs: t.file_refs,
    featureRefs: t.feature_refs,
    verificationRefs: t.verification_refs,
    workUnits: t.work_units.map((wu) => ({
      workUnitId: wu.work_unit_id,
      description: wu.description,
      acceptanceItems: wu.acceptance_items.map((ai) => ({
        acceptanceId: ai.acceptance_id,
        description: ai.description,
        fulfilled: ai.fulfilled,
      })),
    })),
  }));
}

export interface MissingRequiredFile {
  fileId: string;
  path: string;
  traceRefs: string[];
  reason: string;
}

export function selectMissingRequiredFiles(a: BAQArtifacts): MissingRequiredFile[] {
  if (!a.packagingDecision) return [];
  return a.packagingDecision.inventory_mismatches.map((m, i) => ({
    fileId: `MISS-${i + 1}`,
    path: m.file_path,
    traceRefs: [],
    reason: m.reason,
  }));
}

export function selectUnplannedGeneratedFiles(a: BAQArtifacts): Array<{ path: string; reason: string }> {
  if (!a.inventory) return [];
  return a.inventory.files
    .filter((f) => !f.required && (!f.trace_refs || f.trace_refs.length === 0))
    .map((f) => ({
      path: f.path,
      reason: `Not in required manifest and has no trace references (${f.generation_method})`,
    }));
}

export interface GateRow {
  gateId: string;
  gateName: string;
  status: "pass" | "fail" | "skip";
  conditionsPassed: number;
  conditionsTotal: number;
  blockers: string[];
  severity: BAQSeverity;
  conditions: Array<{
    conditionId: string;
    description: string;
    passed: boolean;
    detail: string;
    severity: BAQSeverity;
    message: string;
  }>;
}

export function selectGateRows(a: BAQArtifacts): GateRow[] {
  if (!a.qualityReport) return [];
  return a.qualityReport.gates.map((g) => ({
    gateId: g.gate_id,
    gateName: g.gate_name,
    status: g.status,
    conditionsPassed: g.conditions.filter((c) => c.passed).length,
    conditionsTotal: g.conditions.length,
    blockers: g.blockers,
    severity: g.status === "fail" ? "critical" : g.status === "skip" ? "warning" : "info",
    conditions: g.conditions.map((c) => ({
      conditionId: c.condition_id,
      description: c.description,
      passed: c.passed,
      detail: c.detail,
      severity: c.severity,
      message: c.message,
    })),
  }));
}

export interface FailureSummary {
  totalFailures: number;
  byClass: Record<string, number>;
  bySeverity: Record<string, number>;
  resolvedCount: number;
  unresolvedCount: number;
  blockingCount: number;
  failures: BAQFailureEntry[];
}

export function selectFailureSummary(a: BAQArtifacts): FailureSummary {
  if (!a.failureReport) {
    return { totalFailures: 0, byClass: {}, bySeverity: {}, resolvedCount: 0, unresolvedCount: 0, blockingCount: 0, failures: [] };
  }
  const s = a.failureReport.summary;
  return {
    totalFailures: s.total_failures,
    byClass: s.by_class as Record<string, number>,
    bySeverity: s.by_severity as Record<string, number>,
    resolvedCount: s.resolved_count,
    unresolvedCount: s.unresolved_count,
    blockingCount: s.blocking_count,
    failures: a.failureReport.failures,
  };
}

export interface PackagingReconciliation {
  allowed: boolean;
  blockReasons: string[];
  missingArtifacts: string[];
  gateFailures: string[];
  inventoryMismatches: Array<{ filePath: string; reason: string }>;
  manifestMismatches: Array<{ filePath: string; reason: string }>;
}

export function selectPackagingReconciliation(a: BAQArtifacts): PackagingReconciliation {
  if (!a.packagingDecision) {
    return { allowed: true, blockReasons: [], missingArtifacts: [], gateFailures: [], inventoryMismatches: [], manifestMismatches: [] };
  }
  const p = a.packagingDecision;
  return {
    allowed: p.allowed,
    blockReasons: p.block_reasons,
    missingArtifacts: p.missing_artifacts,
    gateFailures: p.gate_failures,
    inventoryMismatches: p.inventory_mismatches.map((m) => ({ filePath: m.file_path, reason: m.reason })),
    manifestMismatches: p.manifest_mismatches.map((m) => ({ filePath: m.file_path, reason: m.reason })),
  };
}

export interface TrendPoint {
  runId: string;
  qualityScore: number;
  gatesPassed: number;
  gatesTotal: number;
  decision: string;
  timestamp: string;
}

export function selectTrendSeries(a: BAQArtifacts): TrendPoint[] {
  if (!a.qualityReport) return [];
  return [{
    runId: a.qualityReport.run_id ?? "current",
    qualityScore: a.qualityReport.overall_quality_score,
    gatesPassed: a.qualityReport.gate_summary.passed,
    gatesTotal: a.qualityReport.gate_summary.total_gates,
    decision: a.qualityReport.decision,
    timestamp: a.qualityReport.created_at ?? "",
  }];
}

export interface TraceGap {
  requirementId: string;
  description: string;
  coverageStatus: string;
  missingAreas: string[];
}

export function selectTraceGaps(a: BAQArtifacts): TraceGap[] {
  if (!a.traceMap) return [];
  return a.traceMap.traces
    .filter((t) => t.coverage_status !== "fully_covered")
    .map((t) => {
      const missingAreas: string[] = [];
      if (t.file_refs.length === 0) missingAreas.push("No file references");
      for (const wu of t.work_units) {
        for (const ai of wu.acceptance_items) {
          if (!ai.fulfilled) missingAreas.push(`Unfulfilled: ${ai.description}`);
        }
      }
      return {
        requirementId: t.requirement_id,
        description: t.requirement_description,
        coverageStatus: t.coverage_status,
        missingAreas,
      };
    });
}

export interface SufficiencyDimension {
  dimensionId: string;
  name: string;
  score: number;
  threshold: number;
  passed: boolean;
  detail: string;
}

export interface SufficiencyGap {
  gapId: string;
  dimensionRef: string;
  severity: string;
  description: string;
  affectedRefs: string[];
  recommendation: string;
}

export function selectSufficiencyDimensions(a: BAQArtifacts): SufficiencyDimension[] {
  if (!a.sufficiency?.dimensions) return [];
  return a.sufficiency.dimensions.map((d: BAQSufficiencyDimension) => ({
    dimensionId: d.dimension_id,
    name: d.name,
    score: d.score,
    threshold: d.threshold,
    passed: d.passed,
    detail: d.detail,
  }));
}

export function selectSufficiencyGaps(a: BAQArtifacts): SufficiencyGap[] {
  if (!a.sufficiency?.gaps) return [];
  return a.sufficiency.gaps.map((g: BAQSufficiencyGap) => ({
    gapId: g.gap_id,
    dimensionRef: g.dimension_ref,
    severity: g.severity,
    description: g.description,
    affectedRefs: g.affected_refs,
    recommendation: g.recommendation,
  }));
}

export interface InventoryByCategory {
  optional: RequiredFileRow[];
  test: RequiredFileRow[];
  config: RequiredFileRow[];
  runtime: RequiredFileRow[];
  proof: RequiredFileRow[];
}

export function selectInventoryByCategory(a: BAQArtifacts): InventoryByCategory {
  if (!a.inventory) return { optional: [], test: [], config: [], runtime: [], proof: [] };
  const toRow = (f: BAQRepoFileEntry): RequiredFileRow => ({
    fileId: f.file_id,
    path: f.path,
    role: f.role,
    layer: f.layer,
    required: f.required,
    generationMethod: f.generation_method,
    traceRefs: f.trace_refs,
  });
  return {
    optional: a.inventory.files.filter((f) => !f.required).map(toRow),
    test: a.inventory.files.filter((f) => f.layer === "test").map(toRow),
    config: a.inventory.files.filter((f) => f.role === "config" || f.layer === "config").map(toRow),
    runtime: a.inventory.files.filter((f) => f.layer === "runtime" || f.role === "runtime").map(toRow),
    proof: a.inventory.files.filter((f) => f.role === "proof" || f.role === "verification").map(toRow),
  };
}

export interface FailureRepairHint {
  failureId: string;
  description: string;
  resolution: string;
  fileRef: string;
  sourceRef: string;
  severity: string;
  isBlocking: boolean;
}

export function selectFailureRepairHints(a: BAQArtifacts): FailureRepairHint[] {
  if (!a.failureReport) return [];
  return a.failureReport.failures
    .filter((f) => !f.resolved && f.resolution)
    .map((f) => ({
      failureId: f.failure_id,
      description: f.description,
      resolution: f.resolution,
      fileRef: f.file_ref ?? "",
      sourceRef: f.source_ref ?? "",
      severity: f.severity,
      isBlocking: f.severity === "critical" || f.severity === "error",
    }));
}

export interface MissingFileImpact {
  fileId: string;
  path: string;
  reason: string;
  linkedRequirements: Array<{ requirementId: string; description: string; coverageStatus: string }>;
  linkedAcceptanceItems: Array<{ acceptanceId: string; description: string; fulfilled: boolean }>;
  gateImpact: Array<{ gateId: string; gateName: string; status: string }>;
  packagingImpact: string[];
}

export function selectMissingFileImpacts(a: BAQArtifacts): MissingFileImpact[] {
  const missingFiles = selectMissingRequiredFiles(a);
  if (missingFiles.length === 0) return [];

  return missingFiles.map((f) => {
    const linkedRequirements: MissingFileImpact["linkedRequirements"] = [];
    const linkedAcceptanceItems: MissingFileImpact["linkedAcceptanceItems"] = [];
    const gateImpact: MissingFileImpact["gateImpact"] = [];
    const packagingImpact: string[] = [];

    if (a.traceMap) {
      for (const trace of a.traceMap.traces) {
        const fileMatch = trace.file_refs.some((ref) => f.path.includes(ref) || ref.includes(f.path));
        if (fileMatch || f.traceRefs.some((tr) => tr === trace.requirement_id)) {
          linkedRequirements.push({
            requirementId: trace.requirement_id,
            description: trace.requirement_description,
            coverageStatus: trace.coverage_status,
          });
          for (const wu of trace.work_units) {
            for (const ai of wu.acceptance_items) {
              linkedAcceptanceItems.push({
                acceptanceId: ai.acceptance_id,
                description: ai.description,
                fulfilled: ai.fulfilled,
              });
            }
          }
        }
      }
    }

    if (a.qualityReport && linkedRequirements.length > 0) {
      const linkedReqIds = new Set(linkedRequirements.map((r) => r.requirementId));
      for (const gate of a.qualityReport.gates) {
        if (gate.status === "fail") {
          const blockerLinked = gate.blockers.some((b) => linkedReqIds.has(b) || b.includes(f.path));
          const conditionLinked = gate.conditions.some((c) =>
            c.evidence_refs.some((ref) => linkedReqIds.has(ref) || ref.includes(f.path) || f.path.includes(ref))
          );
          if (blockerLinked || conditionLinked) {
            gateImpact.push({ gateId: gate.gate_id, gateName: gate.gate_name, status: gate.status });
          }
        }
      }
    }

    if (a.packagingDecision) {
      for (const mismatch of a.packagingDecision.inventory_mismatches) {
        if (mismatch.file_path === f.path) {
          packagingImpact.push(mismatch.reason);
        }
      }
      if (!a.packagingDecision.allowed) {
        packagingImpact.push("Packaging blocked");
      }
    }

    return {
      fileId: f.fileId,
      path: f.path,
      reason: f.reason,
      linkedRequirements,
      linkedAcceptanceItems,
      gateImpact,
      packagingImpact,
    };
  });
}

export function selectUpstreamBlockers(a: BAQArtifacts): Array<{ source: string; description: string; impact: string }> {
  const blockers: Array<{ source: string; description: string; impact: string }> = [];
  if (a.packagingDecision) {
    for (const reason of a.packagingDecision.block_reasons) {
      blockers.push({ source: "packaging", description: reason, impact: "Blocks kit assembly" });
    }
    for (const artifact of a.packagingDecision.missing_artifacts) {
      blockers.push({ source: "missing_artifact", description: `Missing: ${artifact}`, impact: "Required artifact not generated" });
    }
  }
  if (a.qualityReport) {
    for (const g of a.qualityReport.gates) {
      if (g.status === "fail") {
        blockers.push({ source: `gate:${g.gate_id}`, description: `${g.gate_name} failed`, impact: "Gate enforcement violation" });
      }
    }
  }
  return blockers;
}

export interface TopBlocker {
  id: string;
  category: string;
  description: string;
  severity: BAQSeverity;
  impact: string;
}

export function selectTopBlockers(a: BAQArtifacts): TopBlocker[] {
  const blockers: TopBlocker[] = [];

  if (a.qualityReport) {
    for (const g of a.qualityReport.gates) {
      if (g.status === "fail") {
        for (const b of g.blockers) {
          blockers.push({
            id: g.gate_id,
            category: "gate",
            description: `${g.gate_name}: ${b}`,
            severity: "critical",
            impact: "Blocks packaging",
          });
        }
      }
    }
  }

  if (a.packagingDecision) {
    for (const r of a.packagingDecision.block_reasons) {
      if (!blockers.some((b) => b.description.includes(r))) {
        blockers.push({
          id: `pkg-${blockers.length}`,
          category: "packaging",
          description: r,
          severity: "critical",
          impact: "Blocks packaging",
        });
      }
    }
  }

  if (a.failureReport) {
    for (const f of a.failureReport.failures.filter((f) => !f.resolved && (f.severity === "critical" || f.severity === "error"))) {
      blockers.push({
        id: f.failure_id,
        category: f.failure_class,
        description: f.description,
        severity: f.severity,
        impact: `${f.phase} failure`,
      });
    }
  }

  return blockers.slice(0, 5);
}

export interface NextBestFix {
  action: string;
  target: string;
  impact: string;
  effort: "low" | "medium" | "high";
}

export function selectNextBestFix(a: BAQArtifacts): NextBestFix | null {
  const blockers = selectTopBlockers(a);
  if (blockers.length === 0) return null;

  const first = blockers[0];
  const repairHints = selectFailureRepairHints(a);
  const matchedHint = repairHints.find((h) => first.description.includes(h.failureId) || h.failureId.includes(first.id));
  if (first.category === "gate") {
    const gateDetail = a.qualityReport?.gates.find((g) => g.gate_id === first.id);
    return {
      action: matchedHint?.resolution ?? `Resolve gate ${first.id}`,
      target: first.description,
      impact: gateDetail?.blockers?.[0] ?? "",
      effort: first.severity === "critical" ? "high" : "medium",
    };
  }
  if (first.category === "packaging") {
    const blockReason = a.packagingDecision?.block_reasons?.[0];
    return {
      action: matchedHint?.resolution ?? `Resolve packaging issue`,
      target: first.description,
      impact: blockReason ?? "",
      effort: first.severity === "critical" ? "high" : "medium",
    };
  }
  return {
    action: matchedHint?.resolution ?? `Fix ${first.category} issue`,
    target: first.description,
    impact: "",
    effort: first.severity === "critical" ? "high" : "low",
  };
}
