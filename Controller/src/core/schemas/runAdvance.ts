import type { ActionRef, Pointer, RunSummary } from './common.js';

export interface RunAdvanceRequest {
  run_id: string;
}

export interface RunAdvanceResponse {
  action: ActionRef;
  run: RunSummary;
  manifest: Pointer;
  stage_report?: Pointer;
  gate_report?: Pointer;
  logs?: Pointer[];
}
