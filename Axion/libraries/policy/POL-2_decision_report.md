---
library: policy
doc_id: POL-2-GOV
title: Policy Decision Report
version: 1.0.0
status: draft
---

# POL-2-GOV — Policy Decision Report

## Purpose

Every policy evaluation produces a **decision report** — a structured, immutable
record of what was evaluated, what passed, what failed, and what overrides were
applied. Decision reports are the primary audit artifact for governance.

## Report Structure

| Field               | Type     | Description                                         |
|---------------------|----------|-----------------------------------------------------|
| `report_id`         | string   | Unique identifier for this report                   |
| `run_id`            | string   | The run that triggered evaluation                   |
| `timestamp`         | ISO 8601 | When the evaluation completed                       |
| `risk_class`        | enum     | Effective risk class for the run                    |
| `evaluated_units`   | array    | List of policy units evaluated                      |
| `results`           | array    | Per-unit outcome (`pass`, `fail`, `override`, `skip`) |
| `overrides_applied` | array    | Override records applied during evaluation          |
| `overall_outcome`   | enum     | `pass` · `fail` · `conditional_pass`                |
| `notes`             | string   | Free-text explanation or context                    |

## Result Entry

Each entry in `results`:

- `unit_id` — the policy unit evaluated
- `outcome` — `pass` | `fail` | `override` | `skip`
- `reason` — human-readable explanation
- `evidence` — references to artifacts that informed the decision

## Override Record

Each entry in `overrides_applied`:

- `override_id` — stable override identifier
- `unit_id` — which policy unit was overridden
- `approver` — identity that approved
- `expires_at` — ISO 8601 expiry timestamp
- `justification` — why the override was granted

## Immutability

Decision reports are append-only. Once written, they cannot be modified. Any
correction requires a new report referencing the original.

## Schema

Validated by `policy_decision_report.v1.schema.json`.
