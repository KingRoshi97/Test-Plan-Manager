# FEAT-008 — Proof Ledger: Security Requirements

## 1. Scope

Security requirements for the append-only proof ledger and proof object creation.

## 2. Security Requirements

- Ledger is append-only — no API for deletion or mutation of existing entries
- Every proof entry includes a SHA-256 hash for tamper detection
- Hash covers: `{ proofId, runId, gate_id, evidence, timestamp }`
- Proof IDs are deterministic from run/gate/timestamp to prevent ID spoofing
- Evidence objects are serialized as-is — no executable content

## 3. Data Classification

- Proof evidence: Internal (may contain command outputs, file paths)
- Ledger file: Restricted (append-only, integrity-critical)
- Proof hashes: Internal (integrity verification data)

## 4. Access Control

- Write: Only system processes (pipeline stages, gate evaluator) append to ledger
- Read: All system components can query the ledger
- No delete or update operations exposed

## 5. Threat Mitigations

- **Tamper detection**: SHA-256 hash on each entry; `verifyProofHash()` validates integrity
- **Replay prevention**: Proof IDs include timestamp component
- **Evidence validation**: `validateEvidenceFields()` checks required fields per proof type
- **Graceful degradation**: Malformed JSONL lines are skipped during load, not crash

## 6. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner) — scan proof evidence for leaked secrets
