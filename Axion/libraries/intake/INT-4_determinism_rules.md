---
library: intake
id: INT-4a
schema_version: 1.0.0
status: draft
---

# INT-4a — Determinism Rules (Submission → Normalized)

Normalization must be a pure function of:
- intake_submission (raw)
- pinned form spec (form_id + version)
- pinned enum registry (registry_id + schema_version)
- pinned normalization rules

Rules:
- answers array is normalized into inputs map keyed by canonical field_id
- enum values are alias-resolved to canonical (INT-2)
- multi-enum values are de-duplicated and sorted lexicographically
- whitespace trimmed; internal whitespace collapsed (where applicable)
- derived values (like slugs) use a stable slugify rule
- provenance refs recorded in normalized_input
