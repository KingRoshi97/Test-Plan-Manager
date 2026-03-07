---
library: planning
id: PLAN-2
title: Planning Decision Report
schema_version: 1.0.0
status: draft
---

# PLAN-2 — Planning Decision Report

## Purpose

A planning decision report captures **what was planned**, performs **gap analysis** against the canonical spec and standards, and renders a **coverage verdict** for the run.

## Report Structure

| Field | Type | Description |
|---|---|---|
| `report_id` | string | Unique identifier (`PDR-` prefix). |
| `run_id` | string | The run this report belongs to. |
| `generated_at` | date-time | Timestamp of report generation. |
| `total_canonical_entities` | integer | Count of entities in the canonical spec. |
| `total_plan_units` | integer | Count of plan units generated. |
| `mapped_entities` | integer | Count of canonical entities with at least one plan unit. |
| `unmapped_entities` | array | List of canonical entity IDs with no plan unit. |
| `gap_analysis` | object | Detailed gap breakdown (see below). |
| `coverage_verdict` | enum | One of: `full`, `partial`, `insufficient`. |
| `verdict_reason` | string | Human-readable explanation of the verdict. |

## Gap Analysis Object

| Field | Type | Description |
|---|---|---|
| `unmapped_count` | integer | Entities with zero plan units. |
| `under_scoped_count` | integer | Entities mapped but missing required template outputs or standards obligations. |
| `unverifiable_count` | integer | Plan units with no acceptance evidence path defined. |
| `details` | array | Per-entity gap detail records. |

## Coverage Verdict Rules

- `full`: zero unmapped, zero under-scoped, zero unverifiable.
- `partial`: unmapped = 0, but under-scoped > 0 or unverifiable > 0.
- `insufficient`: unmapped > 0.

## Governing Rules

1. A planning decision report MUST be generated for every run before gate evaluation.
2. The report MUST enumerate all unmapped entities explicitly.
3. The coverage verdict MUST be computed deterministically from gap counts.
4. Reports are immutable once generated; amendments create a new report version.

## Schema Reference

Validated by: `axion://schemas/planning/planning_decision_report.v1`

## Consumers

- Gate evaluation (S8)
- Coverage scoring engine
- Operator UI (planning dashboard)
- Audit trail
