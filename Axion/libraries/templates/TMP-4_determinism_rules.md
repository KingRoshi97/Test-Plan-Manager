---
library: templates
id: TMP-4a
schema_version: 1.0.0
status: draft
---

# TMP-4a — Determinism Rules (Render Envelopes)

- Envelope is emitted for every rendered output.
- template_ref points to pinned template version.
- input_refs point to pinned canonical_spec and standards_snapshot (and knowledge_selection
if used).
- knowledge_citations list is stable and sorted lexicographically.
- If reuse excerpts are used, reuse_log_refs must be present (and recorded elsewhere).
