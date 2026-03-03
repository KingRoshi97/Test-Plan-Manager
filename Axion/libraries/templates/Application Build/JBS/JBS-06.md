# JBS-06 — Job Observability (metrics/logs/traces, alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-06                                             |
| Template Type     | Build / Jobs                                       |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with background jobs                  |
| Filled By         | Internal Agent                                     |
| Consumes          | JBS-01, JBS-02, JBS-04, JBS-05, OBS-01, RELIA-01, Standards Index |
| Produces          | Filled Job Observability Document                  |

## 2. Purpose

Define the canonical observability requirements for background jobs: required metrics, log fields, trace attributes, dashboard panels, and alerting rules for job execution, retries, DLQ depth, and SLO compliance.

## 3. Inputs Required

- JBS-01: `{{xref:JBS-01}}` | OPTIONAL
- JBS-02: `{{xref:JBS-02}}` | OPTIONAL
- JBS-04: `{{xref:JBS-04}}` | OPTIONAL
- JBS-05: `{{xref:JBS-05}}` | OPTIONAL
- OBS-01: `{{xref:OBS-01}}` | OPTIONAL
- RELIA-01: `{{xref:RELIA-01}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Core metrics (exec/success/fail)    | spec         | No              |
| Latency/duration metrics            | spec         | No              |
| Retry metrics (attempts/rate)       | spec         | No              |
| DLQ metrics (depth/age/drain)       | spec         | No              |
| Log field requirements              | spec         | No              |
| Correlation ID policy               | spec         | No              |
| PII redaction rules for logs        | spec         | No              |
| Trace attribute requirements        | spec         | No              |
| Dashboard requirements (min panels) | spec         | No              |
| Alert definitions (thresholds)      | spec         | No              |
| SLO hooks (binding to SLO docs)     | spec         | No              |
| Per-job observability bindings      | JBS-01       | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Per-job custom metrics      | spec   | Only if applicable               |
| Sampling rules for traces   | spec   | Cost/volume optimization         |
| Cardinality limits          | spec   | Metric label controls            |
| Notes                       | agent  | Enrichment only, no new truth    |

## 6. Rules

- Observability signals MUST be keyed by stable identifiers (job_id, run_id).
- Cardinality MUST be controlled; do not use unbounded IDs as metric labels.
- PII MUST be redacted in logs/traces per standards.
- Alerts MUST reference retry/DLQ procedures from JBS-04.
- All jobs must emit correlation IDs for distributed tracing.

## 7. Output Format

### Required Headings (in order)

1. `## Core Metrics` — Table: metric_name, type, labels, description
2. `## Retry & DLQ Metrics` — retry_attempts, retry_rate, dlq_depth, dlq_age
3. `## Log Requirements` — required fields, correlation IDs, redaction policy
4. `## Trace Requirements` — trace attributes, span naming, sampling
5. `## Dashboards` — required panels, grouping rules
6. `## Alerts` — Table: alert_name, condition, threshold, severity, paging_policy
7. `## SLO Hooks` — SLO binding, measurement method
8. `## Per-Job Observability Bindings` — Table: job_id, custom_metrics, custom_alerts, notes

## 8. Cross-References

- **Upstream**: JBS-01, JBS-04, OBS-01
- **Downstream**: ALRT-*, SLO-*, QA-03
- **Standards**: STD-OBSERVABILITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Core metrics + log fields            | Required  | Required     | Required |
| Retry/DLQ metrics + dashboards       | Optional  | Required     | Required |
| Alerts + SLO hooks + per-job binding | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: per_job_custom_metrics, sampling_rules, cardinality_limits, notes
- If core metrics are UNKNOWN → block Completeness Gate.
- If correlation ID policy is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] core_metrics_defined == true
- [ ] log_fields_defined == true
- [ ] alert_definitions_present == true
- [ ] per_job_bindings_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
