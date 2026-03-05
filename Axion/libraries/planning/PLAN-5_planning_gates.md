---
library: planning
id: PLAN-5
schema_version: 1.0.0
status: draft
---

# PLAN-5 — Planning Gates

## Purpose
Ensure S6 plan generation produces a coherent, complete, deterministic plan that downstream
stages can execute and verify.

## Gate set (minimum)

### PLAN-GATE-01 — WBS valid
- WORK_BREAKDOWN exists
- validates against work_breakdown.v1
- depends_on references valid work_item_ids

### PLAN-GATE-02 — Acceptance map valid
- ACCEPTANCE_MAP exists
- validates against acceptance_map.v1
- evidence requirements present for each acceptance criterion

### PLAN-GATE-03 — Build plan valid
- BUILD_PLAN exists
- validates against build_plan.v1
- phases ordered; references valid work_item_ids

### PLAN-GATE-04 — Dependency ordering valid (no cycles)
- dependency graph is acyclic
- build plan ordering respects depends_on constraints

### PLAN-GATE-05 — Coverage satisfied (risk-based)
- evaluate pinned coverage rules (PLAN-4)
- missing coverage fails under PROD/COMPLIANCE
- prototype may warn/pause (policy controlled)

### PLAN-GATE-06 — Plan artifacts pinned in run manifest
- manifest includes WORK_BREAKDOWN, ACCEPTANCE_MAP, BUILD_PLAN artifacts
