---
library: planning
id: PLAN-5a
schema_version: 1.0.0
status: draft
---

# PLAN-5a — Mapping to Pipeline Gate

Pipeline gate: **G6_PLAN_COVERAGE**

G6 passes if:
- PLAN-GATE-01..04 pass
- PLAN-GATE-05 passes (or is policy-approved when required)
- PLAN-GATE-06 passes

Default risk handling:
- PROTOTYPE: coverage gaps may warn/pause
- PROD: coverage gaps fail unless approved override
- COMPLIANCE: coverage gaps fail by default
