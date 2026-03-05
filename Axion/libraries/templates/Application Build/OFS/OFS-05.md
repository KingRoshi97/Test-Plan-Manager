# OFS-05 — Sync Observability (stuck queues, retries, metrics)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-05                                             |
| Template Type     | Build / Offline Support                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring sync observability (stuck queues, retries, metrics)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Sync Observability (stuck queues, retries, metrics) Document                         |

## 2. Purpose

Define the canonical observability requirements for offline sync: metrics for queue depth/drain
success, stuck queue detection, retry/backoff visibility, conflict rates, and alerts/dashboards for
operational monitoring. This template must be consistent with client data-layer observability and
logging/redaction policies and must not invent telemetry fields that violate privacy constraints.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- OFS-02 Sync Model: {{ofs.sync_model}}
- SMD-06 Client Data Layer Observability: {{smd.observability}} | OPTIONAL
- CER-05 Client Logging/Crash Reporting: {{cer.logging}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Core sync metrics set ... | spec         | Yes             |
| Stuck queue detection ... | spec         | Yes             |
| Retry/backoff metrics ... | spec         | Yes             |
| Conflict rate metrics ... | spec         | Yes             |
| Log field requirements... | spec         | Yes             |
| Dashboards minimum panels | spec         | Yes             |
| Alerts (stuck queues, ... | spec         | Yes             |
| Privacy/redaction cons... | spec         | Yes             |

## 5. Optional Fields

Per-entity sync health | OPTIONAL
Sampling policy | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Stuck detection MUST be deterministic and based on measurable time/attempt thresholds.
No PII in sync telemetry/logs.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Core Metrics
queue_depth: {{metrics.queue_depth}}
drain_success: {{metrics.drain_success}}
drain_failure: {{metrics.drain_failure}} | OPTIONAL
drain_duration_ms: {{metrics.drain_duration_ms}} | OPTIONAL
2. Stuck Queue Detection
stuck_definition: {{stuck.definition}}
stuck_threshold_ms: {{stuck.threshold_ms}} | OPTIONAL
max_attempts_before_stuck: {{stuck.max_attempts}} | OPTIONAL
3. Retry / Backoff Visibility
retry_attempts_metric: {{retry.retry_attempts_metric}}
backoff_time_metric: {{retry.backoff_time_metric}} | OPTIONAL
4. Conflict Metrics
conflict_metric: {{conflicts.metric}} | OPTIONAL
resolution_metric: {{conflicts.resolution_metric}} | OPTIONAL
5. Logs — Required Fields
timestamp: {{logs.timestamp}}
op_id: {{logs.op_id}}
queue_status: {{logs.queue_status}} | OPTIONAL
attempt_count: {{logs.attempt_count}} | OPTIONAL
error_code: {{logs.error_code}} | OPTIONAL
endpoint_id: {{logs.endpoint_id}} | OPTIONAL
redaction_applied: {{logs.redaction_applied}} | OPTIONAL
6. Dashboards
sync_dashboard: {{dashboards.sync_dashboard}}
minimum_panels: {{dashboards.minimum_panels}}
7. Alerts
stuck_queue_alert: {{alerts.stuck_queue_alert}}
drain_failure_spike_alert: {{alerts.drain_failure_spike_alert}} | OPTIONAL
threshold_model: {{alerts.threshold_model}} (static/baseline/UNKNOWN)
routing_policy: {{alerts.routing_policy}} | OPTIONAL
8. Privacy / Redaction
no_pii_rule: {{privacy.no_pii_rule}}
field_allowlist: {{privacy.field_allowlist}} | OPTIONAL
9. References
Sync model: {{xref:OFS-02}}

Client observability: {{xref:SMD-06}} | OPTIONAL
Client logging: {{xref:CER-05}} | OPTIONAL
Retry patterns: {{xref:CER-02}} | OPTIONAL
Cross-References
Upstream: {{xref:OFS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OPS-OBS}} | OPTIONAL
Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define queue depth + stuck definition; use UNKNOWN for
dashboards/alerts tooling.
intermediate: Required. Define alerts and required log fields.
advanced: Required. Add per-entity health and sampling policies.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional metrics, thresholds/max
attempts, conflict metrics, optional log fields, field allowlist, routing policy, per-entity/sampling,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If stuck.definition is UNKNOWN → block Completeness Gate.
If logs.op_id is UNKNOWN → block Completeness Gate.
If dashboards.minimum_panels is UNKNOWN → block Completeness Gate.
If privacy.no_pii_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OFS
Pass conditions:
required_fields_present == true
core_metrics_defined == true
stuck_detection_defined == true
log_fields_defined == true
dashboard_and_alerts_defined == true
privacy_constraints_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Mobile Performance & Battery (MBAT)

Mobile Performance & Battery (MBAT)
MBAT-01 Background Work Rules (limits, schedules)
MBAT-02 Network Usage Policy (batching, retries, metered)
MBAT-03 Battery Budget & Constraints (targets)
MBAT-04 Perf Profiling Plan (mobile tooling)

MBAT-01

MBAT-01 — Background Work Rules (limits, schedules)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Stuck detection MUST be deterministic and based on measurable time/attempt thresholds.**
- **No PII in sync telemetry/logs.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Core Metrics`
2. `## Stuck Queue Detection`
3. `## Retry / Backoff Visibility`
4. `## Conflict Metrics`
5. `## Logs — Required Fields`
6. `## Dashboards`
7. `## Alerts`
8. `## Privacy / Redaction`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:OFS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OPS-OBS}} | OPTIONAL**
- **Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
