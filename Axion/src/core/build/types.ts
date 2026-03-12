export type BuildState =
  | "not_requested"
  | "requested"
  | "approved"
  | "building"
  | "verifying"
  | "failed"
  | "passed"
  | "exported";

export type BuildOutputMode = "kit_only" | "build_repo" | "build_and_export";

export type BuildFailureClass =
  | "missing_kit"
  | "invalid_inputs"
  | "eligibility"
  | "extraction"
  | "blueprint"
  | "planning"
  | "workspace"
  | "generation"
  | "verification"
  | "packaging"
  | "preflight"
  | "records";

export const BUILD_TRANSITIONS: Record<BuildState, BuildState[]> = {
  not_requested: ["requested"],
  requested: ["approved", "failed"],
  approved: ["building", "failed"],
  building: ["verifying", "failed"],
  verifying: ["passed", "failed"],
  failed: ["requested"],
  passed: ["exported", "building"],
  exported: ["building"],
};

export interface BuildRequest {
  runId: string;
  outputMode: BuildOutputMode;
  requestedAt: string;
  operatorNote?: string;
}

export interface BuildSlice {
  sliceId: string;
  name: string;
  order: number;
  requiresAI: boolean;
  files: BuildFileTarget[];
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface BuildFileTarget {
  relativePath: string;
  role: string;
  sourceRef?: string;
  traceRef?: string;
  generationMethod: "deterministic" | "ai_assisted";
  status: "pending" | "generated" | "failed" | "skipped";
  sizeBytes?: number;
}

export interface BuildPlan {
  buildId: string;
  runId: string;
  kitRef: string;
  stackProfile: StackProfile;
  repoShape: RepoShape;
  slices: BuildSlice[];
  totalFiles: number;
  totalSlices: number;
  createdAt: string;
}

export interface StackProfile {
  framework: string;
  language: string;
  runtime: string;
  packageManager: string;
  buildTool?: string;
  testFramework?: string;
  cssFramework?: string;
  database?: string;
}

export interface RepoShape {
  rootDirs: string[];
  srcLayout: Record<string, string[]>;
  configFiles: string[];
  docFiles: string[];
}

export interface BuildManifest {
  buildId: string;
  runId: string;
  sourceKit: {
    kitRoot: string;
    runId: string;
    specId: string;
    version: string;
  };
  buildProfile: StackProfile;
  request: BuildRequest;
  lifecycle: BuildLifecycleEvent[];
  status: BuildState;
  startedAt: string;
  completedAt?: string;
  outputRefs: {
    repoPath?: string;
    buildManifestPath?: string;
    repoManifestPath?: string;
    verificationReportPath?: string;
    buildPlanPath?: string;
    fileIndexPath?: string;
    exportZipPath?: string;
    kitExtractionPath?: string;
    repoBlueprintPath?: string;
  };
  tokenUsage?: {
    total_prompt_tokens: number;
    total_completion_tokens: number;
    total_tokens: number;
    total_cost_usd: number;
    api_calls: number;
  };
  failureEvidence?: {
    failureClass: BuildFailureClass;
    phase: string;
    reason: string;
    blockedConditions?: string[];
    partialOutputs?: string[];
  };
  remediation?: {
    remediated_at: string;
    filesFixed: number;
    filesFailed: number;
    filesUnchanged: number;
    certRunId: string;
    repackaged: boolean;
  };
}

export interface BuildLifecycleEvent {
  state: BuildState;
  timestamp: string;
  phase?: string;
  detail?: string;
}

export interface RepoManifest {
  buildId: string;
  runId: string;
  repoRoot: string;
  structure: {
    directories: string[];
    totalFiles: number;
    totalSizeBytes: number;
  };
  fileInventory: FileInventoryEntry[];
  moduleCoverage: Record<string, string[]>;
  dependencies: Record<string, string>;
  commands: {
    install?: string;
    dev?: string;
    build?: string;
    test?: string;
    lint?: string;
  };
  generatedAt: string;
}

export interface FileInventoryEntry {
  path: string;
  role: string;
  sourceRef?: string;
  sizeBytes: number;
  generationMethod: "deterministic" | "ai_assisted";
}

export interface VerificationReport {
  buildId: string;
  runId: string;
  verifiedAt: string;
  overallResult: "pass" | "fail";
  categories: VerificationCategory[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
    warnings: number;
  };
  exportEligible: boolean;
  fidelity?: BuildFidelityReport;
}

export interface VerificationCategory {
  categoryId: string;
  name: string;
  result: "pass" | "fail" | "warn" | "skip";
  checks: VerificationCheck[];
}

export interface VerificationCheck {
  checkId: string;
  description: string;
  result: "pass" | "fail" | "warn" | "skip";
  detail?: string;
}

export interface EligibilityResult {
  eligible: boolean;
  conditions: EligibilityCondition[];
  blockers: string[];
}

export interface EligibilityCondition {
  conditionId: string;
  description: string;
  passed: boolean;
  detail?: string;
}

export interface BuildProgress {
  buildId: string;
  state: BuildState;
  currentSlice?: string;
  slicesCompleted: number;
  totalSlices: number;
  filesGenerated: number;
  totalFiles: number;
  tokenUsage?: {
    total_tokens: number;
    total_cost_usd: number;
    api_calls: number;
  };
  startedAt: string;
  updatedAt: string;
  error?: string;
  failureClass?: BuildFailureClass;
}

export function isValidTransition(from: BuildState, to: BuildState): boolean {
  return BUILD_TRANSITIONS[from]?.includes(to) ?? false;
}

export function generateBuildId(): string {
  const num = Math.floor(Math.random() * 999999).toString().padStart(6, "0");
  return `BLD-${num}`;
}

export interface SourceLayerResult {
  source_layer: string;
  required: boolean;
  source_refs: string[];
  extracted: boolean;
  extracted_count: number;
  gap_count: number;
  notes: string | null;
}

export interface ExtractionGap {
  gap_id: string;
  source_layer: string;
  source_ref: string;
  gap_type: "not_extracted" | "partially_extracted" | "projection_not_derived" | "trace_not_formed" | "file_implication_missing";
  severity: "warning" | "error";
  description: string;
  blocks_build: boolean;
}

export interface ExtractionCoverageSummary {
  total_kit_files: number;
  total_extracted_files: number;
  total_ignored_files: number;
  required_source_layers: number;
  extracted_source_layers: number;
  failed_source_layers: number;
}

export interface ProjectionArtifactSummary {
  artifact_name: string;
  produced: boolean;
  artifact_ref: string;
  completeness_status: "complete" | "partial" | "missing";
}

export interface DerivedBuildImplications {
  derived_subsystem_count: number;
  derived_module_count: number;
  derived_screen_count: number;
  derived_endpoint_count: number;
  derived_entity_count: number;
  derived_file_group_count: number;
  derived_expected_total_file_count: number;
  derived_repo_type: string;
  derived_repo_shape: string;
}

export interface DomainEntity {
  entity_id: string;
  name: string;
  fields: string[];
  relationships: string[];
  source_ref: string;
}

export interface DomainModel {
  entities: DomainEntity[];
  relationships: Array<{ from: string; to: string; type: string }>;
  state_machines: Array<{ entity: string; states: string[]; transitions: string[] }>;
}

export interface AppIdentity {
  app_name: string;
  app_type: string;
  description: string;
  project_overview: string;
}

export interface FeatureMapEntry {
  feature_id: string;
  name: string;
  description: string;
  priority: string;
  deliverables: string[];
  scope_refs: string[];
}

export interface InterfaceContracts {
  routes: Array<{ path: string; method: string; handler: string; source_ref: string }>;
  endpoints: Array<{ endpoint_id: string; path: string; method: string; request_schema?: string; response_schema?: string; source_ref: string }>;
  events: Array<{ event_id: string; name: string; payload: string; source_ref: string }>;
}

export interface DataSchemas {
  schemas: Array<{ schema_id: string; name: string; fields: string[]; source_ref: string }>;
  storage_types: string[];
  migrations: string[];
}

export interface SecurityModel {
  auth_model: string;
  auth_flows: string[];
  rbac_rules: Array<{ role: string; permissions: string[] }>;
  security_requirements: string[];
  source_refs: string[];
}

export interface VerificationExpectations {
  acceptance_criteria: Array<{ criteria_id: string; description: string; feature_ref: string }>;
  test_categories: string[];
  coverage_targets: Record<string, number>;
}

export interface DerivedBuildInputs {
  app_identity: AppIdentity;
  domain_model: DomainModel;
  subsystems: Array<{ subsystem_id: string; name: string; description: string; layer: string; source_refs: string[] }>;
  feature_map: FeatureMapEntry[];
  interfaces: InterfaceContracts;
  data: DataSchemas;
  security: SecurityModel;
  verification: VerificationExpectations;
}

export interface RepoInventory {
  expected_directories: string[];
  expected_modules: Array<{ module_id: string; path: string; layer: string; purpose: string }>;
  expected_files: Array<{ path: string; role: string; layer: string; source_ref: string }>;
  expected_file_count: number;
}

export interface RequirementTraceEntry {
  requirement_id: string;
  description: string;
  module_refs: string[];
  file_refs: string[];
  verification_refs: string[];
}

export interface KitExtraction {
  kit_extraction_report_id: string;
  run_id: string;
  kit_ref: string;
  kit_manifest_ref: string;
  kit_version: string;
  kit_file_count: number;
  kit_root_path: string;
  extraction_coverage_summary: ExtractionCoverageSummary;
  source_layer_results: SourceLayerResult[];
  projection_artifact_summary: ProjectionArtifactSummary[];
  derived_build_implications: DerivedBuildImplications;
  derived_inputs: DerivedBuildInputs;
  repo_inventory: RepoInventory;
  requirement_trace_map: RequirementTraceEntry[];
  extraction_gaps: ExtractionGap[];
  extraction_result: "passed" | "failed" | "partial";
  build_gate_recommendation: "allow_build" | "block_build" | "allow_with_warnings";
  created_at: string;
  updated_at: string;
  status: "active" | "superseded";
}

export interface ExtractionGateResult {
  passed: boolean;
  conditions: Array<{ condition_id: string; description: string; passed: boolean; detail?: string }>;
  blockers: string[];
}

export interface BlueprintModule {
  module_id: string;
  name: string;
  layer: "frontend" | "backend" | "shared" | "data" | "security" | "test" | "config" | "docs";
  purpose: string;
  path: string;
  inputs: string[];
  outputs: string[];
  dependencies: string[];
  source_refs: string[];
}

export interface BlueprintSubsystem {
  subsystem_id: string;
  name: string;
  modules: string[];
  responsibilities: string[];
  dependencies: string[];
  layer: string;
}

export type BuildProfile = "lean" | "standard" | "enterprise";

export type ArtifactJustification =
  | "functional"
  | "structural"
  | "verification"
  | "operational"
  | "support_dependency";

export interface BuildProfileConfig {
  profile: BuildProfile;
  verification_depth: "minimal" | "standard" | "thorough";
  ops_tier: "none" | "basic" | "full";
  contract_tier: "none" | "internal" | "explicit";
  persistence_tier: "none" | "basic" | "managed";
}

export interface BlueprintFileEntry {
  file_id: string;
  path: string;
  role: string;
  layer: "frontend" | "backend" | "shared" | "data" | "security" | "test" | "config" | "docs";
  module_ref: string;
  subsystem_ref: string;
  generation_method: "deterministic" | "ai_assisted";
  source_refs: string[];
  trace_refs: string[];
  description: string;
  required_reason?: string;
  justification?: ArtifactJustification;
}

export interface DirectoryLayout {
  directories: Array<{ path: string; purpose: string; layer: string; required: boolean }>;
  top_level_roots: string[];
  repo_type: string;
  repo_shape: string;
}

export interface BlueprintDataModel {
  entities: DomainEntity[];
  schemas: DataSchemas;
  migration_strategy: string;
}

export interface BlueprintVerificationTargets {
  test_files: Array<{ path: string; type: string; covers: string[] }>;
  coverage_expectations: Record<string, number>;
  acceptance_criteria: Array<{ criteria_id: string; description: string; test_refs: string[] }>;
}

export interface FileCountBreakdown {
  frontend: number;
  backend: number;
  shared: number;
  data: number;
  test: number;
  config: number;
  docs: number;
  total: number;
}

export interface RepoBlueprint {
  blueprint_id: string;
  run_id: string;
  kit_ref: string;
  extraction_ref: string;
  system_identity: AppIdentity;
  domain_model: DomainModel;
  subsystems: BlueprintSubsystem[];
  module_map: BlueprintModule[];
  directory_layout: DirectoryLayout;
  file_inventory: BlueprintFileEntry[];
  interface_contracts: InterfaceContracts;
  data_model: BlueprintDataModel;
  security_model: SecurityModel;
  feature_map: FeatureMapEntry[];
  verification_targets: BlueprintVerificationTargets;
  expected_file_count: number;
  file_count_breakdown: FileCountBreakdown;
  traceability_map: RequirementTraceEntry[];
  build_profile?: BuildProfileConfig;
  created_at: string;
  updated_at: string;
  status: "active" | "superseded";
}

export interface BlueprintGateResult {
  passed: boolean;
  conditions: Array<{ condition_id: string; description: string; passed: boolean; detail?: string }>;
  blockers: string[];
}

export type BuildUnitType =
  | "entity_unit"
  | "endpoint_unit"
  | "screen_unit"
  | "shared_unit"
  | "infra_unit"
  | "verification_unit";

export type ComplexityClass = "C0" | "C1" | "C2" | "C3" | "C4";

export type GenerationMode = "deterministic" | "template" | "cheap_model" | "full_model";

export type ModelTier = "none" | "mini" | "full";

export interface BuildUnit {
  id: string;
  unit_type: BuildUnitType;
  name: string;
  file_ids: string[];
  dependency_unit_ids: string[];
  source_refs: string[];
  context_capsule?: ContextCapsule;
}

export interface ContextCapsule {
  unit_id: string;
  entity_slice?: { name: string; fields: string[]; relationships: string[] };
  endpoint_slice?: { path: string; method: string; request_schema?: string; response_schema?: string };
  auth_slice?: { auth_required: boolean; roles?: string[]; permissions?: string[] };
  fields_summary?: string;
  requirements_summary?: string;
  estimated_tokens: number;
}

export interface ComplexityProfile {
  build_unit_id: string;
  complexity_class: ComplexityClass;
  score: number;
  scoring_factors: Record<string, number>;
  rationale: string;
}

export interface GenerationStrategy {
  build_unit_id: string;
  generation_mode: GenerationMode;
  model_tier: ModelTier;
  rationale: string;
}

export interface WavePlan {
  waves: WaveEntry[];
}

export interface WaveEntry {
  wave_id: string;
  order: number;
  unit_ids: string[];
  parallelizable: boolean;
}

export interface CostForecast {
  total_estimated_tokens: number;
  estimated_cost_usd: number;
  by_mode: Record<GenerationMode, { file_count: number; estimated_tokens: number; estimated_cost_usd: number }>;
  expensive_units: string[];
}

export interface GenerationStrategyPlan {
  build_units: BuildUnit[];
  complexity_profiles: ComplexityProfile[];
  strategies: GenerationStrategy[];
  wave_plan: WavePlan;
  cost_forecast: CostForecast;
}

export interface UnitGenerationResult {
  unit_id: string;
  files_produced: Array<{ path: string; content: string }>;
  tokens_used: number;
  model_used: string;
  success: boolean;
  structural_violations: string[];
}

export interface BuildFidelityReport {
  planned_files: number;
  generated_files: number;
  verified_files: number;
  failed_files: number;
  fidelity_pct: number;
  llm_file_count: number;
  llm_usage_pct: number;
  deterministic_pct: number;
  structural_violations: number;
}
