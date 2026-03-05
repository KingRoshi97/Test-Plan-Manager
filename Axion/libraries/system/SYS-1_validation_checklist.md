---
library: system
id: SYS-1b
schema_version: 1.0.0
status: draft
---

# SYS-1b — Validation Checklist

- [ ] workspace record matches workspace.v1 schema
- [ ] project record matches project.v1 schema
- [ ] project.workspace_id points to an existing workspace_id
- [ ] enabled_profiles entries exist in run_profiles.v1
- [ ] bindings include policy_set_id, quota_set_id, pin_policy_id
