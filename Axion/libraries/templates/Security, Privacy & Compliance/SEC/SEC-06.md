# SEC-06 — Security Monitoring (signals, alerts, dashboards)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-06                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security monitoring (signals, alerts, dashboards)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security Monitoring (signals, alerts, dashboards) Document                         |

## 2. Purpose

Define the canonical security monitoring requirements: what signals are collected, how they’re
aggregated, dashboards, alert definitions, routing, and runbook references. This template must
be consistent with attack surface inventory and audit/anomaly expectations.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security architecture: {{xref:SEC-02}} | OPTIONAL
- Attack surface inventory: {{xref:TMA-03}} | OPTIONAL
- Audit anomaly detection: {{xref:AUDIT-09}} | OPTIONAL
- Access observability: {{xref:IAM-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Signal sources (logs/m... | spec         | Yes             |
| Dashboard requirements... | spec         | Yes             |
| Alert registry (alert_... | spec         | Yes             |
| Alert definitions (con... | spec         | Yes             |
| Routing policy (oncall... | spec         | Yes             |
| Triage/runbook referen... | spec         | Yes             |
| Noise control rules (d... | spec         | Yes             |
| Data retention for sec... | spec         | Yes             |
| Telemetry redaction ru... | spec         | Yes             |

## 5. Optional Fields

SIEM forwarding rules | OPTIONAL

Detection-as-code approach | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Alerts must be actionable and link to a runbook.**
- **Telemetry must comply with logging/redaction rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Signal Categories`
2. `## Dashboards`
3. `## Alert Registry`
4. `## Alert Definitions (repeat per alert_id)`
5. `## Alert`
6. `## (Repeat per alert.)`
7. `## Noise Controls`
8. `## Retention & Redaction`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:SEC-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-10}}, {{xref:SEC-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
