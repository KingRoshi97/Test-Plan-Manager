export type MaintenanceRunStatus =
  | "planned"
  | "applying"
  | "verifying"
  | "blocked"
  | "failed"
  | "complete"
  | "paused"
  | "cancelled"
  | "rolling_back";

export type MaintenanceWorkUnitStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "failed"
  | "skipped";

export type MaintenanceUnitType =
  | "dep_upgrade"
  | "migration"
  | "refactor"
  | "test_hardening"
  | "ci_fix"
  | "security_patch";

export interface VerificationResult {
  check_id: string;
  passed: boolean;
  details: string;
  timestamp: string;
}

export interface MaintenanceUnit {
  unit_id: string;
  type: MaintenanceUnitType;
  status: MaintenanceWorkUnitStatus;
  target_paths: string[];
  verification_results: VerificationResult[];
}

export interface MaintenanceRun {
  run_id: string;
  mode_id: string;
  intent_type: string;
  scope_constraints: string[];
  risk_class: string;
  status: MaintenanceRunStatus;
  units: MaintenanceUnit[];
  baseline_revision: string;
  created_at: string;
  updated_at: string;
}

export interface DependencyDelta {
  package_name: string;
  from_version: string;
  to_version: string;
  breaking: boolean;
}

export interface DependencyUpdateReport {
  run_id: string;
  deltas: DependencyDelta[];
  lockfile_updated: boolean;
  timestamp: string;
}

export interface MigrationStep {
  step_id: string;
  description: string;
  reversible: boolean;
  target_paths: string[];
}

export interface MigrationPlan {
  run_id: string;
  steps: MigrationStep[];
  safety_checks: string[];
  created_at: string;
}

export interface MigrationVerificationReport {
  run_id: string;
  migration_plan_ref: string;
  steps_verified: { step_id: string; passed: boolean; details: string }[];
  all_passed: boolean;
  timestamp: string;
}

export interface TestUpdateReport {
  run_id: string;
  tests_added: string[];
  tests_modified: string[];
  tests_removed: string[];
  deterministic: boolean;
  timestamp: string;
}

export interface RefactorReport {
  run_id: string;
  files_touched: string[];
  interfaces_preserved: boolean;
  schema_preserved: boolean;
  timestamp: string;
}

export interface CIUpdateReport {
  run_id: string;
  workflows_modified: string[];
  toolchain_pins_valid: boolean;
  timestamp: string;
}

export interface AxionCompatibilityReport {
  run_id: string;
  contracts_checked: string[];
  all_compatible: boolean;
  breaking_changes: string[];
  timestamp: string;
}

export interface RollbackRecord {
  run_id: string;
  rolled_back_at: string;
  reason: string;
  baseline_revision: string;
  files_reverted: string[];
}

export interface MaintenanceRunReport {
  run_id: string;
  mode_id: string;
  status: MaintenanceRunStatus;
  units: MaintenanceUnit[];
  dependency_report?: DependencyUpdateReport;
  migration_report?: MigrationVerificationReport;
  test_report?: TestUpdateReport;
  refactor_report?: RefactorReport;
  ci_report?: CIUpdateReport;
  compatibility_report?: AxionCompatibilityReport;
  rollback_record?: RollbackRecord;
  created_at: string;
  completed_at: string;
}
