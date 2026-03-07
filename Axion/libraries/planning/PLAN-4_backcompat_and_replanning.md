---
library: planning
id: PLAN-4
title: Backward Compatibility and Replanning
schema_version: 1.0.0
status: draft
---

# PLAN-4 — Backward Compatibility and Replanning

## Purpose

When plan structures or planning policies change, existing plans and downstream consumers must not break silently. This doctrine defines backward compatibility guarantees, replanning triggers, and migration paths.

## Backward Compatibility Rules

1. **Schema versioning**: All planning schemas use semantic versioning. Minor versions add optional fields only. Major versions may remove or rename fields.
2. **Plan unit ID stability**: Once a `plan_item_id` is assigned, it MUST NOT be reassigned to a different canonical entity within the same run.
3. **Additive-only for minor releases**: New plan unit fields added in minor versions MUST have default values so older consumers can ignore them.
4. **Deprecation window**: Fields or policies being removed MUST be marked `deprecated` for at least one minor version before removal.

## Replanning Triggers

A replan MUST be initiated when:

| Trigger | Description |
|---|---|
| `canonical_spec_change` | Canonical entities added, removed, or structurally modified. |
| `standards_rule_change` | Standards rules added, removed, or severity changed. |
| `template_version_bump` | A selected template's major version changes. |
| `coverage_rule_change` | Planning coverage rules in this library are updated. |
| `manual_override` | Operator explicitly requests a replan. |

A replan MAY be deferred when:

- Only minor/patch template changes occurred.
- The drift report shows zero `unmapped` gaps.

## Replanning Process

1. Snapshot current plan state (preserve for audit).
2. Re-run plan generation with updated inputs.
3. Diff old plan vs. new plan: identify added, removed, and modified plan units.
4. Carry forward `satisfied` status for unchanged plan units.
5. Reset status to `pending` for modified or new plan units.
6. Record the replan event in the planning decision report.

## Migration Paths

| From Version | To Version | Migration |
|---|---|---|
| planning_unit v1 | planning_unit v2 (future) | Add new optional fields with defaults; no data loss. |
| planning_decision_report v1 | planning_decision_report v2 (future) | Extend gap_analysis with new gap classes; existing classes preserved. |

## Governing Rules

1. Breaking changes to plan schemas MUST increment the major version.
2. Replanning MUST preserve audit trail of the previous plan.
3. Plan unit IDs from the previous plan MUST be reused where the mapping is unchanged.
4. Consumers MUST handle unknown fields gracefully (ignore, not error).

## Consumers

- Plan generation stage (S6)
- Incremental planner
- Audit trail
- Operator UI (replan history)
