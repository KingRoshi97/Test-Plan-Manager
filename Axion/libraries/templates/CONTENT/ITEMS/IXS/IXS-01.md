# IXS-01 — Integration Inventory (by integration_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-01                                             |
| Template Type     | Integration / External Systems                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring integration inventory (by integration_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Integration Inventory (by integration_id) Document                         |

## 2. Purpose

Create the single, canonical inventory of all external integrations used by the application,
indexed by integration_id. This inventory defines what systems exist, why they exist, what data
moves, and which other integration templates apply. This document must not invent integrations
not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Integration registry (... | spec         | Yes             |
| integration_id (stable... | spec         | Yes             |
| name (human-readable)     | spec         | Yes             |
| vendor/system name        | spec         | Yes             |
| integration category (... | spec         | Yes             |
| direction (inbound/out... | spec         | Yes             |
| purpose (why it exists)   | spec         | Yes             |
| data domains touched (... | spec         | Yes             |
| criticality (low/med/h... | spec         | Yes             |
| environments enabled (... | spec         | Yes             |
| owner (team/role)         | spec         | Yes             |
| primary risks (PII, fi... | spec         | Yes             |

## 5. Optional Fields

Status (planned/active/deprecated) | OPTIONAL
Cost center / billing owner | OPTIONAL

Vendor contract/SLA notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new integration_ids; use only {{spec.integrations_by_id}} if present, else mark
- **UNKNOWN and flag.**
- Each integration MUST have at least one “references to detailed specs” entry (or approved
- **UNKNOWN).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Integration Entries (by integration_id)`
3. `## Integration`
4. `## spec_refs:`
5. `## open_questions:`
6. `## (Repeat per integration_id.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:DOMAIN_MAP}} | OPTIONAL**
- **Downstream: {{xref:SSO-01}}, {{xref:CRMERP-01}}, {{xref:WHCP-01}}, {{xref:PAY-01}},**
- **{{xref:NOTIF-01}}, {{xref:FMS-01}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
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
