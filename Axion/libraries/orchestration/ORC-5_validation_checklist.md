---
library: orchestration
id: ORC-5c
schema_version: 1.0.0
status: draft
---

# ORC-5c — Validation Checklist

- [ ] rerun_policies registry exists and stage_id entries are valid
- [ ] rerun_request validates against schema
- [ ] resume does not change pins or pipeline_ref
- [ ] stage_rerun only allowed when can_rerun==true
- [ ] downstream invalidation list is applied and recorded
- [ ] run manifest appends rerun/resume events with required data
