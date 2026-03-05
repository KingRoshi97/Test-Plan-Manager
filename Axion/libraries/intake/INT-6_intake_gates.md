---
library: intake
id: INT-6
schema_version: 1.0.0
status: draft
---

# INT-6 — Intake Gates

## Purpose
Enforce that downstream stages only run on valid, deterministic inputs.

## Gate set (minimum)

### INT-GATE-01 — Submission schema valid
- intake_submission validates against intake_submission.v1 schema

### INT-GATE-02 — Form spec pinned + compatible
- submission.form_ref exists and matches a pinned intake_form_spec version

### INT-GATE-03 — Enum resolution valid
- enum and multi_enum answers resolve to canonical values (aliases supported)
- unknown enum values → errors

### INT-GATE-04 — Required fields satisfied
- all required fields present (including conditional requirements)

### INT-GATE-05 — Cross-field rules satisfied
- cross-field rules evaluated deterministically
- missing required fields flagged with stable error codes

### INT-GATE-06 — Normalization output valid
- normalized_input produced
- normalized_input validates against normalized_input.v1 schema
- normalized_input.provenance refs are present and pinned
## Output
- intake_validation_report artifact must be produced for S2
- status:
  - fail if any INT-GATE-* hard rule fails
  - warn if non-blocking warnings only (optional)
