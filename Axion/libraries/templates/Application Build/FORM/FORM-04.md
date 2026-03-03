# FORM-04 — Schema Mapping

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-04                                          |
| Template Type     | Build / Forms                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring schema mapping            |
| Filled By         | Internal Agent                                   |
| Consumes          | FORM-01, FORM-02, DATA-06                        |
| Produces          | Filled Schema Mapping                            |

## 2. Purpose

Define the canonical mapping between forms/fields and the underlying data schemas and validation rules, including how form payloads map to entities, how field constraints bind to schema constraints, and how server validation errors map back to field_ids. This template must be consistent with data schema definitions and must not invent schema IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FORM-01 Forms Inventory: `{{forms.inventory}}`
- FORM-02 Field Specs: `{{forms.field_specs}}`
- DATA-06 Canonical Data Schemas: `{{data.schemas}}` | OPTIONAL
- DQV-03 Data Validation Rules: `{{data.validation_rules}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Mapping registry | form_id → schema_ref/entity_ref |
| Per-field mapping | field_id → schema path |
| Submission payload mapping | field_id → payload key |
| Constraint binding | field validation ↔ schema constraints |
| Normalization/transforms | trim, parse, timezone, etc. |
| Server error key mapping rules | schema path → field_id |
| Unknown/unmapped behavior | What happens if no mapping |
| Versioning notes | Schema evolution effect |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Derived fields (computed values) | OPTIONAL |
| Multi-entity submissions | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Every form MUST map to at least one schema/entity reference.
- Every field MUST map to a schema path or be explicitly marked UNKNOWN and flagged.
- Do not invent schema refs; use only those in `{{xref:DATA-06}}`/`{{xref:DQV-03}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FORM-01}}`, `{{xref:FORM-02}}`, `{{xref:DATA-06}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:FORM-05}}`, `{{xref:FORM-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Use UNKNOWN when schema refs/paths are missing; do not invent. |
| intermediate | Required. Provide per-field schema paths and transforms. |
| advanced | Required. Add schema evolution/migration policies and multi-entity mapping guidance. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, entity_ref, payload_root_key, notes, transforms, constraints_bound, mismatch handling, versioning migration notes, multi-entity submissions, derived fields, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If schema_ref is UNKNOWN for any form → block Completeness Gate.
- If schema_path_to_field_rule is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FORM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] each form_id maps to DATA-06 schema_ref
- [ ] each field_id maps to schema_path (or approved UNKNOWN)
- [ ] server_error_mapping_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

