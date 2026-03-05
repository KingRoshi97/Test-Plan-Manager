---
library: system
id: SYS-7
schema_version: 1.0.0
status: draft
---

# SYS-7 — Minimum Viable system/ Set

## Goal
Define the smallest set of system library assets required to launch and run a pipeline
deterministically.

## Required runtime files (minimum)
### 1) Core docs
- SYS-0_purpose.md
- SYS-1_workspace_project_model.md
- SYS-2_pin_lock_policies.md
- SYS-3_adapter_manager.md
- SYS-4_quotas_rate_limits.md
- SYS-5_notification_routing.md
- SYS-6_policy_engine_hooks.md
- SYS-7_minimum_viable_set.md

### 2) Schemas (must be in schema_registry)
- schemas/workspace.v1.schema.json
- schemas/project.v1.schema.json
- schemas/pin_policy.v1.schema.json
- schemas/pin_set.v1.schema.json
- schemas/capability_registry.v1.schema.json
- schemas/adapter_profile.v1.schema.json
- schemas/command_policy.v1.schema.json
- schemas/quota_set.v1.schema.json
- schemas/quota_profile_modifiers.v1.schema.json (optional)
- schemas/notification_event_types.v1.schema.json
- schemas/notification_destinations.v1.schema.json
- schemas/notification_routes.v1.schema.json
- schemas/policy_hook_request.v1.schema.json
- schemas/policy_hook_decision.v1.schema.json

### 3) Registries (runtime defaults)
- registries/run_profiles.v1.json
- registries/capabilities.v1.json
- registries/quota_sets.v1.json
- registries/notification_event_types.v1.json
- registries/notification_destinations.v1.json
- registries/notification_routes.v1.json

## Required "pin targets" (SYS-2)
At run start, the run manifest must pin:
- adapter_profile_id
- quota_set_id
- policy_set_id
- pin_policy_id
…and record the resolved pin_set.

## Required outputs (system responsibilities)
- Deterministic pin_set recorded in run manifest
- Effective quota decision recorded in run manifest
- Adapter capability snapshot recorded in run manifest
- Notification routing decisions recorded in run logs
- Policy hook decisions recorded in run manifest (with expiry)
