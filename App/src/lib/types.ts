export type OutcomeStatus = 'PASS' | 'FAIL' | 'ERROR';

export type RunStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'GATED'
  | 'FAILED'
  | 'RELEASED'
  | 'ARCHIVED'
  | 'PAUSED'
  | 'CANCELLED';

export type StageStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'PASS'
  | 'FAIL'
  | 'SKIP';

export type RiskClass = 'prototype' | 'production' | 'compliance';

export type ExecutorType = 'internal' | 'external';

export type PointerKind = 'artifact' | 'log';

export interface Pointer {
  kind: PointerKind;
  path: string;
}

export interface ActionRef {
  action_id: string;
  timestamp: string;
  action_type: string;
  outcome: OutcomeStatus;
}

export interface RunSummary {
  run_id: string;
  status: RunStatus;
  mode_id?: string;
  run_profile_id?: string;
  risk_class?: RiskClass;
  current_stage?: string;
  updated_at: string;
}

export interface DoctorRequest {
  [key: string]: never;
}

export interface StartRunRequest {
  mode_id?: string;
  run_profile_id?: string;
  risk_class: RiskClass;
  executor_type_default: ExecutorType;
  targets: {
    platforms: string[];
    domains?: string[];
    stack?: Record<string, string>;
  };
}

export interface AdvanceRunRequest {
  run_id: string;
}

export interface RunStageRequest {
  run_id: string;
  stage_id: string;
}

export interface RerunStageRequest {
  run_id: string;
  stage_id: string;
}

export interface CloseRunRequest {
  run_id: string;
}

export interface VerifyRequest {
  run_id: string;
}

export interface PackRequest {
  run_id: string;
  kit_variant: ExecutorType;
}

export interface ReproRequest {
  run_id: string;
}

export interface ArtifactReadRequest {
  path: string;
}

export interface LogReadRequest {
  path: string;
  tail?: boolean;
  full?: boolean;
}

export interface DoctorResponse {
  action: ActionRef;
  report: Pointer;
  logs: Pointer[];
}

export interface StartRunResponse {
  action: ActionRef;
  run: RunSummary;
  manifest: Pointer;
}

export interface AdvanceRunResponse {
  action: ActionRef;
  run: RunSummary;
  manifest: Pointer;
  stage_report?: Pointer;
  gate_report?: Pointer;
  logs?: Pointer[];
}

export interface RunStageResponse {
  action: ActionRef;
  manifest: Pointer;
  stage_report: Pointer;
  gate_report?: Pointer;
  logs?: Pointer[];
}

export interface VerifyResponse {
  action: ActionRef;
  verification_result: Pointer;
  proof_ledger?: Pointer;
  gate_report?: Pointer;
  logs: Pointer[];
}

export interface PackResponse {
  action: ActionRef;
  kit: { kit_id: string; variant: ExecutorType };
  kit_manifest: Pointer;
  kit_entrypoint: Pointer;
  bundle_metadata: Pointer;
  bundle_export: Pointer;
  logs: Pointer[];
}

export interface ReproResponse {
  action: ActionRef;
  repro_report: Pointer;
  diff_report?: Pointer;
  logs: Pointer[];
}

export interface RunsListResponse {
  runs: RunSummary[];
}

export interface RunDetailResponse {
  run: RunSummary;
  manifest: Pointer;
  stage_reports: Pointer[];
  gate_reports: Pointer[];
}

export interface ArtifactReadResponse {
  path: string;
  content_type: string;
  content: unknown;
}

export interface LogReadResponse {
  path: string;
  content_type: string;
  tail: boolean;
  content: string;
}
