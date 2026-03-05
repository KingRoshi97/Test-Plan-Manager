---
library: orchestration
id: ORC-5
schema_version: 1.0.0
status: draft
---

# ORC-5 — Rerun / Resume Model

## Purpose
Define deterministic behavior for:
- resuming a paused/failed run
- rerunning a stage (repair or regeneration)
- partial runs (starting from a stage with pinned inputs)

## Key idea
Reruns are only valid if inputs are pinned and the run manifest records:
- why the rerun occurred
- which stage(s) were rerun
- which artifacts were invalidated/replaced
- what was kept stable (pins, standards snapshot, selection artifacts)

## Definitions
- **Resume**: continue a paused run without changing upstream artifacts/pins.
- **Stage rerun**: re-execute a specific stage using the same pinned upstream inputs.
- **Partial run**: start execution from stage N by providing pinned inputs equivalent to what
earlier stages would have produced.
