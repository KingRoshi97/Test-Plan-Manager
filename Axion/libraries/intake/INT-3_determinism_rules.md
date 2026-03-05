---
library: intake
id: INT-3a
schema_version: 1.0.0
status: draft
---

# INT-3a — Determinism Rules (Validation)

- Validation runs in fixed order:
  1) schema/type checks
  2) required fields
  3) enum resolution
  4) field-level validators (regex/bounds)
  5) cross-field rules
- Error codes are stable and prefixed `INT-...`.
- Output ordering:
  - errors sorted by field_id, then code
  - warnings sorted by field_id, then code
- Pointer format is JSON pointer into submission record.
