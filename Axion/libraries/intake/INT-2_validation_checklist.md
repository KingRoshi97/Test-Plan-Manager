---
library: intake
id: INT-2b
schema_version: 1.0.0
status: draft
---

# INT-2b — Validation Checklist

- [ ] enum registry validates against intake_enums.v1 schema
- [ ] enum_id values are unique
- [ ] each enum option value is unique within its enum
- [ ] aliases do not collide across different canonical values in same enum
- [ ] alias resolution is deterministic (canonical → alias → error)
