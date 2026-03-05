---
library: intake
id: INT-3
schema_version: 1.0.0
status: draft
---

# INT-3 — Intake Validation Model

## Purpose
Define how intake submissions are validated consistently:
- field-level validation (type, required, regex, bounds)
- cross-field validation (dependencies and conditional requirements)
- stable error codes + pointers for UI and reports

## Validation surfaces
- **UI-time validation**: immediate feedback while filling the wizard
- **Submission validation (S2)**: authoritative validation for pipeline execution

## Output artifact
Validation produces an INTAKE_VALIDATION_REPORT artifact referenced by orchestration IO
contracts.
