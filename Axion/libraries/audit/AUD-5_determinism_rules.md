---
library: audit
id: AUD-5b
schema_version: 1.0.0
status: draft
---

# AUD-5b — Determinism Rules (Audit Gates)

- Gates run in fixed order AUD-GATE-01..06.
- Event order for evaluation is the ledger serialization order:
  - occurred_at
  - audit_event_id
- Missing/failed event lists are sorted deterministically by audit_event_id.
- Integrity verification uses pinned audit_integrity registry and canonical JSON rules.
