export type RunStatus = "created" | "running" | "paused" | "completed" | "failed" | "cancelled";

export interface Run {
  run_id: string;
  status: RunStatus;
  created_at: string;
  updated_at: string;
  stages: StageRun[];
  config: Record<string, unknown>;
}

export interface StageRun {
  stage_id: string;
  name: string;
  status: RunStatus;
  started_at?: string;
  completed_at?: string;
  artifacts: ArtifactRef[];
  proofs: ProofRef[];
  errors: string[];
}

export interface ArtifactRef {
  artifact_id: string;
  path: string;
  type: string;
  hash?: string;
}

export interface ProofRef {
  proof_id: string;
  type: string;
  gate_id: string;
  timestamp: string;
}
