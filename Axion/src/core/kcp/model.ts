export type KitRunStatus =
  | "ready"
  | "executing"
  | "verifying"
  | "blocked"
  | "failed"
  | "complete"
  | "paused"
  | "cancelled"
  | "resuming";

export type WorkUnitStatus =
  | "not_started"
  | "in_progress"
  | "done"
  | "failed"
  | "skipped";

export interface AttemptRecord {
  attempt_id: string;
  started_at: string;
  finished_at: string | null;
  status: WorkUnitStatus;
  error?: string;
}

export interface ImplementationRef {
  path: string;
  hash: string;
  type: "file" | "diff" | "commit";
}

export interface ProofRef {
  proof_id: string;
  type: string;
  path: string;
  hash: string;
}

export interface VerificationResult {
  check_id: string;
  command: string;
  exit_code: number;
  passed: boolean;
  log_ref: string;
  timestamp: string;
}

export interface KitWorkUnit {
  unit_id: string;
  status: WorkUnitStatus;
  attempt_history: AttemptRecord[];
  implementation_refs: ImplementationRef[];
  proof_refs: ProofRef[];
  verification_results: VerificationResult[];
}

export interface KitRun {
  kit_run_id: string;
  kit_manifest_ref: string;
  status: KitRunStatus;
  units: KitWorkUnit[];
  verification_results: VerificationResult[];
  guardrail_report_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface KitValidationReport {
  kit_run_id: string;
  valid: boolean;
  checks: {
    check_id: string;
    description: string;
    passed: boolean;
    detail?: string;
  }[];
  timestamp: string;
}

export interface GuardrailViolation {
  rule_id: string;
  description: string;
  severity: "error" | "warning";
  target?: string;
}

export interface GuardrailReport {
  kit_run_id: string;
  passed: boolean;
  violations: GuardrailViolation[];
  timestamp: string;
}

export interface KitRunReport {
  kit_run_id: string;
  kit_manifest_ref: string;
  status: KitRunStatus;
  units_summary: {
    total: number;
    done: number;
    failed: number;
    skipped: number;
  };
  verification_results: VerificationResult[];
  guardrail_report_ref: string | null;
  created_at: string;
  completed_at: string | null;
}

export const KIT_RUN_TRANSITIONS: Record<KitRunStatus, KitRunStatus[]> = {
  ready: ["executing", "cancelled"],
  executing: ["verifying", "blocked", "failed", "paused", "cancelled"],
  verifying: ["complete", "blocked", "failed"],
  blocked: ["executing", "failed", "cancelled"],
  failed: [],
  complete: [],
  paused: ["resuming", "cancelled"],
  cancelled: [],
  resuming: ["executing"],
};

export function isValidKitRunTransition(
  from: KitRunStatus,
  to: KitRunStatus,
): boolean {
  return KIT_RUN_TRANSITIONS[from].includes(to);
}
