---
library: planning
id: PLAN-4a
schema_version: 1.0.0
status: draft
---

# PLAN-4a — Determinism Rules (Coverage)

- Coverage rules registry is pinned.
- Coverage evaluation uses only:
  - canonical_spec
  - template_selection
  - work_breakdown
  - acceptance_map
- Missing items lists are sorted deterministically (by entity_id/template_id/requirement_id).
