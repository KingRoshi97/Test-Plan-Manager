---
library: system
id: SYS-1-GOV
schema_version: 1.0.0
status: draft
---

# SYS-1 — System Unit Model

## Purpose

Every system component in Axion is modeled as a **governed unit**. This doctrine defines the
canonical shape of a system unit, how units are identified, how resolution order is determined,
and how pin/lock behavior and capability filtering apply to each unit.

## System Unit Definition

A system unit is any discrete component that participates in the Axion control plane. Each unit
carries the following required fields:

| Field | Type | Description |
|---|---|---|
| `component_id` | string | Stable identifier, pattern `SYSUNIT-[A-Z0-9_]{4,}` |
| `component_type` | enum | One of: `resolver`, `adapter`, `policy_hook`, `quota_engine`, `notification_router`, `loader`, `registry` |
| `display_name` | string | Human-readable name |
| `version` | string | SemVer version of the component contract |
| `status` | enum | One of: `active`, `deprecated`, `disabled` |
| `resolution_order` | integer | Numeric priority (lower = resolved first) |
| `pin_behavior` | object | Pin/lock configuration for this unit |
| `capabilities_required` | array | List of capability IDs this unit requires |
| `capabilities_provided` | array | List of capability IDs this unit exposes |

## Resolution Order

Resolution order determines the sequence in which system units are initialized and evaluated
during a run:

1. **Registries** (order 100) — loaded first, provide lookup tables
2. **Resolvers** (order 200) — library and dependency resolvers
3. **Loaders** (order 300) — deterministic content loaders
4. **Adapters** (order 400) — runtime environment adapters
5. **Policy hooks** (order 500) — policy evaluation hooks
6. **Quota engines** (order 600) — quota and rate limit enforcers
7. **Notification routers** (order 700) — event routing and notification

Units within the same tier are resolved in lexicographic order of `component_id`.

## Pin/Lock Behavior

Each system unit declares its pin behavior:

| Pin Mode | Description |
|---|---|
| `pinned` | Frozen to a specific version; no automatic upgrades |
| `locked` | Frozen to a version range; patch upgrades allowed |
| `floating` | Always resolves to the latest compatible version |
| `inherit` | Inherits pin policy from the parent workspace/project |

Pin decisions are recorded in the run manifest under `system_pins[]` and are immutable once
a run begins.

## Capability Filtering

System units declare both required and provided capabilities. During resolution:

1. The adapter manager discovers available capabilities for the current runtime environment.
2. Each unit's `capabilities_required` is checked against available capabilities.
3. Units whose requirements are not satisfied are excluded from the active unit set.
4. The filtered unit set is recorded in the run manifest.

## Validation Rules

- `component_id` must be unique across all system registries.
- `resolution_order` must be a positive integer.
- A unit with `status: disabled` is never resolved.
- A `pinned` unit must include `pinned_version` in its `pin_behavior`.
- `capabilities_required` entries must reference valid capability IDs from `capabilities.v1`.
