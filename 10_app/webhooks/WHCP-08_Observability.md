# WHCP-08 — Observability (delivery rate, latency, failures)

## Header Block

| Field | Value |
|---|---|
| template_id | WHCP-08 |
| title | Observability (delivery rate, latency, failures) |
| type | webhook_observability |
| template_version | 1.0.0 |
| output_path | 10_app/webhooks/WHCP-08_Observability.md |
| compliance_gate_id | TMP-05.PRIMARY.WHCP |
| upstream_dependencies | ["WHCP-04", "WHCP-07", "IXS-07"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "WHCP-01", "WHCP-04", "WHCP-07", "IXS-07", "CER-05"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical observability requirements for webhooks: delivery rate, latency, failures,
signature/validation rejects, DLQ depth, dashboards, and alerts. This template must be
consistent with integration observability and must not introduce telemetry that violates
privacy/redaction rules.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-07 Error Handling: {{whcp.error_handling}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Core metrics set (attempts, success, failure)
- Latency metrics (p50/p95 or ms)
- Reject metrics (invalid signature, invalid schema)
- Per-webhook/per-subscription breakdown policy (avoid high-cardinality)
- DLQ/quarantine metrics (depth, age)
- Dashboards minimum panels
- Alerts (failure spike, latency spike, dlq stuck)
- Log field requirements (webhook_id, subscription_id hash, delivery_id)
- Redaction/no-PII rule
- Runbook references (triage)

## Optional Fields

- Tracing spans for delivery pipeline | OPTIONAL
- Sampling policy | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not log raw payloads unless explicitly allowed and redacted.
- Avoid high-cardinality dimensions; hash subscription identifiers where needed.
- Alerts must be actionable and tied to runbooks.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Core Metrics
attempt_metric: {{metrics.attempt_metric}}
success_metric: {{metrics.success_metric}}
failure_metric: {{metrics.failure_metric}} | OPTIONAL
2. Latency
latency_ms_metric: {{metrics.latency_ms_metric}}
percentiles: {{metrics.percentiles}} | OPTIONAL
3. Reject Metrics
invalid_signature_metric: {{reject.invalid_signature_metric}}
invalid_schema_metric: {{reject.invalid_schema_metric}} | OPTIONAL
4. DLQ / Quarantine Metrics
dlq_depth_metric: {{dlq.depth_metric}}
dlq_age_metric: {{dlq.age_metric}} | OPTIONAL
5. Breakdown Policy
allowed_dimensions: {{breakdown.allowed_dimensions}}
subscription_id_handling: {{breakdown.subscription_id_handling}}
(hash/omit/UNKNOWN)
6. Logs — Required Fields
timestamp: {{logs.timestamp}}
webhook_id: {{logs.webhook_id}}
direction: {{logs.direction}} | OPTIONAL
delivery_id: {{logs.delivery_id}} | OPTIONAL
subscription_id_hash: {{logs.subscription_id_hash}} | OPTIONAL
status_code: {{logs.status_code}} | OPTIONAL
duration_ms: {{logs.duration_ms}} | OPTIONAL
redaction_applied: {{logs.redaction_applied}}
7. Dashboards
dashboard_name: {{dash.name}}
minimum_panels: {{dash.minimum_panels}}
panel_list: {{dash.panel_list}} | OPTIONAL

8. Alerts
Alert
alert_id: {{alerts[0].alert_id}}
condition: {{alerts[0].condition}}
severity: {{alerts[0].severity}} (low/med/high/UNKNOWN)
routing: {{alerts[0].routing}}
runbook_ref: {{alerts[0].runbook_ref}} | OPTIONAL
(Repeat per alert.)
9. Runbooks
triage_runbook_ref: {{runbooks.triage_ref}} (expected: {{xref:WHCP-07}}) | OPTIONAL
10.References
Webhook catalog: {{xref:WHCP-01}}
Delivery semantics: {{xref:WHCP-04}} | OPTIONAL
Error handling: {{xref:WHCP-07}} | OPTIONAL
Integration observability baseline: {{xref:IXS-07}} | OPTIONAL

## Cross-References

Upstream: {{xref:WHCP-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define core metrics + no-PII rule + minimum panels.
intermediate: Required. Define alerts and log required fields and breakdown policy.
advanced: Required. Add tracing/sampling and refined dimension controls and runbook rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, percentiles, optional reject metrics, dlq
age metric, panel list, runbook refs, optional log fields, optional alerts fields, tracing/sampling,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If metrics.attempt_metric is UNKNOWN → block Completeness Gate.
If reject.invalid_signature_metric is UNKNOWN → block Completeness Gate.
If dash.minimum_panels is UNKNOWN → block Completeness Gate.
If logs.webhook_id is UNKNOWN → block Completeness Gate.
If breakdown.subscription_id_handling is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
core_metrics_defined == true

logging_and_redaction_defined == true
dashboards_and_alerts_defined == true
breakdown_policy_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
