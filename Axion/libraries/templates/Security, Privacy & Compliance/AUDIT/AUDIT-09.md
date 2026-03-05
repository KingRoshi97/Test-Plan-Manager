# AUDIT-09 — Alerts & Anomaly Detection (suspicious patterns)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | AUDIT-09                                             |
| Template Type     | Security / Audit                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alerts & anomaly detection (suspicious patterns)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alerts & Anomaly Detection (suspicious patterns) Document                         |

## 2. Purpose

Define the canonical alerting and anomaly detection rules built on audit data: suspicious
patterns, thresholds, routing, and runbooks. This template must align with security monitoring
and privileged action audit requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Audit event catalog: {{xref:AUDIT-01}} | OPTIONAL
- Privileged action audit: {{xref:AUDIT-07}} | OPTIONAL
- Security monitoring baseline: {{xref:SEC-06}} | OPTIONAL
- Access observability: {{xref:IAM-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Detection rule registr... | spec         | Yes             |
| rule_id (stable identi... | spec         | Yes             |
| Event types used (AUDI... | spec         | Yes             |
| Pattern/condition (thr... | spec         | Yes             |
| Severity (low/med/high... | spec         | Yes             |
| Routing (oncall/security) | spec         | Yes             |
| Suppression/dedupe rules  | spec         | Yes             |
| Runbook reference (SEC... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

ML-based detection notes | OPTIONAL
Tuning process | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Rules must be explainable and actionable (not black box only).**
- **Every rule must have routing and a runbook.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Rule Registry Summary`
2. `## Rules (repeat per rule_id)`
3. `## Rule`
4. `## open_questions:`
5. `## (Repeat per rule.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:AUDIT-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:AUDIT-10}}, {{xref:SEC-05}} | OPTIONAL**
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
