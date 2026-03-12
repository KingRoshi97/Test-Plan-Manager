export type BAQRunStatus =
  | "not_started"
  | "extraction_in_progress"
  | "extraction_complete"
  | "derivation_in_progress"
  | "derivation_complete"
  | "inventory_planned"
  | "traceability_mapped"
  | "sufficiency_evaluated"
  | "generation_in_progress"
  | "generation_complete"
  | "verification_in_progress"
  | "verification_complete"
  | "packaging_in_progress"
  | "packaging_complete"
  | "failed";

export type BAQSeverity = "info" | "warning" | "error" | "critical";

export type BAQSectionStatus =
  | "consumed"
  | "deferred"
  | "not_applicable"
  | "invalid"
  | "missing";

export type BAQApplicabilityStatus =
  | "required"
  | "recommended"
  | "optional"
  | "not_applicable";

export type BuildQualityGateId =
  | "G-BQ-01"
  | "G-BQ-02"
  | "G-BQ-03"
  | "G-BQ-04"
  | "G-BQ-05"
  | "G-BQ-06"
  | "G-BQ-07";

export type GenerationFailureClass =
  | "extraction_failure"
  | "planning_failure"
  | "inventory_failure"
  | "traceability_failure"
  | "generation_failure"
  | "placeholder_fulfillment_failure"
  | "verification_failure"
  | "packaging_failure";

export interface BAQSectionEntry {
  section_id: string;
  section_path: string;
  section_label: string;
  applicability: BAQApplicabilityStatus;
  status: BAQSectionStatus;
  content_hash: string | null;
  file_count: number;
  byte_count: number;
  extraction_notes: string[];
  extracted_at: string | null;
}

export interface BAQCriticalObligation {
  obligation_id: string;
  source_section: string;
  obligation_type: "functional" | "structural" | "security" | "data" | "verification" | "operational";
  description: string;
  severity: BAQSeverity;
  fulfilled: boolean;
  fulfillment_ref: string | null;
}

export interface BAQExtractionWarning {
  warning_id: string;
  section_id: string;
  severity: BAQSeverity;
  message: string;
  blocks_forward_progress: boolean;
}

export interface BAQKitExtraction {
  schema_version: "1.0.0";
  extraction_id: string;
  run_id: string;
  kit_ref: string;
  kit_version: string;
  status: BAQRunStatus;
  sections: BAQSectionEntry[];
  critical_obligations: BAQCriticalObligation[];
  warnings: BAQExtractionWarning[];
  summary: {
    total_sections: number;
    consumed_count: number;
    deferred_count: number;
    not_applicable_count: number;
    invalid_count: number;
    missing_count: number;
    required_sections_present: number;
    required_sections_total: number;
    critical_obligations_total: number;
    critical_obligations_fulfilled: number;
    blocking_warnings: number;
  };
  extraction_result: "passed" | "failed" | "partial";
  gate_recommendation: "allow" | "block" | "allow_with_warnings";
  created_at: string;
  updated_at: string;
}

export interface BAQSubsystemEntry {
  subsystem_id: string;
  name: string;
  layer: string;
  description: string;
  source_refs: string[];
  module_refs: string[];
}

export interface BAQFeatureEntry {
  feature_id: string;
  name: string;
  description: string;
  priority: string;
  deliverables: string[];
  scope_refs: string[];
  subsystem_refs: string[];
}

export interface BAQDomainEntity {
  entity_id: string;
  name: string;
  fields: Array<{ name: string; type: string; required: boolean }>;
  relationships: Array<{ target: string; type: string }>;
  source_ref: string;
}

export interface BAQDomainModel {
  entities: BAQDomainEntity[];
  relationships: Array<{ from: string; to: string; type: string; label?: string }>;
}

export interface BAQStorageModel {
  storage_type: string;
  schemas: Array<{ schema_id: string; name: string; fields: string[]; source_ref: string }>;
  migrations: string[];
}

export interface BAQAPISurface {
  endpoints: Array<{
    endpoint_id: string;
    path: string;
    method: string;
    request_schema: string | null;
    response_schema: string | null;
    auth_required: boolean;
    source_ref: string;
  }>;
  routes: Array<{ path: string; method: string; handler: string; source_ref: string }>;
}

export interface BAQAuthModel {
  auth_type: string;
  auth_flows: string[];
  rbac_rules: Array<{ role: string; permissions: string[] }>;
  session_handling: string;
  source_refs: string[];
}

export interface BAQUISurfaceEntry {
  page_id: string;
  path: string;
  name: string;
  role: string;
  feature_refs: string[];
  source_ref: string;
}

export interface BAQVerificationObligation {
  obligation_id: string;
  description: string;
  category: string;
  feature_ref: string;
  criteria: string[];
  gating: string;
}

export interface BAQOpsObligation {
  obligation_id: string;
  category: string;
  description: string;
  source_ref: string;
}

export interface BAQAssumption {
  assumption_id: string;
  description: string;
  source_ref: string;
  impact: BAQSeverity;
}

