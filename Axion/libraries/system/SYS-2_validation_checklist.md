---
library: system
id: SYS-2b
schema_version: 1.0.0
status: draft
---

# SYS-2b — Validation Checklist

- [ ] pin_policy matches pin_policy.v1 schema
- [ ] pin_set matches pin_set.v1 schema
- [ ] pin_set includes all required targets for the run profile
- [ ] lock_mode rules enforced:
  - [ ] pinned_required blocks missing pins
  - [ ] locked blocks latest/unpinned resolution
- [ ] resolved pin_set recorded in run manifest before execution
