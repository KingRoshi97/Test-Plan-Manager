---
library: canonical
id: CAN-2a
schema_version: 1.0.0
status: draft
---

# CAN-2a — Deterministic ID Generation

## Inputs
- canonical_key (string)
- namespace salt (workspace_id + project_id optional)
- versioned id algorithm (id_algo_version)

## Algorithm (concept)
1) Normalize canonical_key:
  - lowercase
  - trim
  - collapse whitespace
2) Compute hash:
  - hash = sha256(id_algo_version + ":" + namespace + ":" + canonical_key)
3) Encode:
  - take first N chars of base32/base16
4) Prefix:
  - entity_id: `E-<encoded>`
  - rel_id: `R-<encoded>`

## Notes
- The algorithm version must be pinned and recorded in canonical spec meta.
- Namespace inclusion:
  - If you want IDs stable across projects, omit namespace.
  - If you want isolation, include workspace/project namespace.
Pick one and keep it consistent.
