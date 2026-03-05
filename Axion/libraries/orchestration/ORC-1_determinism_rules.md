---
library: orchestration
id: ORC-1a
schema_version: 1.0.0
status: draft
---

# ORC-1a — Determinism Rules (Pipeline)

- stage_order is authoritative and must match the keys in stages.
- stage_id values are immutable across versions (do not rename; deprecate by versioning).
- Gate points are evaluated in file order after their after_stage boundary.
- Activation rules must be computable from run context only (no hidden state).
- Any pipeline change requires a version bump.
