---
library: audit
id: AUD-4b
schema_version: 1.0.0
status: draft
---

# AUD-4b — Determinism Rules (Integrity)

- Integrity mode is pinned by audit_integrity registry.
- Canonical JSON serialization is required for any hashing mode.
- Event ordering for hash computation is:
 - occurred_at
 - audit_event_id
- Genesis value is fixed and versioned.
- If hash_algorithm changes, registry version must bump.
