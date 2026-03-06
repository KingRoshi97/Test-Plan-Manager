---
library: audit
id: AUD-4a
schema_version: 1.0.0
status: draft
---

# AUD-4a — Hash Chain Rules

## Chain formula
For event_i:

chain_hash_i = H(chain_hash_{i-1} + canonical_json(event_i))

Where:
- H = pinned hash algorithm from audit_integrity registry
- canonical_json(event_i) uses stable key ordering and normalized whitespace
- chain_hash_0 = fixed genesis value, e.g. "AUDIT_GENESIS_V1"

## What this detects
- event edits
- event deletion
- event insertion in the middle
- event reordering

## Storage choices
You may:
1) store per-event chain hashes, or
2) store only the final root hash and recompute when verifying

Recommended:
- store root_hash in audit_log
- optionally store per-event chain_hash in derived verification output, not inline
