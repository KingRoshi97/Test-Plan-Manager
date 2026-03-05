---
library: system
id: SYS-4b
schema_version: 1.0.0
status: draft
---

# SYS-4b — Validation Checklist

- [ ] quota_set matches quota_set.v1 schema
- [ ] project/workspace quota_set_id references an existing quota set (strict mode)
- [ ] profile modifiers reference valid profile_id (run_profiles.v1)
- [ ] effective quotas are recorded in run manifest
- [ ] enforcement action applied deterministically when limits exceeded
