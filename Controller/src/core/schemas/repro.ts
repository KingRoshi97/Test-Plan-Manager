import type { ActionRef, Pointer } from './common.js';

export interface ReproRequest {
  run_id: string;
}

export interface ReproResponse {
  action: ActionRef;
  repro_report: Pointer;
  diff_report?: Pointer;
  logs: Pointer[];
}
