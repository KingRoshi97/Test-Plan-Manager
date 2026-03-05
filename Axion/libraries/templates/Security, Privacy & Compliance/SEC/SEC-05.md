# SEC-05 — Incident Response Plan (detect, contain, recover)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SEC-05                                             |
| Template Type     | Security / Core                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring incident response plan (detect, contain, recover)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Incident Response Plan (detect, contain, recover) Document                         |

## 2. Purpose

Define the canonical incident response plan for security events: detection, triage, containment,
eradication, recovery, and post-incident review. This template must coordinate with
audit/forensics workflows and compliance notification requirements.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Security overview: {{xref:SEC-01}} | OPTIONAL
- Security monitoring: {{xref:SEC-06}} | OPTIONAL
- Investigation workflow: {{xref:AUDIT-06}} | OPTIONAL
- Regulatory requirements: {{xref:COMP-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Incident severity mode... | spec         | Yes             |
| Detection sources (ale... | spec         | Yes             |
| Triage process (who do... | spec         | Yes             |
| Evidence preservation ... | spec         | Yes             |
| Communication plan (in... | spec         | Yes             |
| Regulatory notificatio... | spec         | Yes             |
| Recovery steps (restor... | spec         | Yes             |
| Post-incident review r... | spec         | Yes             |
| Runbook references (SE... | spec         | Yes             |

## 5. Optional Fields

On-call rotations / contacts | OPTIONAL

Tabletop exercise cadence | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Containment actions must be permissioned and auditable.**
- **Evidence handling must preserve chain-of-custody where needed.**
- Do not claim regulatory timelines unless provided; use UNKNOWN when unclear.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Severity Model`
2. `## Incident Types`
3. `## Detection & Intake`
4. `## Triage Process`
5. `## steps:`
6. `## Containment Actions`
7. `## Evidence Preservation`
8. `## Communications`
9. `## Regulatory Notifications`
10. `## Recovery`

## 8. Cross-References

- **Upstream: {{xref:SEC-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SEC-10}}, {{xref:AUDIT-10}} | OPTIONAL**
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
