# FEAT-008 — Proof Ledger: Contract

## 1. Purpose

Append-only proof recording system that stores evidence entries linked to acceptance criteria and gates. Creates proof objects from gate reports (automated) or from manual evidence (P-01 through P-06), persists them as JSONL, and provides querying and integrity validation.

## 2. Inputs

- Gate reports (`GateReportV1`) for automated proof creation
- Manual proof evidence: command outputs (P-01), test results (P-02), screenshots (P-03), log excerpts (P-04), diff/commit references (P-05), checklist results (P-06)
- Run ID, gate ID, acceptance references
- Ledger file path (`.jsonl` format)

## 3. Outputs

- `ProofEntry` objects appended to JSONL ledger file
- `ProofObject` objects with pass/fail status and SHA-256 hash
- `LedgerIntegrityReport` with validation results
- Query results filtered by run, gate, proof type, or acceptance reference
- Acceptance coverage reports (covered vs uncovered refs)

## 4. Invariants

- Proof entries are append-only — no deletion or mutation of the JSONL file
- Every proof entry contains: `proof_id`, `run_id`, `gate_id`, `proof_type`, `timestamp`, `evidence`, `hash`, `acceptance_refs`
- `proof_id` is deterministic: `proof_${sha256(runId + gateId + timestamp).slice(0, 12)}`
- `hash` is SHA-256 of `{ proofId, runId, gate_id, evidence, timestamp }`
- Proof types are restricted to the VER-01 taxonomy (P-01..P-06) plus system types (automated_check, test_result, review_approval, static_analysis, manual_attestation)
- P-01 through P-06 proof types enforce required evidence fields per VER-01
- Narrative statements are never accepted as proof

## 5. Dependencies

- FEAT-001 (Control Plane Core) — provides run context and state
- FEAT-003 (Gate Engine Core) — provides `GateReportV1` for automated proof creation

## 6. Source Modules

- `src/core/proofLedger/ledger.ts` — `ProofLedger` class with append, query, and coverage methods
- `src/core/proofLedger/registry.ts` — JSONL loading, filtering, querying, acceptance coverage
- `src/core/proofLedger/validate.ts` — entry validation, hash verification, evidence field checks, integrity reports
- `src/core/proofLedger/types.ts` — `ProofEntry`, `ProofType`, `ProofQuery`, `LedgerIntegrityReport`, proof type metadata
- `src/core/proofLedger/index.ts` — barrel exports
- `src/core/proof/create.ts` — `ProofObject` creation from gate reports and manual evidence
- `src/core/proof/registryLoader.ts` — proof type registry loading and evidence policies

## 7. Failure Modes

- Ledger file not writable (disk full, permissions) — `appendJsonl` throws
- Malformed JSONL lines — silently skipped during load (graceful degradation)
- Proof type not in valid set — `validateProofEntry` returns false
- Missing required evidence fields for P-01..P-06 — `validateEvidenceFields` returns missing list
- Proof not linked to acceptance_refs — allowed but reduces coverage score

## 8. Cross-References

- VER-01 (Proof Types & Evidence Rules) — defines P-01..P-06 taxonomy
- VER-03 (Completion Criteria)
- SYS-06 (Data & Traceability Model)
- SYS-07 (Compliance & Gate Model)
- PLAN-02 (Acceptance Map Rules) — acceptance_refs link proofs to acceptance items
