---
library: planning
id: PLAN-3b
schema_version: 1.0.0
status: draft
---

# PLAN-3b — Determinism Rules (Build Plan)

- phases are ordered by phase.order (unique integers).
- work_items order is deterministic per PLAN-3a.
- all work_item_ids referenced must exist in WBS.
- dependency constraints must be satisfied.
