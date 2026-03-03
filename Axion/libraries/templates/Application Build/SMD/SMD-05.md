# SMD-05 — Offline State Handling

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-05                                           |
| Template Type     | Build / State Management                         |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring offline state handling    |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Offline State Handling                    |

## 2. Purpose

Define the canonical observability plan for all services: metrics (RED/USE), distributed tracing, structured logging, dashboards, alerts, and SLI/SLO definitions. This template ensures every service has adequate observability for debugging, performance monitoring, and incident response.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-01 Service Catalog: {{smd.service_catalog}}
- SMD-02 Service Contracts: {{smd.service_contracts}} | OPTIONAL
- SMD-04 Resilience Patterns: {{smd.resilience_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Observability policy statement | spec | No |
| Metrics framework (RED/USE/custom) | spec | No |
| Per-service metric definitions | spec | No |
| Distributed tracing policy | spec | No |
| Structured logging standard | spec | No |
| Dashboard requirements | spec | Yes |
| Alert definitions | spec | No |
| SLI/SLO definitions | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Log aggregation tool/stack | ops | OPTIONAL |
| Trace sampling policy | spec | OPTIONAL |
| Custom business metrics | spec | OPTIONAL |
| On-call integration | ops | OPTIONAL |
| Open questions | — | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Every service in {{xref:SMD-01}} SHOULD have metrics, tracing, and logging defined (or UNKNOWN flagged).
- Alerts MUST have severity, threshold, and routing defined.
- SLIs SHOULD be measurable and bound to SLOs.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Cross-References

- **Upstream**: {{xref:SMD-01}}, {{xref:SMD-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SMD-06}} | OPTIONAL, {{xref:RUNBOOK}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-OBSERVABILITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Skill Level | Required | Notes |
|---|---|---|
| beginner | Not required | Observability can be deferred to intermediate+. |
| intermediate | Required | Define RED metrics, tracing, logging, and core alerts. |
| advanced | Required | Add SLI/SLOs, custom metrics, trace sampling, and error budget policies. |

## 9. Unknown Handling

- UNKNOWN_ALLOWED: domain.map, glossary.terms, dashboard details, SLI/SLO definitions, trace sampling, custom metrics, log retention, pii redaction, on-call integration, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If metrics_framework is UNKNOWN → block Completeness Gate.
- If alert_definitions is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SMD
- Pass conditions:
  - [ ] required_fields_present == true
  - [ ] per_service_metrics_defined == true
  - [ ] tracing_policy_defined == true
  - [ ] logging_standard_defined == true
  - [ ] alert_definitions_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

