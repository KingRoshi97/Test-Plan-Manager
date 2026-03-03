# FORM-02 — Field Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-02                                          |
| Template Type     | Build / Forms                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring field spec                |
| Filled By         | Internal Agent                                   |
| Consumes          | FORM-01                                          |
| Produces          | Filled Field Spec                                |

## 2. Purpose

Define the canonical per-field specification format for forms, including field types, validation rules, UX copy, default values, data mapping, and accessibility requirements. This template must be consistent with the forms inventory and data schemas and must not invent field IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FORM-01 Forms Inventory: `{{forms.inventory}}`
- DATA-06 Canonical Data Schemas: `{{data.schemas}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| field_id | Stable identifier |
| form_id | Binding to FORM-01 |
| field_name | Human-readable |
| field_type | text/number/select/date/file/etc. |
| required | true/false |
| validation_rules | min/max/pattern/enums |
| ui_control | input/select/radio/textarea/etc. |
| label copy | Display label |
| placeholder copy | OPTIONAL |
| help text | OPTIONAL |
| default value | OPTIONAL |
| data_binding | entity.field or schema pointer |
| submission mapping | Payload key |
| error message policy | Bind to FORM-03 |
| a11y attributes | aria-label/description |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Conditional display rules | OPTIONAL |
| Formatting/masking rules | OPTIONAL |
| Autocomplete hints | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not introduce new field_ids; use only `{{spec.fields_by_id}}` as given.
- Every field MUST bind to a form_id in FORM-01.
- Validation rules MUST map cleanly to schema constraints when possible (DATA-06).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FORM-01}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:FORM-03}}`, `{{xref:FORM-04}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-NAMING]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-A11Y]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Use UNKNOWN for optional copy; do not invent field_ids. |
| intermediate | Required. Bind validation to DATA-06 where possible and define submission keys. |
| advanced | Required. Add conditional display and formatting/masking specs. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, placeholder/help text, messages, schema_ref/entity_field, a11y attributes, conditional_display, formatting_mask, autocomplete_hint, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If field_id list is UNKNOWN → block Completeness Gate.
- If form_id is UNKNOWN → block Completeness Gate.
- If submission_key is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FORM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] all field_ids bind to existing form_ids (FORM-01)
- [ ] no new field_ids introduced
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

