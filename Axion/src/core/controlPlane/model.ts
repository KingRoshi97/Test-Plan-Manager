import type {
  RunManifest,
  StageRun as ManifestStageRun,
  StageId,
  StageStatus,
  RunStatus as ManifestRunStatus,
  GateReportRef,
  RunError,
} from "../../types/run.js";
import type { ArtifactRef } from "../../types/artifacts.js";

export type ICPRunStatus =
  | "queued"
  | "running"
  | "gated"
  | "failed"
  | "released"
  | "archived";

export type ICPStageStatus =
  | "not_started"
  | "in_progress"
  | "pass"
  | "fail"
  | "skip";

export const ICP_TO_MANIFEST_RUN_STATUS: Record<ICPRunStatus, ManifestRunStatus> = {
  queued: "created",
  running: "running",
  gated: "paused",
  failed: "failed",
  released: "completed",
  archived: "completed",
};

export const ICP_TO_MANIFEST_STAGE_STATUS: Record<ICPStageStatus, StageStatus> = {
  not_started: "queued",
  in_progress: "running",
  pass: "pass",
  fail: "fail",
  skip: "skipped",
};

export interface ICPStageRun {
  stage_id: StageId;
  icp_status: ICPStageStatus;
  stage_report_ref: string | null;
}

export interface ICPRun {
  run_id: string;
  icp_status: ICPRunStatus;
  created_at: string;
  updated_at: string;
  pipeline: {
    pipeline_id: string;
    pipeline_version: string;
  };
  profile: {
    profile_id: string;
  };
  stage_order: StageId[];
  stages: ICPStageRun[];
  stage_gates: Record<string, string>;
  gates_required: string[];
  gate_reports: GateReportRef[];
  artifact_index_ref: string;
  errors: RunError[];
  policy_snapshot_ref: string | null;
  config: Record<string, unknown>;
}

export function icpRunToManifest(icp: ICPRun): RunManifest {
  return {
    run_id: icp.run_id,
    status: ICP_TO_MANIFEST_RUN_STATUS[icp.icp_status],
    created_at: icp.created_at,
    updated_at: icp.updated_at,
    pipeline: icp.pipeline,
    profile: icp.profile,
    stage_order: icp.stage_order,
    stages: icp.stages.map(
      (s): ManifestStageRun => ({
        stage_id: s.stage_id,
        status: ICP_TO_MANIFEST_STAGE_STATUS[s.icp_status],
        stage_report_ref: s.stage_report_ref,
      }),
    ),
    stage_gates: icp.stage_gates,
    gates_required: icp.gates_required,
    gate_reports: icp.gate_reports,
    artifact_index_ref: icp.artifact_index_ref,
    errors: icp.errors,
    policy_snapshot_ref: icp.policy_snapshot_ref,
    config: icp.config,
  };
}

export function manifestToICPRun(manifest: RunManifest): ICPRun {
  const reverseRunStatus: Record<ManifestRunStatus, ICPRunStatus> = {
    created: "queued",
    running: "running",
    paused: "gated",
    failed: "failed",
    completed: "released",
    cancelled: "failed",
  };

  const reverseStageStatus: Record<StageStatus, ICPStageStatus> = {
    queued: "not_started",
    running: "in_progress",
    pass: "pass",
    fail: "fail",
    skipped: "skip",
  };

  return {
    run_id: manifest.run_id,
    icp_status: reverseRunStatus[manifest.status],
    created_at: manifest.created_at,
    updated_at: manifest.updated_at,
    pipeline: manifest.pipeline,
    profile: manifest.profile,
    stage_order: manifest.stage_order,
    stages: manifest.stages.map(
      (s): ICPStageRun => ({
        stage_id: s.stage_id,
        icp_status: reverseStageStatus[s.status],
        stage_report_ref: s.stage_report_ref,
      }),
    ),
    stage_gates: manifest.stage_gates,
    gates_required: manifest.gates_required,
    gate_reports: manifest.gate_reports,
    artifact_index_ref: manifest.artifact_index_ref,
    errors: manifest.errors,
    policy_snapshot_ref: manifest.policy_snapshot_ref,
    config: manifest.config,
  };
}

export type { RunManifest, ManifestStageRun, StageId, StageStatus, ManifestRunStatus, GateReportRef, RunError, ArtifactRef };

export interface ProofRef {
  proof_id: string;
  type: string;
  gate_id: string;
  timestamp: string;
}
