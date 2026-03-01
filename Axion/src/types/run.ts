import type { ArtifactRef } from "./artifacts.js";

export type RunStatus =
  | "created"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export interface StageRun {
  stage_id: string;
  name: string;
  status: RunStatus;
  started_at?: string;
  completed_at?: string;
  artifacts: ArtifactRef[];
  errors: string[];
}

export interface RunManifest {
  run_id: string;
  status: RunStatus;
  created_at: string;
  updated_at: string;
  stages: StageRun[];
  config: Record<string, unknown>;
}
