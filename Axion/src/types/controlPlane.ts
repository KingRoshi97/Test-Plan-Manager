export type RunState =
  | "QUEUED"
  | "RUNNING"
  | "GATED"
  | "FAILED"
  | "RELEASED"
  | "ARCHIVED"
  | "PAUSED"
  | "CANCELLED"
  | "ROLLING_BACK";

export type StageState =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PASS"
  | "FAIL"
  | "SKIP";

export type KitRunState =
  | "READY"
  | "EXECUTING"
  | "VERIFYING"
  | "BLOCKED"
  | "FAILED"
  | "COMPLETE"
  | "PAUSED"
  | "CANCELLED"
  | "RESUMING";

export type MaintenanceRunState =
  | "PLANNED"
  | "APPLYING"
  | "VERIFYING"
  | "BLOCKED"
  | "FAILED"
  | "COMPLETE"
  | "PAUSED"
  | "CANCELLED"
  | "ROLLBACKING";

export type WorkUnitState =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "DONE"
  | "FAILED"
  | "SKIPPED";

export type RiskClass = "prototype" | "production" | "compliance";

export type ExecutorType = "internal" | "external";

export type FailureClassification =
  | "contract_failure"
  | "verification_failure"
  | "recoverable_execution_failure";

export type Platform = "web" | "mobile" | "api" | "fullstack" | "other";

export type OperatorActionType =
  | "start_run"
  | "stop_run"
  | "pause_run"
  | "resume_run"
  | "rerun_stage"
  | "approve_override"
  | "change_pins"
  | "release_bundle";

export interface RunTargets {
  platforms: Platform[];
  stack?: string[];
  domains: string[];
}

export interface RunContext {
  run_id?: string;
  mode_id?: string;
  run_profile_id?: string;
  risk_class: RiskClass;
  executor_type_default: ExecutorType;
  targets: RunTargets;
}

export interface PinsetEntry {
  registry_id: string;
  registry_type: "standards" | "templates" | "gates" | "schemas" | "toolchain" | "proof_types";
  resolved_version: string;
  hash: string;
}

export interface Pinset {
  pinset_id: string;
  run_id: string;
  created_at: string;
  resolution_policy: string;
  entries: PinsetEntry[];
  pinset_hash: string;
}

export interface EvidencePointer {
  type: "file" | "log" | "hash" | "commit" | "command_output";
  path: string;
  hash?: string;
  description: string;
}

export interface RemediationStep {
  step_id: string;
  description: string;
  priority: "critical" | "high" | "medium" | "low";
}

export interface AttemptRecord {
  attempt_id: string;
  prior_attempt_ref: string | null;
  stage_id: string;
  stage_report_ref: string;
  status: StageState;
  started_at: string;
  completed_at: string | null;
}

export interface OverrideRecord {
  override_id: string;
  gate_id: string;
  scope: string;
  expiry: string;
  approver: string;
  reason: string;
  recorded_at: string;
  run_id: string;
}

export interface RunLogEntry {
  timestamp: string;
  event_type: "stage_start" | "stage_end" | "gate_evaluation" | "resolver_decision" | "verification_command" | "operator_action" | "error" | "info";
  run_id: string;
  stage_id?: string;
  gate_id?: string;
  message: string;
  refs: Record<string, string>;
}

export interface FailureReport {
  classification: FailureClassification;
  stage_id: string;
  gate_id?: string;
  reason_codes: string[];
  evidence: EvidencePointer[];
  remediation: RemediationStep[];
  inputs_consumed: string[];
  outputs_produced: string[];
  timestamp: string;
}

export interface ICPStageReport {
  run_id: string;
  stage_id: string;
  attempt_id: string;
  status: StageState;
  started_at: string;
  finished_at: string;
  inputs_consumed: EvidencePointer[];
  outputs_produced: EvidencePointer[];
  validation_results: Array<{ check: string; status: "pass" | "fail"; message?: string }>;
  failures: FailureReport[];
  duration_ms: number;
  prior_attempt_refs: string[];
}

