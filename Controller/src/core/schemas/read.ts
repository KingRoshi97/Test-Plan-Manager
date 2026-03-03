import type { Pointer, RunSummary } from './common.js';

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
