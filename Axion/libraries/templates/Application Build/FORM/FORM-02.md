# FORM-02 — Field Spec (per field: type, rules, copy)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-02                                             |
| Template Type     | Build / Forms                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring field spec (per field: type, rules, copy)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Field Spec (per field: type, rules, copy) Document                         |

## 2. Purpose

Define the canonical per-field specification format for forms, including field types, validation
rules, UX copy, default values, data mapping, and accessibility requirements. This template
must be consistent with the forms inventory and data schemas and must not invent field IDs not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FORM-01 Forms Inventory: {{forms.inventory}}
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

field_id (stable identifier)
form_id (binding to FORM-01)
field_name (human-readable)
field_type (text/number/select/date/file/etc.)
required (true/false)
validation_rules (min/max/pattern/enums)
ui_control (input/select/radio/textarea/etc.)
label copy
placeholder copy (optional)
help text (optional)
default value (optional)
data_binding (entity.field or schema pointer)
submission mapping (payload key)
error message policy (bind to FORM-03)
a11y attributes (aria-label/description)

Optional Fields
Conditional display rules | OPTIONAL
Formatting/masking rules | OPTIONAL
Autocomplete hints | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new field_ids; use only {{spec.fields_by_id}} as given.
Every field MUST bind to a form_id in FORM-01.
Validation rules MUST map cleanly to schema constraints when possible (DATA-06).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Field Entry (repeat per field_id)
Field
field_id: {{fields[0].field_id}}
form_id: {{fields[0].form_id}}
field_name: {{fields[0].field_name}}
field_type: {{fields[0].field_type}}
ui_control: {{fields[0].ui_control}}
required: {{fields[0].required}}
copy:
label: {{fields[0].copy.label}}
placeholder: {{fields[0].copy.placeholder}} | OPTIONAL
help_text: {{fields[0].copy.help_text}} | OPTIONAL
validation:
rules: {{fields[0].validation.rules}}
messages: {{fields[0].validation.messages}} | OPTIONAL
data:
schema_ref: {{fields[0].data.schema_ref}} | OPTIONAL
entity_field: {{fields[0].data.entity_field}} | OPTIONAL
submission_key: {{fields[0].data.submission_key}}
a11y:
aria_label: {{fields[0].a11y.aria_label}} | OPTIONAL
aria_description: {{fields[0].a11y.aria_description}} | OPTIONAL
conditional_display: {{fields[0].conditional_display}} | OPTIONAL
formatting_mask: {{fields[0].formatting_mask}} | OPTIONAL
autocomplete_hint: {{fields[0].autocomplete_hint}} | OPTIONAL

open_questions:
{{fields[0].open_questions[0]}} | OPTIONAL
(Repeat the “Field” block for each field_id.)
2. References
Forms inventory: {{xref:FORM-01}}
Validation UX rules: {{xref:FORM-03}} | OPTIONAL
Schema mapping: {{xref:FORM-04}} | OPTIONAL
Data schemas: {{xref:DATA-06}} | OPTIONAL
Cross-References
Upstream: {{xref:FORM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FORM-03}}, {{xref:FORM-04}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-A11Y]}} |
OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN for optional copy; do not invent field_ids.
intermediate: Required. Bind validation to DATA-06 where possible and define submission keys.
advanced: Required. Add conditional display and formatting/masking specs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, placeholder/help text, messages,
schema_ref/entity_field, a11y attributes, conditional_display, formatting_mask,
autocomplete_hint, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If field_id list is UNKNOWN → block Completeness Gate.
If form_id is UNKNOWN → block Completeness Gate.
If submission_key is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FORM
Pass conditions:
required_fields_present == true
all field_ids bind to existing form_ids (FORM-01)
no new field_ids introduced
placeholder_resolution == true
no_unapproved_unknowns == true
○

FORM-03

FORM-03 — Validation UX Rules (inline, focus, announce)
Header Block

## 5. Optional Fields

Conditional display rules | OPTIONAL
Formatting/masking rules | OPTIONAL
Autocomplete hints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new field_ids; use only {{spec.fields_by_id}} as given.
- **Every field MUST bind to a form_id in FORM-01.**
- **Validation rules MUST map cleanly to schema constraints when possible (DATA-06).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Field Entry (repeat per field_id)`
2. `## Field`
3. `## copy:`
4. `## validation:`
5. `## data:`
6. `## a11y:`
7. `## open_questions:`
8. `## (Repeat the “Field” block for each field_id.)`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:FORM-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FORM-03}}, {{xref:FORM-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-A11Y]}} |
- OPTIONAL

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
