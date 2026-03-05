---
library: orchestration
id: ORC-3b
schema_version: 1.0.0
status: draft
---
# ORC-3b — Validation Checklist

- [ ] run_manifest validates against run_manifest.v1 schema
- [ ] pipeline_ref is present and points to a pinned pipeline definition
- [ ] pins.pin_set_ref present before any stage status == running
- [ ] stage_timeline status transitions are valid
- [ ] artifacts.contract_id exists in stage IO registry (strict mode)
- [ ] artifacts.produced_by_stage exists in stage_order (strict mode)
- [ ] rerun/resume actions are recorded in events
