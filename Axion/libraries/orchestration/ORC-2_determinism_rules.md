---
library: orchestration
id: ORC-2a
schema_version: 1.0.0
status: draft
---

# ORC-2a — Determinism Rules (Stage IO)

- Stages may only consume/produce contract IDs defined in the IO registry.
- Contract IDs are stable; contract meaning changes require schema version bump.
- Input validation is performed before stage execution begins.
- A stage success must include all required produced contracts listed in pipeline definition.
- Any missing required produced artifact is a stage failure.
