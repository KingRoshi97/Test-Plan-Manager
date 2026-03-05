---
library: canonical
id: CAN-1a
schema_version: 1.0.0
status: draft
---

# CAN-1a — Determinism Rules (Canonical Graph)

- entities are sorted deterministically in storage:
  - primary sort: type
  - secondary sort: name
  - tertiary sort: entity_id
- relationships are sorted deterministically:
  - type, from, to, rel_id
- Any derived entity/relationship must be reproducible from pinned inputs + rules.
