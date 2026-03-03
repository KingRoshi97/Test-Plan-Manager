import type { ActionRef, Pointer } from './common.js';

export interface VerifyRequest {
  run_id: string;
}

export interface VerifyResponse {
  action: ActionRef;
  verification_result: Pointer;
  proof_ledger?: Pointer;
  gate_report?: Pointer;
  logs: Pointer[];
}
