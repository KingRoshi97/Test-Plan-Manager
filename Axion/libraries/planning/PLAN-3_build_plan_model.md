---
library: planning
id: PLAN-3
schema_version: 1.0.0
status: draft
---

# PLAN-3 — Build Plan Model

## Purpose
Define a deterministic execution plan that sequences work items (WBS) into phases/milestones.

## Build plan structure
- plan_id
- run_id
- phases[] (ordered)
- each phase contains ordered work_item_ids
- dependency rules enforce that prerequisites appear earlier
- optional milestones (gates, checkpoints)

## Why build_plan exists (vs WBS)
- WBS is the inventory of tasks
- Build plan is the ordering/packaging of tasks into an execution sequence
