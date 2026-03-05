---
library: orchestration
id: ORC-1b
schema_version: 1.0.0
status: draft
---

# ORC-1b — Validation Checklist

- [ ] pipeline definition matches pipeline_definition.v1 schema
- [ ] stage_order entries all exist as keys in stages
- [ ] each stages[stage_id].stage_id matches its key
- [ ] gate_points.after_stage exists in stage_order
- [ ] pipeline version bumps when stage list/order/contracts change
