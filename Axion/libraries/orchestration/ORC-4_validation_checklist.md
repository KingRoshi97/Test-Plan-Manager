---
library: orchestration
id: ORC-4b
schema_version: 1.0.0
status: draft
---

# ORC-4b — Validation Checklist

- [ ] stage_report validates against stage_report.v1 schema
- [ ] inputs/outputs contract_id exist in stage IO registry (strict mode)
- [ ] stage_id exists in pipeline stage_order (strict mode)
- [ ] stage_report paths align with run manifest artifact entries (strict mode)
- [ ] exactly one report per executed stage
