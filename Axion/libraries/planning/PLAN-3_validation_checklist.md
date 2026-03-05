---
library: planning
id: PLAN-3c
schema_version: 1.0.0
status: draft
---

# PLAN-3c — Validation Checklist

- [ ] build_plan validates against schema
- [ ] phase.order values are unique and start at 1
- [ ] every referenced work_item_id exists in WBS (strict mode)
- [ ] dependency ordering constraints satisfied
- [ ] no dependency cycles exist
- [ ] deterministic ordering applied inside phases
