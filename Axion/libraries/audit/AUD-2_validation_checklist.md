---
library: audit
id: AUD-2c
schema_version: 1.0.0
status: draft
---

# AUD-2c — Validation Checklist

- [ ] audit_log validates against schema
- [ ] scope fields match scope_type (run/project/workspace)
- [ ] events validate against audit_action schema
- [ ] events behave append-only
- [ ] deterministic ordering applied for serialization
- [ ] tamper-evident: root_hash matches computed (if enabled)
