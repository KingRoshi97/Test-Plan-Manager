export interface MusBudgets {
  token_cap: number;
  time_cap_ms: number;
  max_findings: number;
  max_proposals: number;
  max_assets_touched: number;
}

export interface MusScope {
  asset_classes: string[];
  include_tags?: string[];
  exclude_tags?: string[];
  include_categories?: string[];
  exclude_categories?: string[];
}

export interface MusRun {
  run_id: string;
  mode_id: string;
  trigger: "manual" | "scheduled";
  scope: MusScope;
  budgets: MusBudgets;
  status: "created" | "running" | "completed" | "completed_with_limits" | "failed";
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
  limit_reasons?: string[];
  findings_count?: number;
  proposals_count?: number;
  pinned_versions?: Record<string, string>;
}

export interface MusFinding {
  finding_id: string;
  run_id: string;
  check_id: string;
  detector_pack_id: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  status: "open" | "acknowledged" | "suppressed" | "resolved";
  title: string;
  description: string;
  file_path?: string;
  json_pointer?: string;
  evidence_refs?: string[];
  created_at: string;
  updated_at: string;
}

export interface MusPatch {
  patch_id: string;
  patch_type_id: string;
  target_file: string;
  target_field?: string;
  description: string;
  current_value?: unknown;
  proposed_value?: unknown;
  diff_summary?: string;
}

export interface MusProposalPack {
  proposal_pack_id: string;
  run_id: string;
  detector_pack_id: string;
  risk_class: "safe" | "low" | "medium" | "high";
  confidence_score: number;
  impact_score: number;
  patches: MusPatch[];
  explain_why: string;
  evidence_refs: string[];
  created_at: string;
}

export interface MusBlastRadius {
  run_id: string;
  proposal_pack_ids: string[];
  affected_files: string[];
  affected_registries: string[];
  affected_asset_count: number;
  risk_summary: string;
  created_at: string;
}

export interface MusChangeSet {
  changeset_id: string;
  source_proposal_pack_id: string;
  selected_patch_ids: string[];
  patches: MusPatch[];
  summary: string;
  status: "draft" | "approved" | "applied" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface MusApprovalEvent {
  approval_id: string;
  approval_type: "apply" | "publish" | "waiver";
  target_type: "changeset" | "release";
  target_id: string;
  reason: string;
  diff_hash?: string;
  actor: string;
  created_at: string;
}

export interface MusSuppressionRule {
  suppression_id: string;
  finding_type: string;
  scope_selectors: Record<string, string>;
  reason: string;
  expires_at?: string;
  created_at: string;
}

export interface MusProofBundle {
  run_id: string;
  mode_id: string;
  detector_packs_executed: string[];
  checks_run: string[];
  files_pinned: Array<{ path: string; hash?: string }>;
  findings_count: number;
  proposals_count: number;
  budgets_used: Partial<MusBudgets>;
  budgets_allowed: MusBudgets;
  limit_reasons: string[];
  status: string;
  started_at: string;
  completed_at: string;
}

export interface MusValidationError {
  file: string;
  json_pointer: string;
  message: string;
}

export interface MusValidationResult {
  pass: boolean;
  errors: MusValidationError[];
  registries_checked: number;
  items_checked: number;
  checked_at: string;
}

export interface MusScheduleEntry {
  schedule_id: string;
  name: string;
  enabled: boolean;
  cron?: string;
  allowed_modes: string[];
  allowed_detector_packs: string[];
  budgets: Partial<MusBudgets>;
  blackout_windows?: Array<{ start: string; end: string }>;
  proposal_only: boolean;
  updated_at: string;
}

export interface RegistryEnvelope {
  registry_id: string;
  schema_version: string;
  registry_version: string;
  description?: string;
  items: Array<Record<string, unknown>>;
  active_map?: Record<string, string>;
  invariants?: string[];
  updated_at?: string;
}

export interface LedgerEntry {
  timestamp: string;
  event: string;
  actor: string;
  details: Record<string, unknown>;
}
