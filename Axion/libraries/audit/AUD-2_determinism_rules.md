---
library: audit
id: AUD-2b
schema_version: 1.0.0
status: draft
---

# AUD-2b — Determinism Rules (Audit Log)

- events are append-only.
- serialization order is deterministic:
  - occurred_at
  - audit_event_id
- If tamper_evident enabled:
  - canonical JSON form must be used for hashing
  - hash algorithm is pinned.
