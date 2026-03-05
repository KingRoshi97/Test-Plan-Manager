---
library: system
id: SYS-1a
schema_version: 1.0.0
status: draft
---

# SYS-1a — Determinism Rules (Workspace/Project)

- workspace_id and project_id are immutable.
- A project must reference exactly one parent workspace_id.
- Effective policy/quota/pin settings are resolved in this order:
 1) Workspace defaults
 2) Project bindings override workspace defaults
 3) Run-level pins (if allowed) override project bindings (recorded in run manifest)
- enabled_profiles gate what runs can be launched for the project.
