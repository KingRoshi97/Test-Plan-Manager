---
library: policy
id: POL-3a
section: conflict_rules
schema_version: 1.0.0
status: draft
---

# POL-3a — Conflict Resolution Rules

## Default: most_restrictive_wins
When two rules conflict, choose the stricter interpretation:
- external_allowed: false is stricter than true
- min_maturity: verified is stricter than reviewed is stricter than draft
- lock_mode: locked is stricter than pinned_required is stricter than open
- on_exceed: block is stricter than require_approval is stricter than warn is stricter than degrade

## If not comparable
If the engine cannot determine strictness ordering:
- deny_by_default == true → deny
- otherwise require_approval

## Overrides
Overrides can relax a restriction only if:
- policy_set.override_permissions[hook_point][risk_class] == true
- override expiry <= max_override_duration_hours[risk_class]
