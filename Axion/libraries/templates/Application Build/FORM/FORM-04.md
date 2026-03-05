# FORM-04 — Schema Mapping (forms ↔ DATA-06/DQV-03)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-04                                             |
| Template Type     | Build / Forms                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring schema mapping (forms ↔ data-06/dqv-03)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Schema Mapping (forms ↔ DATA-06/DQV-03) Document                         |

## 2. Purpose

Define the canonical mapping between forms/fields and the underlying data schemas and
validation rules, including how form payloads map to entities, how field constraints bind to
schema constraints, and how server validation errors map back to field_ids. This template must
be consistent with data schema definitions and must not invent schema IDs not present in
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FORM-01 Forms Inventory: {{forms.inventory}}
- FORM-02 Field Specs: {{forms.field_specs}}
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- DQV-03 Data Validation Rules: {{data.validation_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Mapping registry (form... | spec         | Yes             |
| Per-field mapping (fie... | spec         | Yes             |
| Submission payload map... | spec         | Yes             |
| Constraint binding (fi... | spec         | Yes             |
| Normalization/transfor... | spec         | Yes             |
| Server error key mappi... | spec         | Yes             |
| Unknown/unmapped behav... | spec         | Yes             |
| Versioning notes (sche... | spec         | Yes             |

## 5. Optional Fields

Derived fields (computed values) | OPTIONAL

Multi-entity submissions | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Every form MUST map to at least one schema/entity reference.**
- **Every field MUST map to a schema path or be explicitly marked UNKNOWN and flagged.**
- Do not invent schema refs; use only those in {{xref:DATA-06}}/{{xref:DQV-03}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Form → Schema Mapping`
2. `## Mapping`
3. `## (Repeat per form_id.)`
4. `## Field → Schema Path Mapping`
5. `## Field Map`
6. `## open_questions:`
7. `## (Repeat per field_id.)`
8. `## Constraint Binding Rules`
9. `## Server Error Key Mapping`
10. `## Unknown/Unmapped Handling`

## 8. Cross-References

- **Upstream: {{xref:FORM-01}}, {{xref:FORM-02}}, {{xref:DATA-06}} | OPTIONAL,**
- **{{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FORM-05}}, {{xref:FORM-06}} | OPTIONAL**
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
