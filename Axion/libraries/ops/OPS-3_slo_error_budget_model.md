---
library: ops
id: OPS-3
section: slo_error_budget_model
schema_version: 1.0.0
status: draft
---

# OPS-3 — SLO/SLA & Error Budget Policy

## Overview
The SLO/SLA and error budget model defines the service-level objectives for Axion pipeline
runs, the measurement windows over which they are evaluated, and the enforcement actions
triggered when error budgets are consumed too quickly.

## SLO Definition Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `slo_id` | string | yes | Unique identifier (e.g., `SLO-RUN-SUCCESS`) |
| `name` | string | yes | Human-readable SLO name |
| `window_days` | integer | yes | Rolling window for measurement |
| `objective` | number | conditional | Target ratio (0.0–1.0) for ratio-based SLOs |
| `objective_ms` | integer | conditional | Target latency in milliseconds for latency-based SLOs |
| `measurement` | string | yes | Formula or metric expression for evaluation |

## SLO Types

### Availability / Success Rate
Measures the ratio of successful runs to total started runs over the measurement window.
Example: 99% of runs complete successfully within a 30-day window.

### Latency
Measures a percentile of run duration over the measurement window.
Example: p95 run latency stays below 600,000 ms (10 minutes) within a 30-day window.

## Error Budget

The error budget is the inverse of the SLO — the tolerable amount of failure within a window.
For a 99% success rate SLO over 30 days, the error budget allows 1% of runs to fail.

### Burn Alerts

Burn alerts fire when the error budget is being consumed faster than expected:

| Burn ID | Threshold | Window | Action |
|---|---|---|---|
| `EB-FAST` | 50% of budget consumed | 6 hours | Tighten gates — raise severity thresholds |
| `EB-SLOW` | 90% of budget consumed | 72 hours | Freeze changes — no new pipeline changes allowed |

### Enforcement Actions

- **tighten_gates**: Automatically escalate gate severity (warnings become blockers).
- **freeze_changes**: Block new pipeline configuration changes until budget recovers.

## Reference Data
Existing SLO policy is defined in `registries/SLO-01.slo_policy.v1.json`.

## Relationship to Other Sections
- **OPS-1 (Monitoring & Alerts)**: SLO burn alerts are a specialised category of monitoring alert.
- **OPS-4 (Performance Budgets)**: Latency SLOs depend on the same timing measurements as performance budgets.
- **OPS-6 (Ops Gates)**: Gate tightening is an enforcement action triggered by error budget burn.
