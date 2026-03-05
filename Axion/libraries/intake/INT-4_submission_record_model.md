---
library: intake
id: INT-4
schema_version: 1.0.0
status: draft
---

# INT-4 — Submission Record Model

## Purpose
Define the canonical record for intake submissions:
- the raw answers as entered (auditable)
- normalized answers (canonicalized, enum-resolved, stable ordering)
- metadata required for deterministic downstream processing

## Artifacts
- INTAKE_SUBMISSION: raw submission record (wizard output)
- NORMALIZED_INPUT: normalized artifact used downstream (S1 output)

## Principles
- Keep raw and normalized separate.
- Never overwrite raw answers.
- Normalized output is deterministic from raw + pinned form spec + pinned enum registry +
pinned normalization rules.
