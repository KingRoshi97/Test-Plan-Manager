import { sha256 } from "../../utils/hash.js";
import type { ProofEntry, LedgerIntegrityReport, LedgerIssue, ProofType } from "./types.js";
import { PROOF_TYPE_REQUIRED_FIELDS } from "./types.js";

const VALID_PROOF_TYPES: ProofType[] = [
  "P-01", "P-02", "P-03", "P-04", "P-05", "P-06",
  "automated_check", "test_result", "review_approval",
  "static_analysis", "manual_attestation",
];

export function validateProofEntry(entry: ProofEntry): boolean {
  if (!entry.proof_id || !entry.run_id || !entry.gate_id || !entry.proof_type) {
    return false;
  }
  if (!entry.timestamp || !entry.hash) {
    return false;
  }
  if (typeof entry.evidence !== "object" || entry.evidence === null) {
    return false;
  }
  if (!VALID_PROOF_TYPES.includes(entry.proof_type)) {
    return false;
  }
  return true;
}

export function verifyProofHash(entry: ProofEntry): boolean {
  const expected = sha256(
    JSON.stringify({
      proofId: entry.proof_id,
      runId: entry.run_id,
      gate_id: entry.gate_id,
      evidence: entry.evidence,
      timestamp: entry.timestamp,
    }),
  );
  return entry.hash === expected;
}

export function validateEvidenceFields(entry: ProofEntry): string[] {
  const required = PROOF_TYPE_REQUIRED_FIELDS[entry.proof_type];
  if (!required) {
    return [];
  }
  const missing: string[] = [];
  for (const field of required) {
    if (!(field in entry.evidence)) {
      missing.push(field);
    }
  }
  return missing;
}

export function validateLedgerIntegrity(entries: ProofEntry[]): LedgerIntegrityReport {
  const issues: LedgerIssue[] = [];
  let valid = 0;
  let invalid = 0;
  let hashMismatches = 0;
  let missingFields = 0;

  for (const entry of entries) {
    const entryValid = validateProofEntry(entry);
    if (!entryValid) {
      invalid++;
      issues.push({ proof_id: entry.proof_id ?? "unknown", issue: "missing required fields" });
      missingFields++;
      continue;
    }

    const missingEvidence = validateEvidenceFields(entry);
    if (missingEvidence.length > 0) {
      issues.push({
        proof_id: entry.proof_id,
        issue: `missing evidence fields: ${missingEvidence.join(", ")}`,
      });
      missingFields++;
    }

    valid++;
  }

  return {
    total_entries: entries.length,
    valid_entries: valid,
    invalid_entries: invalid,
    hash_mismatches: hashMismatches,
    missing_fields: missingFields,
    details: issues,
  };
}
