---
library: planning
id: PLAN-3a
schema_version: 1.0.0
status: draft
---

# PLAN-3a — Sequencing Policies (Deterministic)

## Goals
- dependencies first
- stable ordering for equal-priority items
- phases reflect typical build flow

## Phase model (default)
1) Foundation (repo, scaffolding, baseline config)
2) Core domain + data model
3) API/backend endpoints
4) Frontend/UI
5) Integrations
6) Testing + verification
7) Ops + release readiness

## Ordering inside a phase
Sort work items by:
1) dependency depth (lower first)
2) priority (high → low)
3) work_type fixed order:
  design → implementation → test → docs → security → ops → data
4) work_item_id lexicographic

## Dependency rule
- if A depends_on B, then B must appear:
  - in an earlier phase OR earlier in the same phase
- cycles are invalid and must fail planning gate
