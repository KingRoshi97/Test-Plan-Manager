import type { ActionRef, Pointer } from './common.js';

export interface RunStageRequest {
  run_id: string;
  stage_id: string;
}

export interface RunStageResponse {
  action: ActionRef;
  manifest: Pointer;
  stage_report: Pointer;
  gate_report?: Pointer;
  logs?: Pointer[];
}

export interface RerunStageRequest {
  run_id: string;
  stage_id: string;
}

export interface RerunStageResponse {
  action: ActionRef;
  manifest: Pointer;
  stage_report: Pointer;
  logs?: Pointer[];
}
