import type { ActionRef, Pointer } from './common.js';

export interface DoctorRequest {
  [key: string]: never;
}

export interface DoctorResponse {
  action: ActionRef;
  report: Pointer;
  logs: Pointer[];
}
