---
library: system
id: SYS-2a
schema_version: 1.0.0
status: draft
---

# SYS-2a — Pin Resolution Rules

## Precedence
When resolving pins for a run:
1) Start from Workspace defaults
2) Apply Project bindings (override)
3) Apply Run-level overrides (only if pin_policy allows)

## Lock modes
- open:
  - allowed to resolve "latest"
  - still records resolved versions into pin_set at run start
- pinned_required:
  - run cannot start unless all required targets are pinned
- locked:
  - run cannot start unless pins match allowed pinned versions
  - "latest" is forbidden

## Completion requirement
Before stage execution begins, the run must produce a resolved pin_set where:
- every required target has a concrete (version, path, optional hash)
- the pin_set is recorded in the run manifest
