# IXS-07 — Observability (logs/metrics/traces, dashboards, alerts)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-07 |
| title | Observability (logs/metrics/traces, dashboards, alerts) |
| type | integration_observability |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-07_Observability.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["IXS-01", "IXS-02", "IXS-06", "CER-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "IXS-02", "IXS-06", "CER-05", "SMD-06"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical observability requirements for integrations: what must be logged, which
metrics must exist, trace/correlation rules, dashboards and alerting, and redaction/privacy
constraints. This template must be consistent with client/server logging policies and must not
introduce telemetry that violates privacy constraints.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}}
- IXS-06 Error Handling & Recovery: {{ixs.error_recovery}} | OPTIONAL
- CER-05 Logging & Crash Reporting: {{cer.logging}} | OPTIONAL
- SMD-06 Client Data Layer Observability: {{smd.observability}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Metric taxonomy (success/failure/latency/throughput)
- Per-integration metric requirements (integration_id → metrics)
- Log field requirements (integration_id, operation, request_id, error_class)
- Tracing/correlation rules (trace_id/span_id propagation)
- Redaction rules (no secrets/PII)
- Dashboards minimum set (integration health overview)
- Alerts rules (failure spikes, latency, DLQ depth)
- SLO/SLA monitoring fields (if applicable)
- Runbook linkage (where to look when alert fires)

## Optional Fields

- Sampling policy | OPTIONAL
- High-cardinality controls | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- No PII/secrets in logs/metrics; identifiers must be hashed or replaced as required.
- Metrics must use stable identifiers (integration_id) and avoid high-cardinality labels.
- Alerts must be actionable (include runbook references).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Core Metrics (Global)
success_count_metric: {{metrics.success_count}}
failure_count_metric: {{metrics.failure_count}}
latency_ms_metric: {{metrics.latency_ms}}
throughput_metric: {{metrics.throughput}} | OPTIONAL
2. Per-Integration Metrics
Integration Metrics
integration_id: {{per[0].integration_id}}
operations: {{per[0].operations}} | OPTIONAL
success_metric: {{per[0].success_metric}}
failure_metric: {{per[0].failure_metric}}
latency_metric: {{per[0].latency_metric}}
dlq_depth_metric: {{per[0].dlq_depth_metric}} | OPTIONAL
quota_metric: {{per[0].quota_metric}} | OPTIONAL
notes: {{per[0].notes}} | OPTIONAL
(Repeat per integration_id.)
3. Logs — Required Fields
timestamp: {{logs.timestamp}}
integration_id: {{logs.integration_id}}
operation: {{logs.operation}}
direction: {{logs.direction}} | OPTIONAL
request_id: {{logs.request_id}} | OPTIONAL
trace_id: {{logs.trace_id}} | OPTIONAL
error_class: {{logs.error_class}} | OPTIONAL
status_code: {{logs.status_code}} | OPTIONAL
duration_ms: {{logs.duration_ms}} | OPTIONAL
redaction_applied: {{logs.redaction_applied}}
4. Tracing / Correlation
propagation_rule: {{trace.propagation_rule}}
span_naming_rule: {{trace.span_naming_rule}} | OPTIONAL

5. Redaction / Privacy
no_pii_rule: {{privacy.no_pii_rule}}
no_secrets_rule: {{privacy.no_secrets_rule}}
field_allowlist: {{privacy.field_allowlist}} | OPTIONAL
6. Dashboards
integration_health_dashboard: {{dash.health_dashboard}}
minimum_panels: {{dash.minimum_panels}}
panel_list: {{dash.panel_list}} | OPTIONAL
7. Alerts
failure_spike_alert: {{alerts.failure_spike}}
latency_spike_alert: {{alerts.latency_spike}} | OPTIONAL
dlq_stuck_alert: {{alerts.dlq_stuck}} | OPTIONAL
threshold_model: {{alerts.threshold_model}} (static/baseline/UNKNOWN)
routing_policy: {{alerts.routing_policy}} | OPTIONAL
8. Runbooks
runbook_location: {{runbooks.location}}
per_integration_runbooks: {{runbooks.per_integration}} | OPTIONAL
9. References
Integration inventory: {{xref:IXS-01}}
Integration specs: {{xref:IXS-02}}
Error handling/DLQ: {{xref:IXS-06}} | OPTIONAL
Logging/redaction: {{xref:CER-05}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}}, {{xref:IXS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-10}}, {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define core metrics + required log fields + no-PII rules; use UNKNOWN for
dashboards tooling details.
intermediate: Required. Define per-integration metrics, dashboards, and failure alerts.
advanced: Required. Add tracing propagation rules, runbook mapping, and threshold model
rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, throughput metric, per ops list, optional
per metrics, notes, optional log fields, span naming, field allowlist, panel list, routing policy,
sampling/high-cardinality notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If logs.integration_id is UNKNOWN → block Completeness Gate.
If privacy.no_pii_rule is UNKNOWN → block Completeness Gate.

If dash.minimum_panels is UNKNOWN → block Completeness Gate.
If alerts.failure_spike is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
core_metrics_defined == true
per_integration_metrics_defined == true
log_fields_defined == true
privacy_rules_defined == true
dashboards_and_alerts_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
