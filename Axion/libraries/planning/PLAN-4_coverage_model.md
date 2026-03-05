---
library: planning
id: PLAN-4
schema_version: 1.0.0
status: draft
---

# PLAN-4 — Coverage Model

## Purpose
Define measurable coverage requirements so Axion can say:
- the plan is complete
- nothing critical was missed
- coverage gates can be evaluated deterministically

Coverage applies to:
- canonical entities (what exists must be addressed)
- selected templates (what was selected must be filled and validated)
- acceptance criteria (what must be proven)

## Coverage dimensions
1) **Entity coverage**
- each required canonical entity type must map to at least one work item

2) **Template coverage**
- each selected template must have a corresponding plan segment/work items

3) **Acceptance coverage**
- each requirement in acceptance map must have acceptance criteria + evidence requirements
