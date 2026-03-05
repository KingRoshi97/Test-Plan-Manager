# IXS-07 — Observability (logs/metrics/traces, dashboards, alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-07                                             |
| Template Type     | Integration / External Systems                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability (logs/metrics/traces, dashboards, alerts)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability (logs/metrics/traces, dashboards, alerts) Document                         |

## 2. Purpose

Define the canonical observability requirements for integrations: what must be logged, which
metrics must exist, trace/correlation rules, dashboards and alerting, and redaction/privacy
constraints. This template must be consistent with client/server logging policies and must not
introduce telemetry that violates privacy constraints.

## 3. Inputs Required

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

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Metric taxonomy (succe... | spec         | Yes             |
| Tracing/correlation ru... | spec         | Yes             |
| Redaction rules (no se... | spec         | Yes             |
| Dashboards minimum set... | spec         | Yes             |
| Alerts rules (failure ... | spec         | Yes             |
| SLO/SLA monitoring fie... | spec         | Yes             |
| Runbook linkage (where... | spec         | Yes             |

## 5. Optional Fields

Sampling policy | OPTIONAL

High-cardinality controls | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **No PII/secrets in logs/metrics; identifiers must be hashed or replaced as required.**
- **Metrics must use stable identifiers (integration_id) and avoid high-cardinality labels.**
- **Alerts must be actionable (include runbook references).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Core Metrics (Global)`
2. `## Per-Integration Metrics`
3. `## Integration Metrics`
4. `## (Repeat per integration_id.)`
5. `## Logs — Required Fields`
6. `## Tracing / Correlation`
7. `## Redaction / Privacy`
8. `## Dashboards`
9. `## Alerts`
10. `## Runbooks`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}}, {{xref:IXS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IXS-10}}, {{xref:ADMIN-06}} | OPTIONAL**
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
