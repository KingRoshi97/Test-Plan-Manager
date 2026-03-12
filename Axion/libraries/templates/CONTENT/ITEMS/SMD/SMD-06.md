# SMD-06 — Observability for Client Data Layer (logs/metrics)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-06                                             |
| Template Type     | Build / State Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability for client data layer (logs/metrics)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability for Client Data Layer (logs/metrics) Document                         |

## 2. Purpose

Define the canonical observability requirements for the client data layer: query/mutation metrics,
cache hit/miss, retry/backoff behavior, offline queue telemetry, realtime connection metrics, and
required log fields with redaction. This template must be consistent with state/caching/mutation
patterns and must not invent telemetry fields not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-02 Query/Cache Strategy: {{smd.cache_strategy}}
- SMD-03 Mutation Patterns: {{smd.mutation_patterns}}
- SMD-04 Realtime Subscription Patterns: {{smd.realtime_patterns}} | OPTIONAL
- SMD-05 Offline Handling: {{smd.offline_handling}} | OPTIONAL
- FE-07 Error Handling UX: {{fe.error_ux}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Core metrics set (query/mutation)
Cache metrics (hit/miss/stale served)
Retry metrics (attempts, backoff time)
Error metrics (by class)
Offline queue metrics (queue depth, drain success/fail)
Realtime metrics (connect/disconnect, lag) if applicable
Log field requirements (request_id, endpoint_id, error_code)
Redaction policy (no PII/secrets)
Dashboards minimum panels
Alerts (data layer failures/spikes)

Optional Fields
Sampling rules | OPTIONAL
User opt-out policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Telemetry MUST avoid high-cardinality labels (no raw IDs) unless explicitly allowed.
PII MUST be redacted in logs per: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Metrics — Queries
query_count: {{metrics.queries.query_count}}
query_success: {{metrics.queries.query_success}} | OPTIONAL
query_failure: {{metrics.queries.query_failure}} | OPTIONAL
query_latency_ms: {{metrics.queries.query_latency_ms}} | OPTIONAL
2. Metrics — Cache
cache_hit: {{metrics.cache.hit}}
cache_miss: {{metrics.cache.miss}}
stale_served: {{metrics.cache.stale_served}} | OPTIONAL
3. Metrics — Mutations
mutation_count: {{metrics.mutations.count}}
mutation_success: {{metrics.mutations.success}} | OPTIONAL
mutation_failure: {{metrics.mutations.failure}} | OPTIONAL
optimistic_rollback_count: {{metrics.mutations.optimistic_rollback}} | OPTIONAL
4. Metrics — Retry/Backoff
retry_attempts: {{metrics.retry.attempts}}
backoff_time_ms: {{metrics.retry.backoff_time_ms}} | OPTIONAL
5. Metrics — Errors
errors_by_class: {{metrics.errors.by_class}}
rate_limit_hits: {{metrics.errors.rate_limit_hits}} | OPTIONAL
session_expiry_events: {{metrics.errors.session_expiry_events}} | OPTIONAL
6. Metrics — Offline Queue (if applicable)
queue_depth: {{metrics.offline.queue_depth}} | OPTIONAL
queue_drain_success: {{metrics.offline.drain_success}} | OPTIONAL
queue_drain_failure: {{metrics.offline.drain_failure}} | OPTIONAL
7. Metrics — Realtime (if applicable)
ws_connected: {{metrics.realtime.connected}} | OPTIONAL
ws_disconnects: {{metrics.realtime.disconnects}} | OPTIONAL
ws_message_lag: {{metrics.realtime.message_lag}} | OPTIONAL
8. Logs — Required Fields
timestamp: {{logs.fields.timestamp}}

endpoint_id: {{logs.fields.endpoint_id}} | OPTIONAL
request_id: {{logs.fields.request_id}} | OPTIONAL
trace_id: {{logs.fields.trace_id}} | OPTIONAL
operation_type: {{logs.fields.operation_type}} (query/mutation/subscription/UNKNOWN)
result: {{logs.fields.result}}
error_code: {{logs.fields.error_code}} | OPTIONAL
status_code: {{logs.fields.status_code}} | OPTIONAL
retry_count: {{logs.fields.retry_count}} | OPTIONAL
redaction_applied: {{logs.fields.redaction_applied}} | OPTIONAL
9. Redaction Policy
pii_redaction: {{redaction.pii_redaction}}
secrets_redaction: {{redaction.secrets_redaction}}
field_allowlist: {{redaction.field_allowlist}} | OPTIONAL
10.Dashboards
data_layer_dashboard: {{dashboards.data_layer}}
offline_dashboard: {{dashboards.offline}} | OPTIONAL
realtime_dashboard: {{dashboards.realtime}} | OPTIONAL
minimum_panels: {{dashboards.minimum_panels}}
11.Alerts
query_failure_spike: {{alerts.query_failure_spike}}
mutation_failure_spike: {{alerts.mutation_failure_spike}} | OPTIONAL
offline_queue_stuck: {{alerts.offline_queue_stuck}} | OPTIONAL
realtime_disconnect_spike: {{alerts.realtime_disconnect_spike}} | OPTIONAL
threshold_model: {{alerts.threshold_model}} (static/baseline/UNKNOWN)
routing_policy: {{alerts.routing_policy}} | OPTIONAL
12.References
Cache strategy: {{xref:SMD-02}}
Mutation patterns: {{xref:SMD-03}}
Realtime patterns: {{xref:SMD-04}} | OPTIONAL
Offline handling: {{xref:SMD-05}} | OPTIONAL
Error UX: {{xref:FE-07}} | OPTIONAL
Cross-References
Upstream: {{xref:SMD-02}}, {{xref:SMD-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OPS-OBS}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define core metrics + log fields; use UNKNOWN for dashboards/alerts
tooling.
intermediate: Required. Add cache/retry/error/queue metrics and dashboard minimums.
advanced: Required. Add cardinality controls, alert thresholds, and opt-out/sampling policy if
needed.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional metrics fields, request/trace IDs,
status code, retry count, field allowlist, offline/realtime dashboards, alert routing,
sampling/opt-out, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If metrics.cache.hit/miss are UNKNOWN → block Completeness Gate.
If logs.fields.operation_type is UNKNOWN → block Completeness Gate.
If redaction policy is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SMD
Pass conditions:
required_fields_present == true
core_metrics_defined == true
log_fields_defined == true
redaction_policy_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Client Performance & Rendering (CPR)

Client Performance & Rendering (CPR)
CPR-01 Performance Budget (web + mobile targets)
CPR-02 Rendering Strategy (SSR/CSR, list virtualization)
CPR-03 Asset Loading Strategy (code split, lazy load)
CPR-04 Profiling Plan (what to measure, tools)
CPR-05 Perf Regression Gates (thresholds, CI checks)

CPR-01

CPR-01 — Performance Budget (web + mobile targets)
Header Block

## 5. Optional Fields

Sampling rules | OPTIONAL
User opt-out policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Telemetry MUST avoid high-cardinality labels (no raw IDs) unless explicitly allowed.**
- **PII MUST be redacted in logs per: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Metrics — Queries`
2. `## Metrics — Cache`
3. `## Metrics — Mutations`
4. `## Metrics — Retry/Backoff`
5. `## Metrics — Errors`
6. `## Metrics — Offline Queue (if applicable)`
7. `## Metrics — Realtime (if applicable)`
8. `## Logs — Required Fields`
9. `## Redaction Policy`
10. `## Dashboards`

## 8. Cross-References

- **Upstream: {{xref:SMD-02}}, {{xref:SMD-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OPS-OBS}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
