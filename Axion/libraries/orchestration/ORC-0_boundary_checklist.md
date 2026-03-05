---
library: orchestration
id: ORC-0a
schema_version: 1.0.0
status: draft
---

# ORC-0a — Boundary Checklist

A change belongs in `orchestration/` if it answers:
- "What stages exist and in what order do they run?"
- "What does stage Sx consume and produce?"
- "How do we represent a run and stage reports?"
- "How do resume/partial rerun semantics work deterministically?"

A change does NOT belong in `orchestration/` if it answers:
- "How do we evaluate a predicate / gate?" (gates)
- "What risk class rules exist?" (policy)
- "Who can run this / what is pinned / what quotas apply?" (system)
- "What template/knowledge/standards content exists?" (those libraries)
