export interface ArtifactRef {
  artifact_id: string;
  path: string;
  type: string;
  hash?: string;
}

export interface ArtifactRecord {
  artifact_id: string;
  run_id: string;
  stage: string;
  path: string;
  type: string;
  hash: string;
  created_at: string;
  metadata?: Record<string, unknown>;
}

export type ArtifactPath =
  | "run_manifest.json"
  | "standards/resolved_standards_snapshot.json"
  | "canonical/canonical_spec.json"
  | "planning/work_breakdown.json"
  | "planning/acceptance_map.json"
  | "planning/sequencing_report.json"
  | `gates/${string}.gate_report.json`
  | "proof/proof_ledger.jsonl"
  | "verification/completion_report.json"
  | "kit/kit_manifest.json"
  | "kit/entrypoint.json"
  | "kit/version_stamp.json"
  | "state/state_snapshot.json"
  | "state/resume_plan.json"
  | "state/handoff_packet/";
