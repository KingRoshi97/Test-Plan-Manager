# IAM-10 — Access Observability (auth logs, auth failures, metrics)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAM-10                                             |
| Template Type     | Security / Identity & Access                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring access observability (auth logs, auth failures, metrics)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Access Observability (auth logs, auth failures, metrics) Document                         |

## 2. Purpose

Define the canonical observability for authentication and authorization: required logs, metrics,
dashboards, and alerts for access failures, suspicious patterns, and policy denials. This
template must align with audit schema requirements and security monitoring.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Auth methods: {{xref:IAM-02}} | OPTIONAL
- Session policy: {{xref:IAM-03}} | OPTIONAL
- AuthZ enforcement points: {{xref:IAM-04}} | OPTIONAL
- Audit schema: {{xref:AUDIT-02}} | OPTIONAL
- Security monitoring: {{xref:SEC-06}} | OPTIONAL
- Logging/redaction: {{xref:CER-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Log event types list (login_success, login_fail, authz_deny, token_refresh)
Required log fields (timestamp, user_id hash, tenant_id, ip hash, device id)
Redaction rules (no tokens, no secrets)
Core metrics (success rate, failure rate, deny rate)
Dashboards minimum panels
Alerts (credential stuffing, authz deny spike, refresh fail spike)
Alert routing policy (oncall/security)
Retention rules for auth logs
High-cardinality controls (hashing, sampling)
Runbook references (SEC-10)

Optional Fields
Geo anomaly rules | OPTIONAL
Risk scoring notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Never log tokens/secrets.
User identifiers should be hashed in logs unless explicitly approved.
Alerts must be actionable and link to runbooks.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Event Types
event_types: {{events.types}}
2. Log Fields
required_fields: {{logs.required_fields}}
hashing_rule: {{logs.hashing_rule}} | OPTIONAL
3. Redaction
no_token_logging_rule: {{redact.no_token_logging_rule}}
no_secret_logging_rule: {{redact.no_secret_logging_rule}} | OPTIONAL
4. Metrics
login_success_rate_metric: {{metrics.login_success_rate_metric}}
login_failure_rate_metric: {{metrics.login_failure_rate_metric}} | OPTIONAL
authz_deny_rate_metric: {{metrics.authz_deny_rate_metric}} | OPTIONAL
5. Dashboards
dashboard_name: {{dash.name}}
minimum_panels: {{dash.minimum_panels}}
panel_list: {{dash.panel_list}} | OPTIONAL
6. Alerts
Alert
alert_id: {{alerts[0].alert_id}}
condition: {{alerts[0].condition}}
severity: {{alerts[0].severity}} (low/med/high/UNKNOWN)
routing: {{alerts[0].routing}}
runbook_ref: {{alerts[0].runbook_ref}} | OPTIONAL
(Repeat per alert.)
7. Retention
retention_days: {{retention.days}}
8. High-Cardinality Controls
subscription_or_user_hash_rule: {{cardinality.hash_rule}}
sampling_rule: {{cardinality.sampling_rule}} | OPTIONAL

9. References
Security monitoring: {{xref:SEC-06}} | OPTIONAL
Security runbooks: {{xref:SEC-10}} | OPTIONAL
Audit schema: {{xref:AUDIT-02}} | OPTIONAL
Cross-References
Upstream: {{xref:IAM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:AUDIT-09}}, {{xref:SEC-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define event types, required fields, and retention.
intermediate: Required. Define metrics, dashboards, and at least one alert.
advanced: Required. Add geo anomaly/risk scoring and strict high-cardinality controls.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, hashing rule, panel list, runbook refs,
optional metrics, sampling rule, geo/risk notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If events.types is UNKNOWN → block Completeness Gate.
If logs.required_fields is UNKNOWN → block Completeness Gate.
If redact.no_token_logging_rule is UNKNOWN → block Completeness Gate.
If dash.minimum_panels is UNKNOWN → block Completeness Gate.
If retention.days is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IAM
Pass conditions:
required_fields_present == true
event_types_and_logs_defined == true
redaction_defined == true
dashboards_and_alerts_defined == true
retention_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Threat Modeling & Abuse Prevention
(TMA)

TMA-01

TMA-01 — Threat Model Scope & Method (assets, actors, STRIDE)
Header Block

## 5. Optional Fields

Geo anomaly rules | OPTIONAL
Risk scoring notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never log tokens/secrets.**
- **User identifiers should be hashed in logs unless explicitly approved.**
- **Alerts must be actionable and link to runbooks.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Event Types`
2. `## Log Fields`
3. `## Redaction`
4. `## Metrics`
5. `## Dashboards`
6. `## Alerts`
7. `## Alert`
8. `## (Repeat per alert.)`
9. `## Retention`
10. `## High-Cardinality Controls`

## 8. Cross-References

- **Upstream: {{xref:IAM-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-09}}, {{xref:SEC-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
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
