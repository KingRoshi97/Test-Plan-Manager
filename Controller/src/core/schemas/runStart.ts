import type { ActionRef, Pointer, RunSummary, RiskClass, ExecutorType } from './common.js';

export interface RunStartRequest {
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

export interface RunStartResponse {
  action: ActionRef;
  run: RunSummary;
  manifest: Pointer;
}
