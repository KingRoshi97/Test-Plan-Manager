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
  | "performance";

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
  build_integrity: 0.25,
  functional: 0.30,
  security: 0.25,
  performance: 0.20,
};

export const RUN_TYPE_DOMAINS: Record<CertificationRunType, CertificationDomain[]> = {
  smoke: ["build_integrity", "functional"],
  functional: ["build_integrity", "functional"],
  security: ["build_integrity", "security"],
  performance: ["build_integrity", "performance"],
  full_certification: ["build_integrity", "functional", "security", "performance"],
  pre_deployment: ["build_integrity", "functional", "security", "performance"],
};
