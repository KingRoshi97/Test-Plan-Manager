# DMG-02 — Concept Model (entities +

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DMG-02                                             |
| Template Type     | Product / Domain Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring concept model (entities +    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Concept Model (entities + Document                         |

## 2. Purpose

Describe the domain concept model at a logical level: core entities, their responsibilities, and
how they relate—without committing to database schemas. This anchors DATA-01/02 and
ARC-02.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- DMG-01: {{xref:DMG-01}}
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing model notes: {{inputs.model_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Entity list (logical, ... | spec         | Yes             |
| For each entity:          | spec         | Yes             |
| ○ entity_id               | spec         | Yes             |
| ○ name (matches glossa... | spec         | Yes             |
| ○ description             | spec         | Yes             |
| ○ key attributes (logi... | spec         | Yes             |
| ○ key relationships (t... | spec         | Yes             |
| ○ lifecycle states (op... | spec         | Yes             |
| Relationship list (wit... | spec         | Yes             |
| Narrative walkthrough ... | spec         | Yes             |

## 5. Optional Fields

● Bounded contexts / subdomains | OPTIONAL
● Derived events | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- **Logical model only: no DB column types, no migration details.**
- **Entity names should align with DMG-01 canonical terms.**
- **Relationships must include direction + cardinality (1:1, 1:N, N:M).**
- If a workflow references an entity not defined, add it or mark UNKNOWN and block
- **completeness.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Entities (logical)`
2. `## entit`
3. `## y_id`
4. `## name`
5. `## description`
6. `## key_attributes`
7. `## lifecycle_sta`
8. `## tes`
9. `## notes`
10. `## ent_0`

## 8. Cross-References

- Upstream: {{xref:DMG-01}}, {{xref:PRD-04}} | OPTIONAL
- Downstream: {{xref:DATA-01}}, {{xref:DATA-02}}, {{xref:ARC-02}}
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
