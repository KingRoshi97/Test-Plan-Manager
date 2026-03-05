---
library: intake
id: INT-7a
schema_version: 1.0.0
status: draft
---

# INT-7a — intake/ Definition of Done

intake/ is "done" when:

## Schemas + registries
- [ ] All intake schemas validate (JSON Schema check)
- [ ] intake_enums registry validates and covers required enums
- [ ] cross-field rules registry validates
- [ ] normalization rules registry validates
- [ ] form spec exists, validates, and is versioned
## Runtime behavior (contract-level)
- [ ] Wizard can render the form spec deterministically (pages/fields order stable)
- [ ] Submission record (raw) is created and validates
- [ ] Validation produces an intake_validation_report with stable codes + pointers
- [ ] Normalization produces normalized_input deterministically with provenance refs

## Gates
- [ ] INT-GATE-01..06 enforce schema, pins, enums, required fields, cross-field rules,
normalization
- [ ] Pipeline gate G1_INTAKE_VALIDITY is satisfied when all INT gates pass
