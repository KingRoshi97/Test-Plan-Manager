---
library: intake
id: INT-1b
schema_version: 1.0.0
status: draft
---

# INT-1b — Validation Checklist

- [ ] form spec validates against intake_form_spec.v1 schema
- [ ] page.order values are unique and start at 1
- [ ] field_id values are unique across the spec
- [ ] enum_ref present for enum and multi_enum fields
- [ ] visibility rules reference existing field_id values
