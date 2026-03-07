---
library: ops
id: OPS-5
section: cost_quota_model
schema_version: 1.0.0
status: draft
---

# OPS-5 — Cost Models & Quota Hooks

## Overview
The cost model defines the capacity assumptions, compute and storage units, and
per-run / per-day estimates that govern resource consumption. Quota hooks provide
policy integration points where the pipeline can enforce resource limits before
or during execution.

## Cost Model Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `model_id` | string | yes | Identifier for the cost model variant (e.g., `DEFAULT`) |
| `assumptions` | object | yes | Baseline capacity assumptions |
| `units` | object | yes | Unit definitions for compute and storage |
| `estimates` | object | yes | Per-run and per-day resource estimates |

## Capacity Assumptions

| Assumption | Value | Unit |
|---|---|---|
| Average run CPU time | 120 | cpu_seconds |
| Average run memory | 512 | megabytes |
| Average artifact storage per run | 25 | megabytes |
| Expected runs per day | 20 | count |

## Unit Definitions

- **compute**: Measured in `cpu_seconds` — the total CPU time consumed by a run.
- **storage**: Measured in `megabytes` — the total artifact storage consumed by a run.

## Resource Estimates

### Per Run
- Compute: 120 cpu_seconds
- Storage: 25 MB

### Per Day
- Compute: 2,400 cpu_seconds (20 runs × 120 cpu_seconds)
- Storage: 500 MB (20 runs × 25 MB)

## Quota Hooks

Quota hooks are policy integration points evaluated at key pipeline moments:

| Hook | Trigger Point | Action on Breach |
|---|---|---|
| `pre_run_quota` | Before run starts | Reject run if daily quota exceeded |
| `mid_run_compute` | After each stage | Warn if run is consuming more than 150% of per-run compute estimate |
| `post_run_storage` | After kit packaging | Warn if artifact storage exceeds 200% of per-run storage estimate |

## Reference Data
Existing cost model is defined in `registries/COST-01.capacity_cost_model.v1.json`.

## Relationship to Other Sections
- **OPS-4 (Performance Budgets)**: Run duration directly affects compute cost estimates.
- **OPS-3 (SLO/Error Budgets)**: Budget freeze actions may impact cost projections.
- **OPS-6 (Ops Gates)**: Quota breaches may be surfaced as gate evidence.
