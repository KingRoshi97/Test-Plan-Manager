export type CertificationRunType =
  | "smoke"
  | "functional"
  | "security"
  | "performance"
  | "full_certification"
  | "pre_deployment";

export type CertificationDomain =
  | "build_integrity"
  | "functional"
  | "security"
  | "performance"
  | "deployment_readiness";

export type CertificationVerdict =
  | "PASS"
  | "PASS_WITH_WARNINGS"
  | "CONDITIONAL_PASS"
  | "FAIL"
  | "BLOCKED";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export type FindingImpact =
  | "release_blocker"
  | "conditional_blocker"
  | "warning"
  | "observation";

export type CoverageState =
  | "covered"
  | "partially_covered"
  | "failed"
  | "not_tested"
  | "blocked";

export type CertRunStatus = "planned" | "running" | "completed" | "failed";

export type FindingStatus = "open" | "acknowledged" | "resolved" | "suppressed";

export type TestPhase = "MVP" | "Later";

export type AVCSTestDomain =
  | "BUILD_INTEGRITY"
  | "FUNCTIONAL"
  | "SECURITY"
  | "PERFORMANCE"
  | "DEPLOYMENT"
  | "UI"
  | "UX"
  | "ACCESSIBILITY"
  | "ENTERPRISE";

export type ToolInstallMethod = "npm" | "binary" | "docker" | "builtin";

export type AdapterStatus = "available" | "not_available" | "error";

export type ToolAvailability = {
  toolId: string;
  name: string;
  status: AdapterStatus;
  message?: string;
};

export interface AVCSTestDefinition {
  id: string;
  domain: AVCSTestDomain;
  name: string;
  description: string;
  phase: TestPhase;
  primaryTools: string[];
  runTypes: CertificationRunType[];
  evidenceOutput: string;
  failExamples: string[];
}

export interface AVCSToolDefinition {
  id: string;
  name: string;
  category: string;
  officialSource: string;
  installMethod: ToolInstallMethod;
  allowedRunTypes: CertificationRunType[];
  domains: AVCSTestDomain[];
  defaultTimeoutSeconds: number;
}

export interface AVCSTestPlan {
  id: string;
  runType: CertificationRunType;
  tests: AVCSTestDefinition[];
  estimatedDurationSeconds: number;
  requiredTools: string[];
  domainCoverage: Record<AVCSTestDomain, number>;
  mvpOnly: boolean;
  createdAt: string;
}

export interface AVCSTestResult {
  testId: string;
  toolId: string;
  status: "pass" | "fail" | "warn" | "skip" | "not_available" | "error";
  message: string;
  score: number;
  durationMs: number;
  evidence?: Record<string, unknown>;
  findings?: Array<{
    severity: FindingSeverity;
    title: string;
    description: string;
    affectedFiles?: string[];
  }>;
}

export interface AVCSToolAdapter {
  id: string;
  toolId: string;
  isAvailable(): Promise<boolean>;
  execute(test: AVCSTestDefinition, context: ToolAdapterContext): Promise<AVCSTestResult>;
}

export interface ToolAdapterContext {
  certRunId: string;
  buildDir: string;
  targetDir: string;
  planFiles: string[];
  blueprintFeatures: string[];
  timeoutSeconds: number;
}

export interface CertificationRun {
  id: string;
  assembly_id: number;
  run_id: string;
  run_type: CertificationRunType;
  status: CertRunStatus;
  domains_evaluated: CertificationDomain[];
  started_at?: string;
  completed_at?: string;
  target_build: string;
  evidence_path: string;
  verdict?: CertificationVerdict;
  score?: number;
  created_at: string;
}

export interface CertificationFinding {
  id: string;
  cert_run_id: string;
  domain: CertificationDomain;
  severity: FindingSeverity;
  impact: FindingImpact;
  title: string;
  description: string;
  affected_surface: string;
  affected_files: string[];
  probable_cause: string;
  evidence_refs: string[];
  remediation: string;
  status: FindingStatus;
  created_at: string;
}

export interface DomainCheck {
  check_id: string;
  test_id?: string;
  description: string;
  result: "pass" | "fail" | "warn" | "skip";
  detail?: string;
  evidence_ref?: string;
  affected_files?: string[];
}

export interface DomainResult {
  domain: CertificationDomain;
  status: "pass" | "fail" | "warn" | "skip" | "blocked";
  checks: DomainCheck[];
  findings_count: number;
  coverage_state: CoverageState;
  score: number;
  evidence_refs: string[];
}

export interface CoverageEntry {
  surface_type: string;
  surface_id: string;
  surface_name: string;
  state: CoverageState;
  domain: CertificationDomain;
}

export interface ScoreBreakdown {
  domain: CertificationDomain;
  weight: number;
  raw_score: number;
  weighted_score: number;
}

export interface RemediationManifest {
  affected_findings: Array<{
    finding_id: string;
    title: string;
    severity: FindingSeverity;
    affected_files: string[];
    remediation: string;
  }>;
  directly_affected_files: string[];
  affected_unit_ids: string[];
  all_files_to_regenerate: string[];
  dependency_files: string[];
  total_files: number;
  estimated_scope_pct: number;
}

export interface CertificationReport {
  id: string;
  cert_run_id: string;
  assembly_id: number;
  run_id: string;
  verdict: CertificationVerdict;
  domains: DomainResult[];
  findings_summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
    total: number;
  };
  coverage_summary: CoverageEntry[];
  score_breakdown: ScoreBreakdown[];
  overall_score: number;
  hard_stop_failures: string[];
  evidence_manifest: string[];
  remediation_manifest: RemediationManifest;
  findings?: CertificationFinding[];
  test_plan?: AVCSTestPlan;
  adapter_status?: ToolAvailability[];
  created_at: string;
}

export interface CertificationEvidence {
  id: string;
  cert_run_id: string;
  domain: CertificationDomain;
  type: "log" | "metric" | "finding" | "summary" | "check_result";
  title: string;
  content: string;
  created_at: string;
}

export interface AVCSStatus {
  total_runs: number;
  completed_runs: number;
  latest_verdict?: CertificationVerdict;
  latest_run_id?: string;
  latest_score?: number;
}

export const DOMAIN_WEIGHTS: Record<CertificationDomain, number> = {
  build_integrity: 0.20,
  functional: 0.25,
  security: 0.20,
  performance: 0.15,
  deployment_readiness: 0.20,
};

export const RUN_TYPE_DOMAINS: Record<CertificationRunType, CertificationDomain[]> = {
  smoke: ["build_integrity", "functional", "deployment_readiness"],
  functional: ["build_integrity", "functional"],
  security: ["build_integrity", "security"],
  performance: ["build_integrity", "performance"],
  full_certification: ["build_integrity", "functional", "security", "performance", "deployment_readiness"],
  pre_deployment: ["build_integrity", "functional", "security", "performance", "deployment_readiness"],
};
