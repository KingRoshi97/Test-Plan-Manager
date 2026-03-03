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
