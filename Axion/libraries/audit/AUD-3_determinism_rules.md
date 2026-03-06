---
library: audit
id: AUD-3a
schema_version: 1.0.0
status: draft
---

# AUD-3a — Determinism Rules (Audit Index)

- Index stores references only (no event payloads).
- query_keys are derived deterministically from the ledger contents:
 - unique sets, sorted lexicographically
- entries are sorted deterministically:
 - scope_type, then run_id/project_id/workspace_id
- audit_log_ref.hash optional; if present it must match ledger file hash.
