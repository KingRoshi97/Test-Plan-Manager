import type {
  MaintenanceRunState,
  MaintenanceIntent,
  MaintenanceRunReport,
  ScopeConstraints,
  RiskClass,
  EvidencePointer,
  RemediationStep,
  CommandResult,
  VerificationPolicy,
} from "../../types/controlPlane.js";

export type {
  MaintenanceRunState,
  MaintenanceIntent,
  MaintenanceRunReport,
  ScopeConstraints,
  RiskClass,
  EvidencePointer,
  RemediationStep,
  CommandResult,
  VerificationPolicy,
};

export interface DependencyDelta {
  package_name: string;
  before: string;
  after: string;
  change_type: "patch" | "minor" | "major";
  breaking: boolean;
}

export interface DependencyUpdateReport {
  run_id: string;
  manifests_processed: string[];
  deltas: DependencyDelta[];
  lockfiles_updated: string[];
  changelog_entry: string;
  breaking_changes: string[];
  created_at: string;
}

export interface MigrationStep {
  step_id: string;
  description: string;
  target_path: string;
  rollback_command: string;
  order: number;
}

export interface MigrationPlan {
  migration_id: string;
  steps: MigrationStep[];
  backcompat_assessment: "safe" | "breaking" | "unknown";
  rollback_strategy: string;
  created_at: string;
}

export interface MigrationVerificationReport {
  migration_id: string;
  steps_executed: Array<{ step_id: string; status: "pass" | "fail"; message?: string }>;
  overall_status: "pass" | "fail";
  created_at: string;
}

export interface TestUpdateReport {
  run_id: string;
  regression_tests_added: Array<{ test_id: string; linked_failure: string; path: string }>;
  flakes_triaged: Array<{ test_id: string; action: "fixed" | "quarantined" | "skipped"; reason: string }>;
  coverage_assessment: { current: number; target: number; delta: number };
  created_at: string;
}

export interface RefactorPlan {
  refactor_id: string;
  scope: string;
  constraints: ScopeConstraints;
  impact_assessment: string;
  files_affected: string[];
  contract_preservation: boolean;
  change_notes: string[];
}

export interface RefactorReport {
  refactor_id: string;
  plan: RefactorPlan;
  files_modified: string[];
  contract_preserved: boolean;
  verification_status: "pass" | "fail";
  created_at: string;
}

export interface CIUpdateReport {
  run_id: string;
  workflows_updated: string[];
  checks_preserved: boolean;
  changes: Array<{ workflow: string; change_type: string; description: string }>;
  created_at: string;
}

export interface AxionCompatibilityReport {
  run_id: string;
  checks_run: string[];
  results: Array<{ check_id: string; status: "pass" | "fail"; message?: string }>;
  kit_output_valid: boolean;
  created_at: string;
}

export interface MaintenanceRun {
  maintenance_run_id: string;
  state: MaintenanceRunState;
  intent: MaintenanceIntent;
  repo_revision_baseline: string;
  modules_executed: string[];
  state_transitions: MaintenanceRunState[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceFailureReport {
  classification: "blocked" | "failed";
  module_id: string;
  reason: string;
  evidence: EvidencePointer[];
  remediation: RemediationStep[];
  fail_fast: boolean;
  timestamp: string;
}
