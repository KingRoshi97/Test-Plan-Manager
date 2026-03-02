import type { ArtifactRef } from "./artifacts.js";

export type RunStatus =
  | "created"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "cancelled";

export type StageStatus = "queued" | "running" | "pass" | "fail" | "skipped";

export type StageId =
  | "S0_INIT"
  | "S1_INGEST_NORMALIZE"
  | "S2_INTAKE_VALIDATION"
  | "S3_STANDARDS_RESOLUTION"
  | "S4_CANONICAL_BUILD"
  | "S5_TEMPLATE_SELECTION"
  | "S6_PLAN_GENERATION"
  | "S7_TEMPLATE_FILL"
  | "S8_GATE_EVALUATION"
  | "S9_KIT_PACKAGE"
  | "S10_CLOSE";

export interface StageRun {
  stage_id: StageId;
  status: StageStatus;
  stage_report_ref: string | null;
}

export interface StageNote {
  level: "info" | "warn" | "error";
  message: string;
}

export interface StageReport {
  run_id: string;
  stage_id: StageId;
  status: StageStatus;
  started_at: string;
  finished_at: string;
  consumed: string[];
  produced: string[];
  gate_reports: string[];
  notes: StageNote[];
}

export interface GateReportRef {
  gate_id: string;
  path: string;
  verdict: string;
}

export interface RunError {
  stage_id: StageId;
  message: string;
  timestamp: string;
}

export interface RunManifest {
  run_id: string;
  status: RunStatus;
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
  stages: StageRun[];
  stage_gates: Record<string, string>;
  gates_required: string[];
  gate_reports: GateReportRef[];
  artifact_index_ref: string;
  errors: RunError[];
  policy_snapshot_ref: string | null;
  config: Record<string, unknown>;
}

export const STAGE_ORDER: StageId[] = [
  "S0_INIT",
  "S1_INGEST_NORMALIZE",
  "S2_INTAKE_VALIDATION",
  "S3_STANDARDS_RESOLUTION",
  "S4_CANONICAL_BUILD",
  "S5_TEMPLATE_SELECTION",
  "S6_PLAN_GENERATION",
  "S7_TEMPLATE_FILL",
  "S8_GATE_EVALUATION",
  "S9_KIT_PACKAGE",
  "S10_CLOSE",
];

export const STAGE_GATES: Record<string, string> = {
  S2_INTAKE_VALIDATION: "G1_INTAKE_VALIDITY",
  S4_CANONICAL_BUILD: "G2_CANONICAL_INTEGRITY",
  S3_STANDARDS_RESOLUTION: "G3_STANDARDS_RESOLVED",
  S5_TEMPLATE_SELECTION: "G4_TEMPLATE_SELECTION",
  S7_TEMPLATE_FILL: "G5_TEMPLATE_COMPLETENESS",
  S6_PLAN_GENERATION: "G6_PLAN_COVERAGE",
  S8_GATE_EVALUATION: "G7_VERIFICATION",
  S9_KIT_PACKAGE: "G8_PACKAGE_INTEGRITY",
};

export const GATES_REQUIRED: string[] = [
  "G1_INTAKE_VALIDITY",
  "G2_CANONICAL_INTEGRITY",
  "G3_STANDARDS_RESOLVED",
  "G6_PLAN_COVERAGE",
  "G8_PACKAGE_INTEGRITY",
];

export const STAGE_NAMES: Record<StageId, string> = {
  S0_INIT: "Initialize Run",
  S1_INGEST_NORMALIZE: "Ingest & Normalize",
  S2_INTAKE_VALIDATION: "Intake Validation",
  S3_STANDARDS_RESOLUTION: "Standards Resolution",
  S4_CANONICAL_BUILD: "Canonical Build",
  S5_TEMPLATE_SELECTION: "Template Selection",
  S6_PLAN_GENERATION: "Plan Generation",
  S7_TEMPLATE_FILL: "Template Fill",
  S8_GATE_EVALUATION: "Gate Evaluation",
  S9_KIT_PACKAGE: "Kit Package",
  S10_CLOSE: "Close",
};
