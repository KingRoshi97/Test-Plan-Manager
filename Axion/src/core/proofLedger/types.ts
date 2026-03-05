export interface ProofEntry {
  proof_id: string;
  run_id: string;
  gate_id: string;
  proof_type: ProofType;
  timestamp: string;
  evidence: Record<string, unknown>;
  hash: string;
  acceptance_refs: string[];
}

export type ProofType =
  | "P-01"
  | "P-02"
  | "P-03"
  | "P-04"
  | "P-05"
  | "P-06"
  | "automated_check"
  | "test_result"
  | "review_approval"
  | "static_analysis"
  | "manual_attestation";

export const PROOF_TYPE_LABELS: Record<string, string> = {
  "P-01": "Command Output Proof",
  "P-02": "Test Result Proof",
  "P-03": "Screenshot / UI Capture Proof",
  "P-04": "Log Excerpt Proof",
  "P-05": "Diff/Commit Reference Proof",
  "P-06": "Checklist Proof (Manual Verification)",
  "automated_check": "Automated Check",
  "test_result": "Test Result",
  "review_approval": "Review Approval",
  "static_analysis": "Static Analysis",
  "manual_attestation": "Manual Attestation",
};

export const PROOF_TYPE_REQUIRED_FIELDS: Record<string, string[]> = {
  "P-01": ["command", "working_directory", "exit_code", "timestamp"],
  "P-02": ["test_command", "pass_fail_summary", "report_location", "timestamp"],
  "P-03": ["screenshot_file_ref", "description", "timestamp", "context"],
  "P-04": ["log_source", "excerpt_pointer", "timestamp", "correlation"],
  "P-05": ["diff_commit_ref", "files_changed", "timestamp", "proves"],
  "P-06": ["checklist_id", "itemized_results", "reviewer", "timestamp"],
};

export interface ProofQuery {
  run_id?: string;
  gate_id?: string;
  proof_type?: ProofType;
  acceptance_ref?: string;
}

export interface LedgerIntegrityReport {
  total_entries: number;
  valid_entries: number;
  invalid_entries: number;
  hash_mismatches: number;
  missing_fields: number;
  details: LedgerIssue[];
}

export interface LedgerIssue {
  proof_id: string;
  issue: string;
}
