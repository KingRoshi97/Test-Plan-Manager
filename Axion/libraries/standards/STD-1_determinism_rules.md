---
library: standards
id: STD-1a
schema_version: 1.0.0
status: draft
---

# STD-1a — Determinism Rules (Standards Packs)

- pack_id is immutable; pack changes require version bump.
- rules[] order is stable and preserved (used for deterministic diffs and reporting).
- scope fields are closed enums where possible (profile_id, risk_classes).
- Any pack referenced in a snapshot must be pinned by (pack_id, version, path, optional hash).
