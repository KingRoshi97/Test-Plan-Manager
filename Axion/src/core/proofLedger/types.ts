export interface ProofEntry {
  proof_id: string;
  run_id: string;
  gate_id: string;
  proof_type: string;
  timestamp: string;
  evidence: Record<string, unknown>;
  hash: string;
}

export type ProofType =
  | "test_result"
  | "review_approval"
  | "static_analysis"
  | "manual_attestation"
  | "automated_check";
