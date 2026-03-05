# EVT-08 — Event Observability (lag, success rate, tracing)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-08                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring event observability (lag, success rate, tracing)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Event Observability (lag, success rate, tracing) Document                         |

## 2. Purpose

Define the canonical observability requirements for the eventing system, including required
metrics, logs, traces, dashboards, and alerting for event production, delivery, consumption,
retries, dedupe, and DLQ/replay flows. This template must be consistent with delivery semantics
and failure handling and must not invent instrumentation that contradicts upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- EVT-03 Producer/Consumer Map: {{evt.map}}
- EVT-04 Delivery Semantics: {{evt.delivery_semantics}}
- EVT-07 Failure Handling: {{evt.failure_handling}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Core metric set (produce/deliver/consume)
Lag measurement definition (where measured + units)
Success/failure rate definitions (per surface, per event_id, per consumer)
Retry metrics (attempts, backoff time, retry rate)
Dedupe metrics (duplicate count, dedupe hit rate)
DLQ metrics (depth, age, ingress rate, drain rate)
Replay/backfill metrics (requests, success, failure, throttling)
Log field requirements (correlation + redaction)
Trace propagation requirements (trace_id + span attributes)
Dashboard requirements (minimum panels)
Alerting requirements (threshold types + paging policy)
SLO/SLA hooks (how to bind to SLO docs if present)

Optional Fields
Per-event custom metrics | OPTIONAL
Per-consumer custom dashboards | OPTIONAL
Sampling rules for traces | OPTIONAL
Cost controls (metric cardinality limits) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Observability signals MUST be keyed by stable identifiers (event_id, consumer_id, producer_id)
where applicable.
Cardinality MUST be controlled; do not use unbounded IDs as metric labels unless explicitly
allowed.
PII MUST be redacted in logs/traces per: {{standards.rules[STD-PII-REDACTION]}} |
OPTIONAL
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Alerts MUST reference the failure handling procedures from {{xref:EVT-07}} where relevant.
Output Format
1. Observability Scope
surfaces: {{obs.surfaces}} (bus/webhook/ws/UNKNOWN)
coverage_model: {{obs.coverage_model}} (per event_id / per mapping / per surface)
notes: {{obs.notes}} | OPTIONAL
2. Metrics — Core
Required metric names (or naming rules):
produce_count: {{metrics.produce_count}}
deliver_count: {{metrics.deliver_count}} | OPTIONAL
consume_count: {{metrics.consume_count}}
failure_count: {{metrics.failure_count}}
success_rate: {{metrics.success_rate}}
latency_ms: {{metrics.latency_ms}}
lag_ms: {{metrics.lag_ms}}
Dimensions (labels):
event_id: {{metrics.labels.event_id}}
producer_id: {{metrics.labels.producer_id}} | OPTIONAL
consumer_id: {{metrics.labels.consumer_id}} | OPTIONAL
surface: {{metrics.labels.surface}} | OPTIONAL
env: {{metrics.labels.env}} | OPTIONAL
3. Metrics — Retry/Dedupe
retry_attempts: {{metrics.retry_attempts}}
retry_rate: {{metrics.retry_rate}} | OPTIONAL
backoff_time_ms: {{metrics.backoff_time_ms}} | OPTIONAL

dedupe_hits: {{metrics.dedupe_hits}}
duplicate_rate: {{metrics.duplicate_rate}} | OPTIONAL
4. Metrics — DLQ/Replay/Backfill
dlq_depth: {{metrics.dlq_depth}} | OPTIONAL
dlq_oldest_age_ms: {{metrics.dlq_oldest_age_ms}} | OPTIONAL
dlq_ingress_rate: {{metrics.dlq_ingress_rate}} | OPTIONAL
dlq_drain_rate: {{metrics.dlq_drain_rate}} | OPTIONAL
replay_requests: {{metrics.replay_requests}} | OPTIONAL
replay_success: {{metrics.replay_success}} | OPTIONAL
replay_failure: {{metrics.replay_failure}} | OPTIONAL
backfill_requests: {{metrics.backfill_requests}} | OPTIONAL
backfill_success: {{metrics.backfill_success}} | OPTIONAL
backfill_failure: {{metrics.backfill_failure}} | OPTIONAL
5. Logs — Required Fields
All producer/consumer logs MUST include:
timestamp: {{logs.fields.timestamp}}
event_id: {{logs.fields.event_id}}
event_version: {{logs.fields.event_version}} | OPTIONAL
producer_id: {{logs.fields.producer_id}} | OPTIONAL
consumer_id: {{logs.fields.consumer_id}} | OPTIONAL
request_id: {{logs.fields.request_id}} | OPTIONAL
trace_id: {{logs.fields.trace_id}} | OPTIONAL
delivery_attempt: {{logs.fields.delivery_attempt}} | OPTIONAL
dedupe_key: {{logs.fields.dedupe_key}} | OPTIONAL
result: {{logs.fields.result}} (success/failure)
failure_class: {{logs.fields.failure_class}} | OPTIONAL
error_code: {{logs.fields.error_code}} | OPTIONAL
redaction_applied: {{logs.fields.redaction_applied}} | OPTIONAL
6. Tracing — Propagation & Attributes
trace_required: {{tracing.required}}
propagation_headers: {{tracing.propagation_headers}} | OPTIONAL
span_attributes_required:
event_id: {{tracing.attrs.event_id}}
consumer_id: {{tracing.attrs.consumer_id}} | OPTIONAL
producer_id: {{tracing.attrs.producer_id}} | OPTIONAL
surface: {{tracing.attrs.surface}} | OPTIONAL
attempt: {{tracing.attrs.attempt}} | OPTIONAL
sampling_policy: {{tracing.sampling_policy}} | OPTIONAL
7. Dashboards (Minimum)
Dashboards to provide:
overview_dashboard: {{dashboards.overview}}
per_consumer_dashboard: {{dashboards.per_consumer}} | OPTIONAL
dlq_dashboard: {{dashboards.dlq}} | OPTIONAL

webhook_dashboard: {{dashboards.webhook}} | OPTIONAL
Minimum panels per dashboard: {{dashboards.min_panels}}
8. Alerting Requirements
Alert classes:
● lag_high: {{alerts.lag_high}}
● failure_rate_high: {{alerts.failure_rate_high}}
● dlq_depth_high: {{alerts.dlq_depth_high}} | OPTIONAL
● replay_failures: {{alerts.replay_failures}} | OPTIONAL
Threshold definition model: {{alerts.threshold_model}} (static/baseline/UNKNOWN)
Routing/paging policy: {{alerts.routing_policy}} | OPTIONAL
Runbook/procedure ref: {{alerts.runbook_ref}} (expected: {{xref:EVT-07}}) | OPTIONAL
9. SLO Hooks (Optional)
slo_doc_ref: {{obs.slo_doc_ref}} | OPTIONAL
slo_targets: {{obs.slo_targets}} | OPTIONAL
10.Cardinality & Cost Controls (Optional)
label_allowlist: {{cost.label_allowlist}} | OPTIONAL
high_cardinality_labels_disallowed: {{cost.disallowed_labels}} | OPTIONAL
sampling_controls: {{cost.sampling_controls}} | OPTIONAL
11.References
Event catalog: {{xref:EVT-01}}
Producer/consumer map: {{xref:EVT-03}}
Delivery semantics: {{xref:EVT-04}}
Failure handling: {{xref:EVT-07}}
Cross-References
Upstream: {{xref:EVT-01}}, {{xref:EVT-03}}, {{xref:EVT-04}}, {{xref:EVT-07}},
{{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for tooling specifics; define required signal categories and
keys.
intermediate: Required. Define metric/log/trace fields and minimum dashboards/alerts.
advanced: Required. Add cardinality controls, sampling rules, and SLO bindings.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, deliver_count, producer_id/consumer_id
labels, retry_rate, backoff_time_ms, duplicate_rate, dlq_* metrics, replay/backfill metrics,
propagation_headers, sampling_policy, dashboards., alerts.routing_policy, alerts.runbook_ref,
obs.slo_doc_ref, obs.slo_targets, cost. , open_questions
If any Required Field is UNKNOWN, allow only if:

{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If logs required fields are UNKNOWN → block Completeness Gate.
If tracing.required is UNKNOWN → flag in Open Questions.
Completeness Gate
Gate ID: TMP-05.PRIMARY.EVENTING
Pass conditions:
required_fields_present == true
metric_set_defined == true
log_fields_defined == true
dashboard_minimum_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Rate Limits & Abuse Controls (RLIM)

Rate Limits & Abuse Controls (RLIM)
RLIM-01 Rate Limit Policy (global rules, scopes)
RLIM-02 Rate Limit Catalog (limits by surface/endpoint)
RLIM-03 Abuse Signals & Detection Rules
RLIM-04 Enforcement Actions Matrix (throttle/ban/captcha)
RLIM-05 Exemptions & Allowlist Policy
RLIM-06 Rate Limit Observability (alerts, dashboards)

RLIM-01

RLIM-01 — Rate Limit Policy (global rules, scopes)
Header Block

## 5. Optional Fields

Per-event custom metrics | OPTIONAL
Per-consumer custom dashboards | OPTIONAL
Sampling rules for traces | OPTIONAL
Cost controls (metric cardinality limits) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Observability signals MUST be keyed by stable identifiers (event_id, consumer_id, producer_id)**
- **where applicable.**
- **Cardinality MUST be controlled; do not use unbounded IDs as metric labels unless explicitly**
- **allowed.**
- **PII MUST be redacted in logs/traces per: {{standards.rules[STD-PII-REDACTION]}} |**
- **OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Alerts MUST reference the failure handling procedures from {{xref:EVT-07}} where relevant.**

## 7. Output Format

### Required Headings (in order)

1. `## Observability Scope`
2. `## Metrics — Core`
3. `## Required metric names (or naming rules):`
4. `## Dimensions (labels):`
5. `## Metrics — Retry/Dedupe`
6. `## Metrics — DLQ/Replay/Backfill`
7. `## Logs — Required Fields`
8. `## All producer/consumer logs MUST include:`
9. `## Tracing — Propagation & Attributes`
10. `## span_attributes_required:`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}}, {{xref:EVT-03}}, {{xref:EVT-04}}, {{xref:EVT-07}},**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OPS-OBS}} | OPTIONAL, {{xref:ALRT-01}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
