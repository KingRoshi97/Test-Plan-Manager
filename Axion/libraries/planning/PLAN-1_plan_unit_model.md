---
library: planning
id: PLAN-1
title: Plan Unit Model
schema_version: 1.0.0
status: draft
---

# PLAN-1 — Plan Unit Model

## Purpose

Every plan item is a **governed unit**. This doctrine defines the structure and obligations of a single planning unit within an Axion run.

## Plan Unit Structure

| Field | Type | Description |
|---|---|---|
| `plan_item_id` | string | Unique identifier for this plan unit (`PU-` prefix). |
| `mapped_canonical_entity` | string | Reference to the canonical entity this unit addresses. |
| `template_output` | string | The template artifact this unit is expected to produce. |
| `standards_obligation` | string | The standards rule(s) this unit must satisfy. |
| `acceptance_evidence` | string | The acceptance criterion or proof artifact that demonstrates completion. |
| `status` | enum | One of: `pending`, `active`, `satisfied`, `failed`. |

## Governing Rules

1. Every plan unit MUST map to exactly one canonical entity.
2. Every plan unit MUST reference at least one template output.
3. Every plan unit MUST declare its standards obligation(s).
4. Every plan unit MUST specify acceptance evidence required for closure.
5. A plan unit with status `satisfied` MUST have non-empty acceptance evidence on record.
6. A plan unit with status `failed` MUST include a failure reason.

## Lifecycle

```
pending → active → satisfied
                 → failed
```

- `pending`: unit created during plan generation, not yet executed.
- `active`: execution has begun for this unit.
- `satisfied`: acceptance evidence has been recorded and validated.
- `failed`: unit could not be satisfied; failure reason recorded.

## Schema Reference

Validated by: `axion://schemas/planning/planning_unit.v1`

## Consumers

- Plan generation stage (S6)
- Coverage scoring engine
- Gate evaluation (S8)
- Operator UI (plan unit detail view)
