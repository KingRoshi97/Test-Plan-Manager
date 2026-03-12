import type {
  BAQKitExtraction,
  BAQDerivedBuildInputs,
  BAQRepoInventory,
  BAQRequirementTraceMap,
  BAQBuildQualityReport,
  BAQGenerationFailureReport,
  BAQSufficiencyEvaluation,
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
  const vals = Object.values(artifacts);
  const present = vals.filter((v) => v !== null).length;
  if (present === 0) return "empty";
  if (present === vals.length) return "full";
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

  const placeholderRatio = 0;

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
  return {
    totalFiles: inv.summary.total_files,
    requiredFiles,
    generatedFiles: inv.summary.total_files,
    missingRequired: 0,
    unplannedFiles: 0,
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

export function selectUnplannedGeneratedFiles(_a: BAQArtifacts): Array<{ path: string; reason: string }> {
  return [];
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

export function selectTrendSeries(_a: BAQArtifacts): TrendPoint[] {
  return [];
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
  if (first.category === "gate") {
    return {
      action: "Fix gate failure",
      target: first.description,
      impact: "Unblocks packaging pipeline",
      effort: "medium",
    };
  }
  if (first.category === "packaging") {
    return {
      action: "Resolve packaging blocker",
      target: first.description,
      impact: "Enables kit packaging",
      effort: "medium",
    };
  }
  return {
    action: "Fix failure",
    target: first.description,
    impact: "Reduces failure count",
    effort: "medium",
  };
}
