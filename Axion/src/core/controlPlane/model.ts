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
  | "created"
  | "queued"
  | "running"
  | "paused"
  | "gated"
  | "failed"
  | "completed"
  | "cancelled"
  | "archived";

export type ICPStageStatus =
  | "not_started"
  | "in_progress"
  | "pass"
  | "fail"
  | "skip";

export const ICP_TO_MANIFEST_RUN_STATUS: Record<ICPRunStatus, ManifestRunStatus> = {
  created: "created",
  queued: "created",
  running: "running",
  paused: "paused",
  gated: "paused",
  failed: "failed",
  completed: "completed",
  cancelled: "cancelled",
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
  version: number;
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
  system_profile?: string;
  quota_set?: string;
  pipeline_ref?: {
    pipeline_id: string;
    version: string;
    source: string;
  };
}

export type AuditActionCategory = "lifecycle" | "governance" | "evidence";

export interface AuditEntry {
  timestamp: string;
  action: string;
  category: AuditActionCategory;
  run_id: string;
  actor: string;
  details: Record<string, unknown>;
  prev_hash: string;
  hash: string;
}

export type PinScope = "run" | "global";
export type PinClass = "standard" | "immutable";

export interface PinRecord {
  pin_id: string;
  artifact_id: string;
  artifact_path: string;
  pinned_at: string;
  pinned_by: string;
  reason?: string;
  hash: string;
  scope: PinScope;
  pin_class: PinClass;
}

export interface ReleasePublishRequest {
  release_id: string;
  signer: string;
  policy_check_required: boolean;
  authorized_signers?: string[];
}

export interface PolicySnapshotRecord {
  snapshot_id: string;
  run_id: string;
  captured_at: string;
  policies: Array<{
    policy_id: string;
    version: string;
    enforcement: string;
    rule_count: number;
  }>;
}

export const RUN_STATUS_TERMINAL: ICPRunStatus[] = ["completed", "cancelled", "archived"];
export const RUN_STATUS_ACTIVE: ICPRunStatus[] = ["queued", "running", "paused", "gated"];
export const STAGE_STATUS_TERMINAL: ICPStageStatus[] = ["pass", "fail", "skip"];

export function icpRunToManifest(icp: ICPRun): RunManifest {
  const manifest: RunManifest = {
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
  const cfgMeta = manifest.config as Record<string, unknown>;
  if (icp.system_profile) cfgMeta.__system_profile = icp.system_profile;
  if (icp.quota_set) cfgMeta.__quota_set = icp.quota_set;
  if (icp.pipeline_ref) cfgMeta.__pipeline_ref = icp.pipeline_ref;
  if (icp.version !== undefined) cfgMeta.__version = icp.version;
  cfgMeta.__icp_status = icp.icp_status;
  return manifest;
}

export function manifestToICPRun(manifest: RunManifest): ICPRun {
  const reverseRunStatus: Record<ManifestRunStatus, ICPRunStatus> = {
    created: "queued",
    running: "running",
    paused: "gated",
    failed: "failed",
    completed: "completed",
    cancelled: "cancelled",
  };

  const reverseStageStatus: Record<StageStatus, ICPStageStatus> = {
    queued: "not_started",
    running: "in_progress",
    pass: "pass",
    fail: "fail",
    skipped: "skip",
  };

  const cfg = manifest.config as Record<string, unknown>;
  const storedIcpStatus = cfg.__icp_status as ICPRunStatus | undefined;
  const resolvedStatus = storedIcpStatus ?? reverseRunStatus[manifest.status];
  return {
    run_id: manifest.run_id,
    icp_status: resolvedStatus,
    created_at: manifest.created_at,
    updated_at: manifest.updated_at,
    version: (cfg.__version as number) ?? 1,
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
    system_profile: (cfg.__system_profile as string) ?? undefined,
    quota_set: (cfg.__quota_set as string) ?? undefined,
    pipeline_ref: (cfg.__pipeline_ref as { pipeline_id: string; version: string; source: string }) ?? undefined,
  };
}

export type { RunManifest, ManifestStageRun, StageId, StageStatus, ManifestRunStatus, GateReportRef, RunError, ArtifactRef };

export interface RunTransitionRequest {
  run_id: string;
  current_status: ICPRunStatus;
  proposed_status: ICPRunStatus;
  actor?: string;
  reason?: string;
}

export interface TransitionValidationResult {
  valid: boolean;
  from: ICPRunStatus | ICPStageStatus;
  to: ICPRunStatus | ICPStageStatus;
  rejection_reason?: string;
}

export interface PolicyEvaluationResult {
  policy_id: string;
  passed: boolean;
  violations: Array<{
    rule_id: string;
    action: "deny" | "warn";
    message: string;
    context: Record<string, unknown>;
  }>;
  stage_id?: string;
  evidence_satisfied?: boolean;
}

export interface ProofRef {
  proof_id: string;
  type: string;
  gate_id: string;
  timestamp: string;
}
