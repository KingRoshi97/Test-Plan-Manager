---
library: orchestration
id: ORC-4a
schema_version: 1.0.0
status: draft
---

# ORC-4a — Determinism Rules (Stage Reports)

- Every executed stage must emit exactly one stage_report.v1.
- inputs/outputs must reference contract IDs from the stage IO registry.
- paths must match the artifact entries recorded in the run manifest (strict mode).
- messages are short and stable (no large freeform dumps).
- decisions (if present) must reference deterministic IDs (template ids, bundle ids, snapshot ids).
