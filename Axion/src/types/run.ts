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
  | "S1_INGEST_NORMALIZE"
  | "S2_VALIDATE_INTAKE"
  | "S3_BUILD_CANONICAL"
  | "S4_VALIDATE_CANONICAL"
  | "S5_RESOLVE_STANDARDS"
  | "S6_SELECT_TEMPLATES"
  | "S7_RENDER_DOCS"
  | "S8_BUILD_PLAN"
  | "S9_VERIFY_PROOF"
  | "S10_PACKAGE";

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
  "S1_INGEST_NORMALIZE",
  "S2_VALIDATE_INTAKE",
  "S3_BUILD_CANONICAL",
  "S4_VALIDATE_CANONICAL",
  "S5_RESOLVE_STANDARDS",
  "S6_SELECT_TEMPLATES",
  "S7_RENDER_DOCS",
  "S8_BUILD_PLAN",
  "S9_VERIFY_PROOF",
  "S10_PACKAGE",
];

export const STAGE_GATES: Record<string, string> = {
  S2_VALIDATE_INTAKE: "G1_INTAKE_VALIDITY",
  S4_VALIDATE_CANONICAL: "G2_CANONICAL_INTEGRITY",
  S5_RESOLVE_STANDARDS: "G3_STANDARDS_RESOLVED",
  S6_SELECT_TEMPLATES: "G4_TEMPLATE_SELECTION",
  S7_RENDER_DOCS: "G5_TEMPLATE_COMPLETENESS",
  S8_BUILD_PLAN: "G6_PLAN_COVERAGE",
  S9_VERIFY_PROOF: "G7_VERIFICATION",
  S10_PACKAGE: "G8_PACKAGE_INTEGRITY",
};

export const GATES_REQUIRED: string[] = [
  "G1_INTAKE_VALIDITY",
  "G2_CANONICAL_INTEGRITY",
  "G3_STANDARDS_RESOLVED",
  "G4_TEMPLATE_SELECTION",
  "G5_TEMPLATE_COMPLETENESS",
  "G6_PLAN_COVERAGE",
  "G7_VERIFICATION",
  "G8_PACKAGE_INTEGRITY",
];

export const STAGE_NAMES: Record<StageId, string> = {
  S1_INGEST_NORMALIZE: "Ingest & Normalize",
  S2_VALIDATE_INTAKE: "Validate Intake",
  S3_BUILD_CANONICAL: "Build Canonical Spec",
  S4_VALIDATE_CANONICAL: "Validate Canonical Spec",
  S5_RESOLVE_STANDARDS: "Resolve Standards",
  S6_SELECT_TEMPLATES: "Select Templates",
  S7_RENDER_DOCS: "Render Docs",
  S8_BUILD_PLAN: "Build Plan",
  S9_VERIFY_PROOF: "Verify Proof",
  S10_PACKAGE: "Package Kit",
};

/** @deprecated Remove after one release. Temporary aliases for old stage IDs so existing run folders/commands still work. */
export const STAGE_ID_ALIASES: Record<string, StageId> = {
  S2_INTAKE_VALIDATION: "S2_VALIDATE_INTAKE",
  S3_STANDARDS_RESOLUTION: "S5_RESOLVE_STANDARDS",
  S4_CANONICAL_BUILD: "S3_BUILD_CANONICAL",
  S5_TEMPLATE_SELECTION: "S6_SELECT_TEMPLATES",
  S6_PLAN_GENERATION: "S8_BUILD_PLAN",
  S7_TEMPLATE_FILL: "S7_RENDER_DOCS",
  S9_KIT_PACKAGE: "S10_PACKAGE",
};

/** @deprecated Remove after one release. Resolves a raw stage ID string to the current StageId. Returns null for dropped stages (S0_INIT, S8_GATE_EVALUATION, S10_CLOSE). */
export function resolveStageId(raw: string): StageId | null {
  if ((STAGE_ORDER as readonly string[]).includes(raw)) {
    return raw as StageId;
  }
  if (raw in STAGE_ID_ALIASES) {
    return STAGE_ID_ALIASES[raw];
  }
  return null;
}
