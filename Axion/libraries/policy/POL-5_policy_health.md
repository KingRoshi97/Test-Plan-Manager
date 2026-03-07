---
library: policy
doc_id: POL-5-GOV
title: Policy Health
version: 1.0.0
status: draft
---

# POL-5-GOV — Policy Health

## Purpose

Policy health measures how well the governance system is functioning. This
doctrine defines the metrics, thresholds, and reporting cadence for policy
health monitoring.

## Health Dimensions

### 1. Coverage

- **Definition**: percentage of enforceable scopes (stages, gates, libraries)
  covered by at least one active policy unit.
- **Target**: 100% for COMPLIANCE, 90% for PROD, no minimum for PROTOTYPE.

### 2. Freshness

- **Definition**: percentage of active policy units whose version was updated
  within the freshness window.
- **Freshness window**: 180 days.
- **Target**: 80% of active units within window.

### 3. Override Rate

- **Definition**: ratio of `override` outcomes to total evaluations in decision
  reports over a rolling 30-day window.
- **Threshold**: > 15% triggers a review.
- **Alarm**: > 30% triggers escalation.

### 4. Conflict Rate

- **Definition**: number of scope conflicts resolved by the conflict resolution
  algorithm per 1000 evaluations.
- **Target**: < 5 per 1000. Sustained elevation indicates overlapping or
  redundant policy units.

### 5. Supersession Backlog

- **Definition**: count of `deprecated` policy units that have not yet
  transitioned to `superseded`.
- **Target**: 0 outside of active transition windows.

## Reporting

- Health metrics are computed per run and aggregated daily.
- A health summary is included in each decision report under `health_snapshot`.
- Dashboards surface trends for override rate, conflict rate, and coverage.

## Remediation

| Signal                        | Action                                  |
|-------------------------------|-----------------------------------------|
| Coverage gap                  | Author missing policy units             |
| Stale units (freshness < 80%) | Review and re-certify or deprecate      |
| High override rate            | Tighten override approval or relax rule |
| High conflict rate            | Refactor overlapping unit scopes        |
| Supersession backlog          | Complete pending migrations             |
