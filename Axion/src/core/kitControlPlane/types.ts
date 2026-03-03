import type {
  KitRunState,
  WorkUnitState,
  EvidencePointer,
  RemediationStep,
  GuardrailViolation,
  GuardrailReport,
  CommandResult,
  VerificationPolicy,
} from "../../types/controlPlane.js";

export type { KitRunState, WorkUnitState, GuardrailViolation, GuardrailReport, CommandResult, VerificationPolicy };

export interface KitValidationReport {
  kit_id: string;
  status: "VALID" | "INVALID";
  checks: Array<{
    check_id: string;
    description: string;
    status: "pass" | "fail";
    message?: string;
  }>;
  validated_at: string;
}

export interface PlanUnit {
  unit_id: string;
  target: string;
  description: string;
  dependencies: string[];
  acceptance_criteria: string[];
  verification_commands?: string[];
}

export interface UnitStatusEntry {
  unit_id: string;
  state: WorkUnitState;
  attempt_id: string;
  started_at: string | null;
  completed_at: string | null;
  prior_attempt_refs: string[];
}

export interface UnitStatusIndex {
  kit_id: string;
  units: Record<string, UnitStatusEntry>;
  updated_at: string;
}

export interface ResultFile {
  unit_id: string;
  status: "DONE" | "FAILED" | "SKIPPED";
  implementation_refs: EvidencePointer[];
  proof_refs: EvidencePointer[];
  notes?: string;
  created_at: string;
}

export interface VerificationRunResult {
  kit_id: string;
  command_results: CommandResult[];
  overall_status: "PASS" | "FAIL";
  executed_at: string;
}

export interface KitProofObject {
  proof_id: string;
  proof_type: string;
  unit_id: string;
  target: string;
  source: EvidencePointer;
  hash: string;
  captured_at: string;
}

export interface KitRunReport {
  kit_id: string;
  run_id: string;
  state: KitRunState;
  state_transitions: KitRunState[];
  validation: KitValidationReport;
  unit_summary: {
    total: number;
    done: number;
    failed: number;
    skipped: number;
    not_started: number;
    in_progress: number;
  };
  results: ResultFile[];
  verification: VerificationRunResult | null;
  proof_count: number;
  guardrails: GuardrailReport | null;
  remediation?: {
    what_failed: string;
    why: string;
    next_steps: RemediationStep[];
    evidence: EvidencePointer[];
  };
  created_at: string;
  updated_at: string;
}
