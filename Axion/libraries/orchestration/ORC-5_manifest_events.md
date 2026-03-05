---
library: orchestration
id: ORC-5b
schema_version: 1.0.0
status: draft
---

# ORC-5b — Run Manifest Events for Reruns

On rerun/resume, the manifest must append an event:

## RUN_RESUMED
- at
- data: { reason, requested_by }

## STAGE_RERUN
- at
- data: { stage_id, reason, requested_by, invalidated_contract_ids[], new_outputs[] }

## PARTIAL_RUN (optional event_type if you split it)
- at
- data: { start_stage, partial_inputs[], reason, requested_by }

All events must reference stable IDs and paths, not inline content.
