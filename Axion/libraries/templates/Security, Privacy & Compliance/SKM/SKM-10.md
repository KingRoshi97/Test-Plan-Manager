# SKM-10 — Observability & Alerts (access spikes, failures, drift)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SKM-10                                             |
| Template Type     | Security / Secrets & Keys                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability & alerts (access spikes, failures, drift)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability & Alerts (access spikes, failures, drift) Document                         |

## 2. Purpose

Define the canonical observability and alerting for secrets/key management: access spikes,
denied access, rotation failures, expiring certs, and configuration drift. This template must align
with security monitoring and audit anomaly detection.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Secrets inventory: {{xref:SKM-01}} | OPTIONAL
- Storage/access policy: {{xref:SKM-02}} | OPTIONAL
- Rotation policy: {{xref:SKM-03}} | OPTIONAL
- Security monitoring baseline: {{xref:SEC-06}} | OPTIONAL
- Audit anomaly detection: {{xref:AUDIT-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Dashboards minimum pan... | spec         | Yes             |
| Key metrics list (read... | spec         | Yes             |
| Alert registry (alert_... | spec         | Yes             |
| Alert routing policy (... | spec         | Yes             |
| Noise control rules (d... | spec         | Yes             |
| Runbook references (SK... | spec         | Yes             |
| Retention rules for se... | spec         | Yes             |
| Telemetry redaction ru... | spec         | Yes             |

## 5. Optional Fields

Drift detection rules (policy mismatches) | OPTIONAL

Automated remediation hooks | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not include secret material in telemetry; metadata only.
- **Alerts must be actionable and link to runbooks.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Dashboards`
2. `## Key Metrics`
3. `## Alerts`
4. `## Alert Definitions (repeat)`
5. `## Alert`
6. `## (Repeat per alert.)`
7. `## Noise Controls`
8. `## Retention / Redaction`
9. `## Runbooks`
10. `## Drift Detection (Optional)`

## 8. Cross-References

- **Upstream: {{xref:SKM-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-05}}, {{xref:COMP-09}} | OPTIONAL**
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
