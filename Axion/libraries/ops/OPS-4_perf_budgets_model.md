---
library: ops
id: OPS-4
section: perf_budgets_model
schema_version: 1.0.0
status: draft
---

# OPS-4 — Performance Budgets & Profiling

## Overview
The performance budgets model defines time budgets for each pipeline stage and for the
overall run, along with the profiling policy that governs when and how performance data
is captured. Every budget is a declarative ceiling — the runtime evaluator checks actual
timings against these ceilings and flags overruns.

## Stage Budget Fields

Each pipeline stage is assigned a maximum execution time:

| Stage ID | Budget (ms) | Description |
|---|---|---|
| `S1_INGEST_NORMALIZE` | 30,000 | Ingest and normalize inputs |
| `S2_INTAKE_VALIDATION` | 30,000 | Validate intake records |
| `S3_STANDARDS_RESOLUTION` | 30,000 | Resolve applicable standards |
| `S4_CANONICAL_BUILD` | 60,000 | Build canonical specification |
| `S5_TEMPLATE_SELECTION` | 30,000 | Select templates |
| `S6_PLAN_GENERATION` | 60,000 | Generate execution plan |
| `S7_TEMPLATE_FILL` | 120,000 | Fill templates with data |
| `S8_GATE_EVALUATION` | 60,000 | Evaluate quality gates |
| `S9_KIT_PACKAGE` | 120,000 | Package output kit |
| `S10_CLOSE` | 15,000 | Finalise and close the run |

## Run Budget

The total run budget is the maximum wall-clock time for a complete pipeline execution:
**600,000 ms (10 minutes)**.

The run budget is not simply the sum of stage budgets — it accounts for parallelism,
overhead, and inter-stage transitions.

## Profiling Policy

| Field | Type | Description |
|---|---|---|
| `enabled` | boolean | Whether profiling is active |
| `capture_threshold_ms` | integer | Minimum stage duration to trigger profile capture |
| `profile_output_path` | string | Path template for profile artifacts |

When profiling is enabled and a stage exceeds `capture_threshold_ms`, a profile artifact
is written to the run's performance directory.

## Budget Enforcement

- **Warning**: Stage exceeds 80% of its budget. Logged as `warn` level.
- **Overrun**: Stage exceeds 100% of its budget. Logged as `error` level and triggers an alert (OPS-1).
- **Run timeout**: Total run exceeds `run_budget_ms`. The run is terminated and marked as failed.

## Reference Data
Existing performance budgets are defined in `registries/PERF-01.performance_budgets.v1.json`.

## Relationship to Other Sections
- **OPS-1 (Monitoring & Alerts)**: Budget overruns trigger monitoring alerts.
- **OPS-3 (SLO/Error Budgets)**: Latency SLOs use the same timing infrastructure.
- **OPS-5 (Cost Models)**: Compute cost estimates depend on expected run duration.
