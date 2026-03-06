---
library: kit
id: KIT-2a
schema_version: 1.0.0
status: draft
---

# KIT-2a — Determinism Rules (Kit Manifest)

- contents entries are sorted deterministically:
  - kind order: metadata, artifact, doc, script
  - then path lexicographic
- Each path appears exactly once.
- contract_id values must match known artifact contract IDs when present.
- entrypoints are stable defaults:
 - readme = README.md
 - primary_artifact = artifacts/KIT_MANIFEST.json (or artifacts/CANONICAL_SPEC.json, pick
one and keep stable)
