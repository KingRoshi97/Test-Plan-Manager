---
library: planning
id: PLAN-2a
schema_version: 1.0.0
status: draft
---

# PLAN-2a — Determinism Rules (Acceptance Map)

- requirement_id should reference canonical entities of type "requirement" (strict mode).
- ac_id is deterministic from:
  requirement_id + statement slug + evidence keys (hash-based).
- requirements are ordered deterministically:
  - requirement_id
- acceptance_criteria ordered deterministically:
  - ac_id
- evidence lists are sorted lexicographically.
