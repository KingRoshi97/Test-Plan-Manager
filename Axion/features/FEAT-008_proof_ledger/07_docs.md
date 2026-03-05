# FEAT-008 — Proof Ledger: Documentation Requirements

## 1. API Documentation

- `ProofLedger` class: constructor(ledgerPath), append(), appendProofObject(), load(), query(), getById(), getByRun(), getByGate(), getCoverage()
- Registry functions: loadProofEntries(), filterProofsByGate/Run/Type/AcceptanceRef(), queryProofs(), getProofById(), getAcceptanceCoverage()
- Validation functions: validateProofEntry(), verifyProofHash(), validateEvidenceFields(), validateLedgerIntegrity()
- Proof creators: createProofFromGateReport(), createProofsFromGateReports(), createCommandOutputProof(), createTestResultProof(), createDiffCommitProof(), createChecklistProof()
- Registry loader: loadProofTypeRegistry(), getEvidencePolicies(), getRequiredProofTypes()

## 2. Architecture Documentation

- Data flow: Gate Reports → proof/create.ts → ProofObject → proofLedger/ledger.ts → JSONL file
- Query flow: JSONL file → proofLedger/registry.ts → filtered ProofEntry[]
- Validation flow: ProofEntry[] → proofLedger/validate.ts → LedgerIntegrityReport
- Integration: FEAT-003 (Gate Engine) produces GateReportV1 → FEAT-008 creates proof → FEAT-014 (Coverage) consumes proofs

## 3. Type Reference

- `ProofEntry` — core ledger record (proof_id, run_id, gate_id, proof_type, timestamp, evidence, hash, acceptance_refs)
- `ProofObject` — extended proof with status (pass/fail) and created_at
- `ProofType` — union of P-01..P-06 and system types
- `ProofQuery` — query filter object (run_id?, gate_id?, proof_type?, acceptance_ref?)
- `LedgerIntegrityReport` — validation summary (total, valid, invalid, hash_mismatches, missing_fields, details)
- `PROOF_TYPE_LABELS` — human-readable names for each proof type
- `PROOF_TYPE_REQUIRED_FIELDS` — required evidence fields per P-01..P-06

## 4. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
