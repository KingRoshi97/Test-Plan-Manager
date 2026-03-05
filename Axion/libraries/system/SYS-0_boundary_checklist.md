---
library: system
id: SYS-0a
schema_version: 1.0.0
status: draft
---

# SYS-0a — Boundary Checklist

A change belongs in `system/` if it answers at least one:
- "What environment is this run allowed to execute in?"
- "What resources is this run allowed to consume?"
- "What versions are pinned/locked and how?"
- "What notifications should fire and where?"
- "What capabilities does this adapter/runtime have?"

A change does NOT belong in `system/` if it answers:
- "What does the pipeline do in stage Sx?" (orchestration)
- "How do gates evaluate predicates?" (gates)
- "What risk class rules exist?" (policy)
- "What template/knowledge/standards content exists?" (those libraries)
