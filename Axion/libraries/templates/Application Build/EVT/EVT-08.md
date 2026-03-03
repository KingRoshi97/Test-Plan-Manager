# EVT-08 — Event Observability (lag, success rate, tracing)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-08                                             |
| Template Type     | Build / Events                                     |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with event-driven architecture        |
| Filled By         | Internal Agent                                     |
| Consumes          | SPEC_INDEX, DOMAIN_MAP, GLOSSARY, Standards Index, EVT-01, EVT-03, EVT-04, EVT-07 |
| Produces          | Filled Event Observability Document                |

## 2. Purpose

Define the canonical observability requirements for the eventing system, including required metrics, logs, traces, dashboards, and alerting for event production, delivery, consumption, retries, dedupe, and DLQ/replay flows. This template must be consistent with delivery semantics and failure handling and must not invent instrumentation that contradicts upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- EVT-01: `{{evt.catalog}}`
- EVT-03: `{{evt.map}}`
- EVT-04: `{{evt.delivery_semantics}}`
- EVT-07: `{{evt.failure_handling}}`

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| Core metrics (produce/deliver/consume)| spec       | No              |
| Lag measurement definition          | spec         | No              |
| Success/failure rate definitions    | spec         | No              |
| Retry metrics                       | spec         | No              |
| Dedupe metrics                      | spec         | No              |
| DLQ metrics                         | spec         | No              |
| Replay/backfill metrics             | spec         | No              |
| Log field requirements              | spec         | No              |
| Trace propagation requirements      | spec         | No              |
| Dashboard requirements              | spec         | No              |
| Alerting requirements               | spec         | No              |
| SLO/SLA hooks                       | spec         | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Per-event custom metrics    | spec   | Only if applicable               |
| Per-consumer dashboards     | spec   | Consumer-specific views          |
| Sampling rules for traces   | spec   | Cost/volume optimization         |
| Cost controls (cardinality) | spec   | Metric label controls            |
| Open questions              | agent  | Flagged unknowns                 |

## 6. Rules

- Observability signals MUST be keyed by stable identifiers (event_id, consumer_id, producer_id).
- Cardinality MUST be controlled; do not use unbounded IDs as metric labels.
- PII MUST be redacted in logs/traces per standards.
- Alerts MUST reference failure handling procedures from EVT-07 where relevant.

## 7. Output Format

### Required Headings (in order)

1. `## Observability Scope` — surfaces, coverage model, notes
2. `## Metrics — Core` — produce_count, deliver_count, consume_count, failure_count, success_rate, latency_ms, lag_ms, dimensions
3. `## Metrics — Retry/Dedupe` — retry_attempts, retry_rate, backoff_time, dedupe_hits, duplicate_rate
4. `## Metrics — DLQ/Replay/Backfill` — dlq_depth, dlq_age, replay_success, backfill_success
5. `## Log Requirements` — required fields, correlation IDs, redaction policy
6. `## Trace Requirements` — trace propagation, span attributes, sampling
7. `## Dashboards` — required panels, grouping
8. `## Alerts` — Table: alert_name, condition, threshold, severity, paging policy, EVT-07 ref
9. `## SLO Hooks` — SLO binding, measurement method
10. `## References` — EVT-01, EVT-03, EVT-04, EVT-07

## 8. Cross-References

- **Upstream**: EVT-01, EVT-03, EVT-04, EVT-07
- **Downstream**: ALRT-*, SLO-*
- **Standards**: STD-OBSERVABILITY, STD-UNKNOWN-HANDLING, STD-PII-REDACTION

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Core metrics + log fields            | Required  | Required     | Required |
| Retry/DLQ metrics + dashboards       | Optional  | Required     | Required |
| Alerts + SLO hooks + cardinality     | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, per_event_custom_metrics, per_consumer_dashboards, sampling_rules, cost_controls, open_questions
- If core metrics are UNKNOWN → block Completeness Gate.
- If log field requirements are UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] core_metrics_defined == true
- [ ] log_fields_defined == true
- [ ] alert_definitions_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
