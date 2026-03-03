# IXS-07 — Integration Testing Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-07                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring integration testing spec  |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, IXS-02, IXS-06, CER-05                   |
| Produces          | Filled Integration Testing Spec                  |

## 2. Purpose

Define the canonical observability requirements for integrations: what must be logged, which metrics must exist, trace/correlation rules, dashboards and alerting, and redaction/privacy constraints. This template must be consistent with client/server logging policies and must not introduce telemetry that violates privacy constraints.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}`
- IXS-02 Integration Specs: `{{ixs.integration_specs}}`
- IXS-06 Error Handling & Recovery: `{{ixs.error_recovery}}` | OPTIONAL
- CER-05 Logging & Crash Reporting: `{{cer.logging}}` | OPTIONAL
- SMD-06 Client Data Layer Observability: `{{smd.observability}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Metric taxonomy | success/failure/latency/throughput |
| Per-integration metric requirements | integration_id → metrics |
| Log field requirements | integration_id, operation, request_id, error_class |
| Tracing/correlation rules | trace_id/span_id propagation |
| Redaction rules | No secrets/PII |
| Dashboards minimum set | Integration health overview |
| Alerts rules | Failure spikes, latency, DLQ depth |
| SLO/SLA monitoring fields | If applicable |
| Runbook linkage | Where to look when alert fires |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Sampling policy | OPTIONAL |
| High-cardinality controls | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- No PII/secrets in logs/metrics; identifiers must be hashed or replaced as required.
- Metrics must use stable identifiers (integration_id) and avoid high-cardinality labels.
- Alerts must be actionable (include runbook references).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}`, `{{xref:IXS-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-10}}`, `{{xref:ADMIN-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-PII-REDACTION]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Define core metrics + required log fields + no-PII rules; use UNKNOWN for dashboards tooling details.
- **intermediate**: Required. Define per-integration metrics, dashboards, and failure alerts.
- **advanced**: Required. Add tracing propagation rules, runbook mapping, and threshold model rigor.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, throughput metric, per ops list, optional per metrics, notes, optional log fields, span naming, field allowlist, panel list, routing policy, sampling/high-cardinality notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `logs.integration_id` is UNKNOWN → block Completeness Gate.
- If `privacy.no_pii_rule` is UNKNOWN → block Completeness Gate.
- If `dash.minimum_panels` is UNKNOWN → block Completeness Gate.
- If `alerts.failure_spike` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] core_metrics_defined == true
- [ ] per_integration_metrics_defined == true
- [ ] log_fields_defined == true
- [ ] privacy_rules_defined == true
- [ ] dashboards_and_alerts_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

