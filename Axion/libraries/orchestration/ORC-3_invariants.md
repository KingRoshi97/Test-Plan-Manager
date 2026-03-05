---
library: orchestration
id: ORC-3a
schema_version: 1.0.0
status: draft
---

# ORC-3a — Run Manifest Invariants

- The manifest must record the pipeline_ref (pipeline_id + version + path).
- The manifest must record resolved pin_set_ref before stage execution.
- Stage timeline entries are append-only:
  - status transitions must be monotonic (queued → running →
succeeded/failed/paused/skipped).
- Artifact entries must include:
  - contract_id (from stage IO registry)
  - produced_by_stage (stage_id)
  - path (deterministic location)
- Reruns/resumes must emit a run_event with supporting data.
