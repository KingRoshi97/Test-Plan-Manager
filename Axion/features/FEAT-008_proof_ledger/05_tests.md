# FEAT-008 — Proof Ledger: Test Plan

## 1. Unit Tests

### 1.1 ProofLedger Class

- `append()` — creates ProofEntry with correct proof_id, hash, timestamp; appends to JSONL file
- `append()` — acceptance_refs defaults to empty array
- `appendProofObject()` — converts ProofObject to ProofEntry and appends
- `load()` — reads all entries from JSONL file
- `query()` — filters by run_id, gate_id, proof_type, acceptance_ref
- `getById()` — returns matching entry or undefined
- `getByRun()` — returns all entries for a run
- `getByGate()` — returns all entries for a gate
- `getCoverage()` — returns covered/uncovered/coverage ratio

### 1.2 Registry Functions

- `loadProofEntries()` — returns empty array for missing file
- `loadProofEntries()` — skips malformed JSONL lines
- `filterProofsByGate()` — filters correctly
- `filterProofsByRun()` — filters correctly
- `filterProofsByType()` — filters by ProofType
- `filterProofsByAcceptanceRef()` — matches entries containing the ref
- `queryProofs()` — combines multiple filters
- `getProofById()` — finds by proof_id
- `getAcceptanceCoverage()` — computes correct coverage ratio

### 1.3 Validation Functions

- `validateProofEntry()` — returns true for valid entries
- `validateProofEntry()` — returns false for missing proof_id, run_id, gate_id, proof_type, timestamp, hash
- `validateProofEntry()` — returns false for invalid proof_type
- `verifyProofHash()` — returns true for matching hash
- `verifyProofHash()` — returns false for tampered entry
- `validateEvidenceFields()` — returns empty array when all required fields present
- `validateEvidenceFields()` — returns missing field names for P-01..P-06
- `validateLedgerIntegrity()` — returns LedgerIntegrityReport with correct counts

### 1.4 Proof Creation Functions

- `createProofFromGateReport()` — creates ProofObject with automated_check type
- `createProofsFromGateReports()` — maps array of reports
- `createCommandOutputProof()` — creates P-01 proof with required evidence fields
- `createTestResultProof()` — creates P-02 proof; pass when failed=0
- `createDiffCommitProof()` — creates P-05 proof with files_changed list
- `createChecklistProof()` — creates P-06 proof; pass only when all items pass

### 1.5 Registry Loader

- `loadProofTypeRegistry()` — loads from registries/PROOF_TYPE_REGISTRY.json
- `getEvidencePolicies()` — returns all 8 gate policies
- `getRequiredProofTypes()` — returns correct types for each gate ID
- `getRequiredProofTypes()` — returns empty array for unknown gate ID

## 2. Integration Tests

- Append multiple proofs → load → query by different criteria → verify all returned
- Create proofs from gate reports → append to ledger → validate integrity → verify all pass
- Coverage computation with partial acceptance refs → verify correct ratio

## 3. Test Infrastructure

- Framework: Vitest
- Fixtures: `test/fixtures/` (sample JSONL ledger files, gate reports)
- Helpers: `test/helpers/` (temp directory creation, sample entry builders)
