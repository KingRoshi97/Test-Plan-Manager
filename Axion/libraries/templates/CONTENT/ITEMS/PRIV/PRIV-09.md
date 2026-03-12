# PRIV-09 — Privacy Incident Handling (breach response, notifications)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRIV-09                                             |
| Template Type     | Security / Privacy                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring privacy incident handling (breach response, notifications)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Privacy Incident Handling (breach response, notifications) Document                         |

## 2. Purpose

Define the canonical handling of privacy incidents (PII exposure, unauthorized access): triage,
containment, assessment, notification triggers, and post-incident actions. This template must
align with security incident response and regulatory requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Incident response plan: {{xref:SEC-05}} | OPTIONAL
- PII classification model: {{xref:PRIV-02}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Severity model (privac... | spec         | Yes             |
| Triage process (who as... | spec         | Yes             |
| Containment actions (d... | spec         | Yes             |
| Assessment rule (what ... | spec         | Yes             |
| Notification trigger r... | spec         | Yes             |
| Timeline rules (if kno... | spec         | Yes             |
| Evidence preservation ... | spec         | Yes             |
| Post-incident remediat... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Customer comms templates pointers | OPTIONAL

Vendor coordination rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not claim notification timelines unless explicitly defined; use UNKNOWN where needed.
- **Assessment must identify impacted data classes and counts where possible.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Types`
2. `## Severity`
3. `## Triage`
4. `## Containment`
5. `## Assessment`
6. `## Notifications`
7. `## Evidence`
8. `## Post-Incident`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:PRIV-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PRIV-10}}, {{xref:COMP-10}} | OPTIONAL**
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
