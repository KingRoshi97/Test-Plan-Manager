import type { RunSummary, Pointer } from '../schemas/common.js';

export async function listRuns(): Promise<RunSummary[]> {
  throw new Error('not implemented');
}

export interface RunDetailResult {
  run: RunSummary;
  manifest: Pointer;
  stage_reports: Pointer[];
  gate_reports: Pointer[];
}

export async function getRunDetail(_runId: string): Promise<RunDetailResult> {
  throw new Error('not implemented');
}
