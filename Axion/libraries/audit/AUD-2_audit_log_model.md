---
library: audit
id: AUD-2
schema_version: 1.0.0
status: draft
---

# AUD-2 — Audit Log / Ledger Model

## Purpose
Define an append-only audit ledger that stores audit_action entries for:
- a run
- a workspace/project scope (optional)

## Ledger properties
- append-only (no deletes/edits without creating a new corrective event)
- deterministic ordering for serialization
- optionally tamper-evident (hash chaining)

## Linkage
Audit actions link to:
- run_id
- stage_id
- gate_id
- policy_decision_id
- proof_id
via the target + refs fields.
