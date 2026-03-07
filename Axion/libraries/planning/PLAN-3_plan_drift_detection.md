---
library: planning
id: PLAN-3
title: Plan Drift Detection
schema_version: 1.0.0
status: draft
---

# PLAN-3 — Plan Drift Detection

## Purpose

Plans can become stale when upstream libraries (canonical, standards, templates) change after plan generation. This doctrine defines how drift is detected and classified.

## Drift Detection Triggers

A plan is potentially drifted when any of these upstream inputs have changed since `plan.generated_at`:

1. **Canonical spec** — entities added, removed, or modified.
2. **Standards snapshot** — rules added, removed, severity changed.
3. **Template selection** — templates added, removed, or version-bumped.
4. **Planning policies** — coverage rules or sequencing policies updated.

## Plan Gap Classes

| Gap Class | Definition | Severity |
|---|---|---|
| `unmapped` | A canonical entity exists with no corresponding plan unit. | critical |
| `under-scoped` | A plan unit exists but does not cover all required template outputs or standards obligations for its entity. | major |
| `unverifiable` | A plan unit exists but has no acceptance evidence path defined, making verification impossible. | major |

## Stale-Plan Detection Algorithm

1. Load the plan's `generated_at` timestamp and input hashes.
2. Compare against current hashes of canonical spec, standards snapshot, template selection, and planning policies.
3. If any hash differs, mark the plan as `potentially_stale`.
4. Enumerate changed upstream items and classify resulting gaps.
5. Produce a drift report with gap class counts and affected plan unit IDs.

## Drift Report Fields

| Field | Type | Description |
|---|---|---|
| `plan_id` | string | The plan being evaluated. |
| `drift_detected` | boolean | Whether any drift was found. |
| `stale_since` | date-time | Earliest upstream change timestamp. |
| `changed_inputs` | array | List of changed upstream input identifiers. |
| `gap_summary` | object | Counts by gap class: `unmapped`, `under_scoped`, `unverifiable`. |
| `affected_plan_units` | array | Plan unit IDs affected by drift. |

## Governing Rules

1. Drift detection MUST run before gate evaluation if the plan is older than the latest upstream change.
2. A plan with `unmapped` gaps MUST NOT pass coverage gates without explicit override.
3. Drift reports are append-only; each detection run produces a new record.

## Consumers

- Gate evaluation (S8)
- Incremental planner (re-plan on drift)
- Operator UI (drift warnings)
