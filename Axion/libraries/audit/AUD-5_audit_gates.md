---
library: audit
id: AUD-5
schema_version: 1.0.0
status: draft
---

# AUD-5 — Audit Gates

## Purpose
Ensure audit data is structurally valid, chronologically sane, and accountable.

## Gate set (minimum)

### AUD-GATE-01 — Audit log schema valid
- AUDIT_LOG exists
- validates against audit_log.v1
- all events validate against audit_action.v1

### AUD-GATE-02 — Actor present
- every audit event has actor.actor_id
- every audit event has actor.role from closed enum
- no anonymous sensitive actions

### AUD-GATE-03 — Monotonic timestamps
- occurred_at timestamps are monotonic in ledger order
- no event timestamp is earlier than a prior event in the same serialized order

### AUD-GATE-04 — Target/reference coherence
- target fields match target_type
- refs point to valid paths/ids where required
- override/export/rerun events carry the required related ids

### AUD-GATE-05 — Sensitive actions include reason
- overrides, exports, reruns, and manual attestations require non-empty reason

### AUD-GATE-06 — Integrity mode satisfied
- if integrity mode is file_hash or hash_chain:
  - integrity verification passes
- required integrity level must meet risk-class minimum
