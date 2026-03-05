---
library: planning
id: PLAN-1a
schema_version: 1.0.0
status: draft
---

# PLAN-1a — Determinism Rules (WBS)

- work_item_id is generated deterministically from a canonical key (e.g., entity_id + work_type +
output contract).
- items are ordered deterministically for storage:
  - priority (high → medium → low)
  - work_type (fixed order)
  - title
  - work_item_id
- depends_on must reference existing work_item_id values.
