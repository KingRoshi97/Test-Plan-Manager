---
library: intake
id: INT-0a
schema_version: 1.0.0
status: draft
---

# INT-0a — Boundary Checklist

Belongs in `intake/` if it answers:
- "What questions do we ask and how are they structured?"
- "What values are allowed for this field?"
- "How do we validate this submission?"
- "How do we normalize answers deterministically into canonical input?"
Does NOT belong in `intake/` if it answers:
- "How do we build the canonical spec?" (canonical)
- "Which standards apply?" (standards)
- "Which templates are selected?" (templates)
- "How do gates evaluate predicates?" (gates)
- "What is the pipeline stage order?" (orchestration)
