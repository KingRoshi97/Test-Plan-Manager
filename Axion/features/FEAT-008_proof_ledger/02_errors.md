# FEAT-008 — Proof Ledger: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-PROOF-NNN` format.

## 2. Domain

`PROOF`

## 3. Error Codes

| Code | Severity | Condition | Action |
|------|----------|-----------|--------|
| `ERR-PROOF-001` | error | Ledger file not writable (disk full, permissions) | Check filesystem permissions and available space |
| `ERR-PROOF-002` | error | Invalid proof entry — missing required fields (proof_id, run_id, gate_id, proof_type, timestamp, hash, evidence) | Validate entry against ProofEntry schema before appending |
| `ERR-PROOF-003` | warning | Invalid proof type — not in VER-01 taxonomy | Use valid ProofType: P-01..P-06, automated_check, test_result, review_approval, static_analysis, manual_attestation |
| `ERR-PROOF-004` | warning | Missing required evidence fields for proof type | Check PROOF_TYPE_REQUIRED_FIELDS for the given proof type |
| `ERR-PROOF-005` | error | Ledger integrity check failed — malformed entries detected | Run validateLedgerIntegrity() and review LedgerIntegrityReport.details |
| `ERR-PROOF-006` | warning | Hash mismatch on proof entry — possible tampering | Investigate entry provenance; re-generate proof if needed |

## 4. Error Handling Rules

- `appendJsonl` throws on I/O failure — callers must handle
- `loadProofEntries` silently skips malformed JSONL lines (returns partial results)
- `validateProofEntry` returns boolean (no throw) — callers decide severity
- `validateLedgerIntegrity` returns `LedgerIntegrityReport` with issue details

## 5. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- VER-01 (Proof Types & Evidence Rules)
