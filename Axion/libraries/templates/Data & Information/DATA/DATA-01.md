# DATA-01 — Entity Definitions (canonical

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-01                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring entity definitions (canonical    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Entity Definitions (canonical Document                         |

## 2. Purpose

Define the canonical data entities and their fields. This is the authoritative entity-level schema
reference used by DB modeling, API contracts, validation schemas, and data governance.

## 3. Inputs Required

- ● DMG-01: {{xref:DMG-01}} | OPTIONAL
- ● DMG-02: {{xref:DMG-02}} | OPTIONAL
- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● BRP-01: {{xref:BRP-01}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each entity:          | spec         | Yes             |
| ○ entity_id (stable)      | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ description             | spec         | Yes             |
| ○ ownership boundary/s... | spec         | Yes             |
| ○ identifiers (primary... | spec         | Yes             |
| ○ lifecycle states (if... | spec         | Yes             |
| ○ fields table:           | spec         | Yes             |
| ■ field_name              | spec         | Yes             |
| ■ type                    | spec         | Yes             |
| ■ required (true/false)   | spec         | Yes             |
| ■ default rule            | spec         | Yes             |

## 5. Optional Fields

● Example records | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Terms and meanings must align to DMG glossary.
- Do not define relationships here (that lives in DATA-02) beyond “foreign key exists”
- **notes.**
- PII classification must be explicit for any user-related field.
- Every required field must have either a source or a default rule (no silent required).
- Field names must follow consistent casing convention (tie to standards).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Entity Index (required)`
2. `## entity_i`
3. `## name`
4. `## [0].id}}`
5. `## ].name}}`
6. `## owner`
7. `## primary`
8. `## _key`
9. `## pii_sensitive`
10. `## detail_block_`

## 8. Cross-References

- Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:DMG-02}} | OPTIONAL
- Downstream: {{xref:DATA-02}}, {{xref:DATA-03}}, {{xref:DATA-06}} | OPTIONAL,
- **{{xref:DGL-01}} | OPTIONAL, {{xref:API-02}} | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
