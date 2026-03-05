# FEAT-008 — Proof Ledger: Observability

## 1. Metrics

- `proof.entries.appended` — count of entries appended per run
- `proof.entries.total` — total entries in ledger after load
- `proof.entries.by_type` — breakdown by proof_type (P-01..P-06, automated_check, etc.)
- `proof.entries.by_gate` — breakdown by gate_id
- `proof.validation.valid` — entries passing validateProofEntry
- `proof.validation.invalid` — entries failing validation
- `proof.validation.evidence_missing` — entries with missing evidence fields
- `proof.coverage.ratio` — acceptance coverage ratio from getAcceptanceCoverage
- `proof.query.results` — count of entries returned per query

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-008`
- `domain`: `proof-ledger`
- `operation`: append | load | query | validate | create
- `run_id`: Current pipeline run identifier
- `gate_id`: Gate being proven (when applicable)
- `proof_type`: Type of proof being created/validated
- `proof_id`: ID of the proof entry

### 2.2 Log Levels

- `ERROR`: Ledger file I/O failure, integrity check failure
- `WARN`: Invalid proof type, missing evidence fields, hash mismatch
- `INFO`: Proof appended, ledger loaded, integrity check passed
- `DEBUG`: Query parameters and result counts

## 3. Traces

- `proof-ledger.append` — span for each append operation
- `proof-ledger.load` — span for JSONL file parsing
- `proof-ledger.query` — span for filtered query execution
- `proof-ledger.validate` — span for integrity validation
- `proof.create` — span for proof object creation from gate reports

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
