---
library: audit
id: AUD-2a
schema_version: 1.0.0
status: draft
---

# AUD-2a — Tamper-evident Rules (Optional)

## Concept
Each event stores/derives a chain hash:
hash_i = H(hash_{i-1} + canonical_json(event_i))

Where:
- H is a pinned algorithm (e.g., sha256)
- canonical_json uses stable key ordering and no whitespace variance

## Storage options
Option 1: store chain hashes alongside events (extra field)
Option 2: compute on demand and store only root_hash

## Minimum requirement
If enabled:
- chain_hash_algo must be set and pinned
- root_hash must match the computed final hash