export interface BAQRisk {
  risk_id: string;
  description: string;
  source_ref: string;
  severity: BAQSeverity;
  mitigation: string | null;
}

export interface BAQDerivedBuildInputs {
  schema_version: "1.0.0";
  derivation_id: string;
  run_id: string;
  extraction_ref: string;
  status: BAQRunStatus;
  subsystem_map: BAQSubsystemEntry[];
  feature_map: BAQFeatureEntry[];
  domain_model: BAQDomainModel;
  storage_model: BAQStorageModel;
  api_surface: BAQAPISurface;
  auth_model: BAQAuthModel;
  ui_surface_map: BAQUISurfaceEntry[];
  verification_obligations: BAQVerificationObligation[];
  ops_obligations: BAQOpsObligation[];
  assumptions: BAQAssumption[];
  risks: BAQRisk[];
  summary: {
    subsystem_count: number;
    feature_count: number;
    entity_count: number;
    endpoint_count: number;
    page_count: number;
    verification_obligation_count: number;
    ops_obligation_count: number;
    assumption_count: number;
    risk_count: number;
    derivation_completeness: number;
  };
  created_at: string;
  updated_at: string;
}

export interface BAQRepoFileEntry {
  file_id: string;
  path: string;
  role: string;
  layer: string;
  module_ref: string;
  subsystem_ref: string;
  generation_method: "deterministic" | "ai_assisted";
  source_refs: string[];
  trace_refs: string[];
  description: string;
  justification: string;
}

export interface BAQRepoInventory {
  schema_version: "1.0.0";
  inventory_id: string;
  run_id: string;
  derivation_ref: string;
  directories: Array<{ path: string; purpose: string; layer: string; required: boolean }>;
  modules: Array<{ module_id: string; path: string; layer: string; purpose: string; source_refs: string[] }>;
  files: BAQRepoFileEntry[];
  summary: {
    total_directories: number;
    total_modules: number;
    total_files: number;
    files_by_layer: Record<string, number>;
    files_by_generation_method: Record<string, number>;
  };
  created_at: string;
  updated_at: string;
}

export interface BAQTraceEntry {
  trace_id: string;
  requirement_id: string;
  requirement_description: string;
  feature_refs: string[];
  file_refs: string[];
  module_refs: string[];
  verification_refs: string[];
  coverage_status: "fully_covered" | "partially_covered" | "not_covered";
}

export interface BAQRequirementTraceMap {
  schema_version: "1.0.0";
  trace_map_id: string;
  run_id: string;
  inventory_ref: string;
  traces: BAQTraceEntry[];
  summary: {
    total_requirements: number;
    fully_covered: number;
    partially_covered: number;
    not_covered: number;
    coverage_percent: number;
  };
  created_at: string;
  updated_at: string;
}

export interface BAQGateResult {
  gate_id: BuildQualityGateId;
  gate_name: string;
  status: "pass" | "fail" | "skip";
  conditions: Array<{
    condition_id: string;
    description: string;
    passed: boolean;
    detail: string;
  }>;
  blockers: string[];
  evaluated_at: string;
}

export interface BAQBuildQualityReport {
  schema_version: "1.0.0";
  report_id: string;
  run_id: string;
  build_id: string;
  status: BAQRunStatus;
  extraction: { ref: string; result: string } | null;
  derivation: { ref: string; completeness: number } | null;
  inventory: { ref: string; file_count: number } | null;
  traceability: { ref: string; coverage_percent: number } | null;
  gates: BAQGateResult[];
  overall_quality_score: number;
  gate_summary: {
    total_gates: number;
    passed: number;
    failed: number;
    skipped: number;
  };
  decision: "allow_build" | "block_build" | "allow_with_warnings";
  decision_reasons: string[];
  created_at: string;
  updated_at: string;
}

export interface BAQFailureEntry {
  failure_id: string;
  failure_class: GenerationFailureClass;
  severity: BAQSeverity;
  phase: string;
  description: string;
  source_ref: string | null;
  file_ref: string | null;
  resolution: string | null;
  resolved: boolean;
  created_at: string;
}

export interface BAQGenerationFailureReport {
  schema_version: "1.0.0";
  report_id: string;
  run_id: string;
  build_id: string;
  failures: BAQFailureEntry[];
  summary: {
    total_failures: number;
    by_class: Record<GenerationFailureClass, number>;
    by_severity: Record<BAQSeverity, number>;
    resolved_count: number;
    unresolved_count: number;
    blocking_count: number;
  };
  created_at: string;
  updated_at: string;
}

export type BAQHookName =
  | "onBuildAuthorityLoaded"
  | "onKitExtractionStart"
  | "onKitExtractionComplete"
  | "onDerivedInputsBuild"
  | "onRepoInventoryPlan"
  | "onRequirementTraceBuild"
  | "onSufficiencyEvaluation"
  | "beforeGenerationStart"
  | "onFileGenerated"
  | "onGenerationComplete"
  | "onVerificationReconcile"
  | "beforePackaging"
  | "onPackagingDecision"
  | "onBuildQualityFinalize"
  | "onGenerationFailure";
