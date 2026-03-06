---
library: audit
id: AUD-1b
schema_version: 1.0.0
status: draft
---

# AUD-1b — Validation Checklist

- [ ] audit_action validates against schema
- [ ] action_type is from the allowed enum set
- [ ] actor contains actor_id + normalized role
- [ ] target contains the correct ids for its target_type
- [ ] sensitive actions include a non-empty reason
- [ ] refs contain only stable paths/hashes
