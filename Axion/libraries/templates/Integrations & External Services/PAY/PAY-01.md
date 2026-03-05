# PAY-01 — Provider Inventory (by provider_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-01                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring provider inventory (by provider_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Provider Inventory (by provider_id) Document                         |

## 2. Purpose

Create the single, canonical inventory of payment providers used by the application, indexed by
provider_id, including enabled environments, supported payment modes, and compliance scope
notes. This document must not invent provider_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- PRD-06 NFRs/Compliance: {{prd.nfrs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Provider registry (pro... | spec         | Yes             |
| provider_id (stable id... | spec         | Yes             |
| provider name/vendor      | spec         | Yes             |
| integration_id binding... | spec         | Yes             |
| supported modes (one-t... | spec         | Yes             |
| supported payment meth... | spec         | Yes             |
| environments enabled (... | spec         | Yes             |
| webhook support (yes/no)  | spec         | Yes             |
| criticality (low/med/h... | spec         | Yes             |
| owner (team/role)         | spec         | Yes             |
| compliance scope notes... | spec         | Yes             |
| references to detailed... | spec         | Yes             |

## 5. Optional Fields

Status (planned/active/deprecated) | OPTIONAL

SLA/uptime notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent provider_ids; use only {{spec.pay_providers_by_id}} if present, else mark
- **UNKNOWN and flag.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Provider Entries (by provider_id)`
3. `## Provider`
4. `## spec_refs:`
5. `## open_questions:`
6. `## (Repeat per provider_id.)`
7. `## References`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-02}}, {{xref:PAY-04}} | OPTIONAL**
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
