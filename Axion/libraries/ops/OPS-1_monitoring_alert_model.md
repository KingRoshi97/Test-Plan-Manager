---
library: ops
id: OPS-1
section: monitoring_alert_model
schema_version: 1.0.0
status: draft
---

# OPS-1 — Monitoring & Alert Standards

## Overview
The monitoring and alert model defines how Axion pipeline runs are observed in real time,
what conditions trigger alerts, and how alerts escalate through defined tiers. Every alert
rule is a declarative specification — it declares the condition, severity, notification
channels, and cooldown policy without embedding execution logic.

## Alert Rule Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `rule_id` | string | yes | Unique identifier (e.g., `ALRT01-01`) |
| `name` | string | yes | Human-readable alert name |
| `condition` | string | yes | Boolean expression evaluated against run metrics |
| `severity` | enum | yes | `critical`, `high`, `med`, `low` |
| `channels` | string[] | yes | Notification targets (e.g., `console`, `webhook`) |
| `cooldown_minutes` | integer | yes | Minimum interval between repeated firings |

## Severity Levels

- **critical**: Immediate operator attention required. Pipeline may halt or lose data.
- **high**: Run failures or gate failures exceeding thresholds. Investigate within minutes.
- **med**: Budget overruns or elevated error rates. Investigate within the current session.
- **low**: Informational. Logged for trend analysis, no immediate action required.

## Alert Lifecycle

1. **Condition met** — the evaluator detects the threshold breach.
2. **Alert fired** — a structured alert record is created with timestamp, rule_id, severity, and context.
3. **Cooldown active** — repeated firings of the same rule are suppressed for `cooldown_minutes`.
4. **Acknowledged** — an operator marks the alert as seen (optional, depends on channel).
5. **Resolved** — the condition clears and the alert record is closed.

## Escalation Tiers

| Tier | Trigger | Action |
|---|---|---|
| T1 — Auto | Alert fires | Log to console, record in run metrics |
| T2 — Notify | Alert persists beyond 2× cooldown | Surface in operator dashboard |
| T3 — Escalate | Alert persists beyond 4× cooldown or severity is `critical` | Flag run for manual review |

## Reference Data
Existing alert rules are defined in `registries/ALRT-01.monitoring_alert_rules.v1.json`.
The schema for alert rule definitions is in `schemas/ALRT-01.monitoring_alert_rules.schema.v1.json`.

## Relationship to Other Sections
- **OPS-2 (Logging & Tracing)**: Alert evaluation may produce log entries that must conform to LTS standards.
- **OPS-3 (SLO/Error Budgets)**: SLO burn alerts are a specialised form of monitoring alert.
- **OPS-6 (Ops Gates)**: Gate failures may trigger monitoring alerts.