export interface ICPGateReport {
  run_id: string;
  gate_set_profile_id: string;
  overall_status: "PASS" | "FAIL";
  run_context_summary: RunContext;
  gates: Array<{
    gate_id: string;
    status: "PASS" | "FAIL";
    predicate_results: Array<{ predicate_id: string; status: "PASS" | "FAIL"; message?: string }>;
    required_evidence_types: string[];
    satisfied_evidence: string[];
    missing_evidence: string[];
    evidence_pointers: EvidencePointer[];
    remediation: RemediationStep[];
  }>;
  evaluated_at: string;
}

export interface StateSnapshot {
  run_id: string;
  stage_statuses: Record<string, StageState>;
  artifact_inventory: EvidencePointer[];
  last_known_good: string | null;
  rollback_pointer: string | null;
  captured_at: string;
}

export interface ProofObject {
  proof_id: string;
  proof_type: string;
  source: EvidencePointer;
  applies_to: {
    spec_items?: string[];
    unit_ids?: string[];
    gate_ids?: string[];
    run_id: string;
  };
  hash: string;
  redacted: boolean;
  captured_at: string;
}

export interface ProofLedgerEntry {
  proof_id: string;
  run_id: string;
  gate_ids: string[];
  affected_targets: string[];
  appended_at: string;
}

export interface KitManifestCP {
  kit_id: string;
  run_id: string;
  pinset_ref: string;
  inventory: Array<{ artifact_id: string; path: string; hash: string; required: boolean }>;
  required_artifacts_checklist: Array<{ artifact_id: string; present: boolean }>;
  kit_export_metadata: { bundle_id: string; bundle_hash: string };
}

export interface KitEntrypoint {
  reading_order: string[];
  execution_instructions: Array<{ step: number; action: string; target: string }>;
  plan_units_ref?: string;
  verification_policy_ref?: string;
}

export interface BundleMetadata {
  bundle_id: string;
  run_id: string;
  created_at: string;
  pinset_hash: string;
  artifact_count: number;
  bundle_hash: string;
}

export interface MaintenanceIntent {
  mode_id?: string;
  intent_type: "dependency_upgrade" | "migration" | "refactor" | "test_hardening" | "ci_fix" | "axion_compat" | "general";
  scope_constraints: ScopeConstraints;
  risk_class: RiskClass;
}

export interface ScopeConstraints {
  allowed_paths: string[];
  disallowed_paths: string[];
  allowed_change_types: string[];
  max_files_touched?: number;
}

export interface MaintenanceRunReport {
  maintenance_run_id: string;
  repo_revision_baseline: string;
  intent: MaintenanceIntent;
  state: MaintenanceRunState;
  modules_executed: string[];
  state_transitions: MaintenanceRunState[];
  change_summary: {
    files_touched: number;
    dependency_deltas?: Record<string, { before: string; after: string }>;
    migration_deltas?: string[];
  };
  verification_summary: {
    commands: Array<{ command_id: string; exit_code: number; log_pointer: string }>;
  };
  compatibility_summary?: {
    checks_run: string[];
    results: Array<{ check_id: string; status: "pass" | "fail"; message?: string }>;
  };
  remediation?: {
    what_failed: string;
    why: string;
    next_steps: RemediationStep[];
    evidence: EvidencePointer[];
  };
  created_at: string;
  updated_at: string;
}

export interface VerificationPolicy {
  commands: Array<{
    command_id: string;
    command: string;
    required: boolean;
    timeout_ms?: number;
  }>;
  evidence_requirements: Array<{
    proof_type: string;
    required: boolean;
  }>;
}

export interface CommandResult {
  command_id: string;
  command: string;
  exit_code: number;
  stdout_pointer: string;
  stderr_pointer: string;
  started_at: string;
  finished_at: string;
  duration_ms: number;
}

export interface GuardrailViolation {
  rule_id: string;
  severity: "critical" | "high" | "medium" | "low";
  affected_paths: string[];
  evidence: EvidencePointer[];
  remediation: RemediationStep[];
  overridable: boolean;
}

export interface GuardrailReport {
  status: "PASS" | "BLOCKED" | "FAIL";
  violations: GuardrailViolation[];
  checked_at: string;
}
