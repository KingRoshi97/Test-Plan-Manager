# MDC-05 — Device Capability Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | MDC-05                                           |
| Template Type     | Build / Device Capabilities                      |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring device capability observa |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Device Capability Observability           |

## 2. Purpose

Define the canonical telemetry requirements for mobile device capabilities: what metrics/logs/traces to collect for capability usage, errors, latency, permission outcomes, and fallback usage. This template must be consistent with client observability and logging/redaction rules and must not invent telemetry that violates privacy constraints.

## 3. Inputs Required

- MDC-01: `{{mdc.capabilities}}`
- MDC-04: `{{mdc.failures}}` | OPTIONAL
- SMD-06: `{{smd.observability}}` | OPTIONAL
- CER-05: `{{cer.logging}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Core capability metrics (attempts, success, failure) | spec | No |
| Latency metrics (time-to-result) | spec | Yes |
| Error taxonomy (denied/unavailable/error) | MDC-04 | No |
| Permission outcome metrics | MDC-02 | No |
| Fallback usage metrics | MDC-04 | Yes |
| Log field requirements (capability_id, error_type) | CER-05 | No |
| Redaction/privacy constraints (no PII) | CER-05 | No |
| Dashboards minimum panels | spec | No |
| Alerts (spikes in denied/unavailable/errors) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Tracing spans for capability ops | spec | Distributed tracing |
| Sampling policy | spec | Volume control |
| Open questions | agent | Enrichment only |

## 6. Rules

- No sensitive data in telemetry.
- Metrics MUST use stable identifiers (capability_id) and avoid high-cardinality labels.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Core Metrics` — attempts, success, failure
2. `## Latency Metrics` — latency_ms, time_to_first_result_ms
3. `## Error Taxonomy` — denied, unavailable, error
4. `## Permission Outcomes` — granted, denied_temp, denied_perm
5. `## Fallback Usage` — fallback_invocations, fallback_types
6. `## Logs — Required Fields` — timestamp, capability_id, result, error_type, latency_ms, screen_id, app_version, redaction_applied
7. `## Privacy / Redaction` — no_pii_rule, field_allowlist
8. `## Dashboards` — capability_health_dashboard, minimum_panels
9. `## Alerts` — denial_spike_alert, unavailable_spike_alert, error_spike_alert, threshold_model, routing_policy

## 8. Cross-References

- **Upstream**: MDC-01, SPEC_INDEX
- **Downstream**: OPS-OBS
- **Standards**: STD-PII-REDACTION, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Attempts/success/failure + log fields | Required | Required | Required |
| Dashboards + denial/error alerts | Optional | Required | Required |
| Sampling + tracing spans + thresholds | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, latency metrics, denied temp/perm, fallback details, optional log fields, field allowlist, routing policy, sampling/tracing, open_questions
- If logs.capability_id is UNKNOWN → block Completeness Gate.
- If privacy.no_pii_rule is UNKNOWN → block Completeness Gate.
- If dashboards.minimum_panels is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] core_metrics_defined == true
- [ ] log_fields_defined == true
- [ ] privacy_constraints_defined == true
- [ ] dashboard_minimum_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
