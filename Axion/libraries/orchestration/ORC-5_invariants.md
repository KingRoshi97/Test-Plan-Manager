---
library: orchestration
id: ORC-5a
schema_version: 1.0.0
status: draft
---

# ORC-5a — Rerun/Resume Invariants

## Resume invariants
Resume is allowed only if:
- pins.pin_set_ref is unchanged
- pipeline_ref is unchanged
- upstream artifacts are unchanged (no invalidation)

## Stage rerun invariants
Stage rerun is allowed only if:
- can_rerun == true for the stage
- pins.pin_set_ref is unchanged unless SYS pin policy allows override + policy approves
- all consumes contracts required by the stage exist and validate

## Partial run invariants
Partial run is allowed only if:
- partial_inputs provide all contracts needed for the starting stage's consumes chain
- all partial_inputs are pinned refs (path + hash or versioned ref)
- run manifest records this as a new run_id OR as a distinct rerun event with a new pin_set_id
(policy choice)

## Invalidation behavior
- When rerunning a stage, invalidate downstream artifacts listed in rerun policies.
- Invalidation must be recorded in run events:
  - what contract_ids were invalidated
  - what new artifact paths replaced them
