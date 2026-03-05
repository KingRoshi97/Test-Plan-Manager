---
library: planning
id: PLAN-5c
schema_version: 1.0.0
status: draft
---

# PLAN-5c — Evidence Requirements (Planning Failures)

On failure, evidence must include:
- pointers to the failing artifact (WBS/AMAP/PLAN)
- missing work_item_ids or invalid depends_on refs
- cycle details (list of involved work_item_ids)
- coverage gaps:
  - missing entity_ids
  - missing template_ids
  - missing requirement_ids
- remediation:
  - add missing work items
  - add acceptance criteria/evidence requirements
  - fix dependency cycles
  - rerun S6 and downstream stages
