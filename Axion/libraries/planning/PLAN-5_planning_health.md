---
library: planning
id: PLAN-5
title: Planning Health
schema_version: 1.0.0
status: draft
---

# PLAN-5 — Planning Health

## Purpose

Planning health provides a consolidated view of plan quality: coverage completeness, stale items, unmapped entities, and drift status. This doctrine defines health metrics and a validation checklist.

## Health Metrics

| Metric | Formula | Healthy Threshold |
|---|---|---|
| `plan_coverage_ratio` | mapped_entities / total_canonical_entities | 1.0 |
| `stale_item_ratio` | stale_plan_units / total_plan_units | 0.0 |
| `unmapped_entity_count` | count of entities with no plan unit | 0 |
| `unverifiable_unit_count` | plan units with no acceptance evidence path | 0 |
| `drift_detected` | boolean from latest drift report | false |
| `under_scoped_count` | plan units missing required outputs or obligations | 0 |

## Health Status

| Status | Condition |
|---|---|
| `healthy` | All metrics at healthy threshold. |
| `degraded` | Coverage ratio = 1.0 but stale_item_ratio > 0 or under_scoped_count > 0 or unverifiable_unit_count > 0. |
| `unhealthy` | Coverage ratio < 1.0 or unmapped_entity_count > 0. |
| `unknown` | Health check has not been run or data is unavailable. |

## Validation Checklist

Before a plan can be considered ready for gate evaluation:

- [ ] Every canonical entity has at least one plan unit (`unmapped_entity_count = 0`).
- [ ] Every plan unit references a template output.
- [ ] Every plan unit declares standards obligation(s).
- [ ] Every plan unit has an acceptance evidence path.
- [ ] No plan units are stale (drift detection passed).
- [ ] Planning decision report has been generated.
- [ ] Coverage verdict is `full` or `partial` with documented justification.

## Drift Detection Integration

- Health status MUST incorporate the latest drift report.
- If `drift_detected = true`, health status cannot be `healthy`.
- Stale plan units identified by drift MUST be included in `stale_item_ratio`.

## Governing Rules

1. Planning health MUST be computed before gate evaluation.
2. A plan with `unhealthy` status MUST NOT pass planning gates without explicit policy override.
3. Health metrics MUST be recorded in the planning decision report.
4. Health checks are idempotent and may be re-run at any time.

## Consumers

- Gate evaluation (S8)
- Coverage scoring engine
- Operator UI (health dashboard)
- Planning decision report generation
