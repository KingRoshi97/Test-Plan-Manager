---
library: canonical
id: CAN-4b
schema_version: 1.0.0
status: draft
---

# CAN-4b — Determinism Rules (Unknowns)

- Unknowns/assumptions generation is deterministic from pinned inputs + rules.
- item_id generation follows the same deterministic ID principles (CAN-2 style) using:
  - kind + pointer + topic as canonical key.
- unknowns and assumptions lists are sorted by:
  - severity (blocking → high → medium → low)
  - pointer
  - item_id
