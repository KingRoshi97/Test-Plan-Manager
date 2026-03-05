---
library: system
id: SYS-4a
schema_version: 1.0.0
status: draft
---

# SYS-4a — Quota Resolution Rules

## Inputs
- workspace.defaults.quota_set_id
- project.bindings.quota_set_id
- run profile_id
- optional quota_profile_modifiers

## Precedence
1) Workspace default quota_set_id
2) Project binding overrides workspace
3) Apply profile multipliers (if present)
4) Record final effective quota in run manifest

## Enforcement decision
- If a limit would be exceeded at run start:
  apply enforcement.on_exceed (block/warn/require_approval/degrade)
- Enforcement decisions must be recorded:
  - decision
  - reason (which limit)
  - computed effective limits
