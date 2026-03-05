# FEAT-008 — Proof Ledger: API Surface

## 1. Module Exports

### `src/core/proofLedger/index.ts` (barrel)

Re-exports all public API from sub-modules.

### `src/core/proofLedger/ledger.ts`

#### `class ProofLedger`

- **Constructor**: `new ProofLedger(ledgerPath: string)`
- **`append(runId: string, gateId: string, proofType: ProofType, evidence: Record<string, unknown>, acceptanceRefs?: string[]): ProofEntry`** — Creates and appends a proof entry to the JSONL ledger. Generates deterministic proof_id and SHA-256 hash.
- **`appendProofObject(proof: { proof_id, run_id, gate_id, proof_type, status, created_at, acceptance_refs, evidence, hash }): ProofEntry`** — Appends a pre-built ProofObject to the ledger.
- **`load(): ProofEntry[]`** — Reads all entries from the JSONL file.
- **`query(q: ProofQuery): ProofEntry[]`** — Filters entries by run_id, gate_id, proof_type, acceptance_ref.
- **`getById(proofId: string): ProofEntry | undefined`** — Finds a single entry by proof_id.
- **`getByRun(runId: string): ProofEntry[]`** — Returns all entries for a run.
- **`getByGate(gateId: string): ProofEntry[]`** — Returns all entries for a gate.
- **`getCoverage(requiredAcceptanceRefs: string[]): { covered: string[]; uncovered: string[]; coverage: number }`** — Computes acceptance coverage.

### `src/core/proofLedger/registry.ts`

- **`loadProofEntries(ledgerPath: string): ProofEntry[]`** — Parses JSONL file, skips malformed lines.
- **`filterProofsByGate(entries: ProofEntry[], gateId: string): ProofEntry[]`**
- **`filterProofsByRun(entries: ProofEntry[], runId: string): ProofEntry[]`**
- **`filterProofsByType(entries: ProofEntry[], proofType: ProofType): ProofEntry[]`**
- **`filterProofsByAcceptanceRef(entries: ProofEntry[], acceptanceRef: string): ProofEntry[]`**
- **`queryProofs(entries: ProofEntry[], query: ProofQuery): ProofEntry[]`** — Multi-filter query.
- **`getProofById(entries: ProofEntry[], proofId: string): ProofEntry | undefined`**
- **`getAcceptanceCoverage(entries: ProofEntry[], requiredAcceptanceRefs: string[]): { covered, uncovered, coverage }`**

### `src/core/proofLedger/validate.ts`

- **`validateProofEntry(entry: ProofEntry): boolean`** — Checks required fields and valid proof type.
- **`verifyProofHash(entry: ProofEntry): boolean`** — Recomputes SHA-256 hash and compares.
- **`validateEvidenceFields(entry: ProofEntry): string[]`** — Returns list of missing required evidence fields for P-01..P-06.
- **`validateLedgerIntegrity(entries: ProofEntry[]): LedgerIntegrityReport`** — Full integrity report.

### `src/core/proof/create.ts`

- **`createProofFromGateReport(report: GateReportV1, runId: string, acceptanceRefs?: string[]): ProofObject`** — Creates automated_check proof from gate report.
- **`createProofsFromGateReports(reports: GateReportV1[], runId: string): ProofObject[]`** — Batch creation.
- **`createCommandOutputProof(runId, gateId, command, workingDirectory, exitCode, output, acceptanceRefs?): ProofObject`** — P-01 proof.
- **`createTestResultProof(runId, gateId, testCommand, passed, failed, reportLocation, acceptanceRefs?): ProofObject`** — P-02 proof.
- **`createDiffCommitProof(runId, gateId, diffCommitRef, filesChanged, proves, acceptanceRefs?): ProofObject`** — P-05 proof.
- **`createChecklistProof(runId, gateId, checklistId, items, reviewer, acceptanceRefs?): ProofObject`** — P-06 proof.

### `src/core/proof/registryLoader.ts`

- **`loadProofTypeRegistry(baseDir: string): ProofTypeRegistry`** — Loads PROOF_TYPE_REGISTRY.json.
- **`getEvidencePolicies(): EvidencePolicy[]`** — Returns gate-to-proof-type mappings for all 8 gates.
- **`getRequiredProofTypes(gateId: string): string[]`** — Returns required proof types for a gate.

## 2. Types

- `ProofEntry` — `{ proof_id, run_id, gate_id, proof_type, timestamp, evidence, hash, acceptance_refs }`
- `ProofObject` — extends with `status: "pass" | "fail"` and `created_at`
- `ProofType` — `"P-01" | "P-02" | "P-03" | "P-04" | "P-05" | "P-06" | "automated_check" | "test_result" | "review_approval" | "static_analysis" | "manual_attestation"`
- `ProofQuery` — `{ run_id?, gate_id?, proof_type?, acceptance_ref? }`
- `LedgerIntegrityReport` — `{ total_entries, valid_entries, invalid_entries, hash_mismatches, missing_fields, details }`
- `LedgerIssue` — `{ proof_id, issue }`
- `ProofTypeEntry` — `{ proof_type, version, required_fields, description }`
- `ProofTypeRegistry` — `{ $schema, description, entries }`
- `EvidencePolicy` — `{ gate_id, required_proof_types }`

## 3. Constants

- `PROOF_TYPE_LABELS` — Human-readable names for all proof types
- `PROOF_TYPE_REQUIRED_FIELDS` — Required evidence fields per P-01..P-06
- `DEFAULT_GATE_PROOF_MAP` — Gate ID → required proof types mapping (8 gates)

## 4. Cross-References

- 01_contract.md (invariants)
- 02_errors.md (error codes)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core) — GateReportV1 type
