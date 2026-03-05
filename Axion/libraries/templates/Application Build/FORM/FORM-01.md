# FORM-01 — Forms Inventory (by form_id/screen_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-01                                             |
| Template Type     | Build / Forms                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring forms inventory (by form_id/screen_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Forms Inventory (by form_id/screen_id) Document                         |

## 2. Purpose

Create the single, canonical inventory of all forms in the application, indexed by form_id, and
mapped to screens/routes. This document must be consistent with the Canonical Spec and
must not invent form_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-01 Route Map + Layout: {{fe.route_layout}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Forms index (form_id l... | spec         | Yes             |
| form_id (stable identi... | spec         | Yes             |
| form_name (human-reada... | spec         | Yes             |
| screen_id (where the f... | spec         | Yes             |
| route_id (optional)       | spec         | Yes             |
| purpose/intent (what t... | spec         | Yes             |
| submit action binding ... | spec         | Yes             |
| validation schema ref ... | spec         | Yes             |
| success behavior (what... | spec         | Yes             |
| error behavior (bind t... | spec         | Yes             |

## 5. Optional Fields

Multi-step indicator | OPTIONAL
Draft/autosave support | OPTIONAL
Related feature IDs | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new form_ids; use only {{spec.forms_by_id}} as given.
Submit action bindings MUST reference existing endpoints/actions
({{xref:API-01}}/{{xref:API-02}}) if used.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Inventory Summary
total_forms: {{forms.total}}
screens_covered: {{forms.screens}} | OPTIONAL
notes: {{forms.notes}} | OPTIONAL
2. Form Index (by form_id)
Form
form_id: {{items[0].form_id}}
form_name: {{items[0].form_name}}
screen_id: {{items[0].screen_id}}
route_id: {{items[0].route_id}} | OPTIONAL
purpose: {{items[0].purpose}}
submit_binding: {{items[0].submit_binding}}
validation_schema_ref: {{items[0].validation_schema_ref}}
success_behavior: {{items[0].success_behavior}}
error_behavior: {{items[0].error_behavior}}
multi_step: {{items[0].multi_step}} | OPTIONAL
draft_support: {{items[0].draft_support}} | OPTIONAL
related_feature_ids: {{items[0].related_feature_ids}} | OPTIONAL
open_questions:
{{items[0].open_questions[0]}} | OPTIONAL
(Repeat the “Form” block for each form_id.)
3. References
Field specs: {{xref:FORM-02}} | OPTIONAL
Validation UX rules: {{xref:FORM-03}} | OPTIONAL
Schema mapping: {{xref:FORM-04}} | OPTIONAL
Submission patterns: {{xref:FORM-05}} | OPTIONAL
Anti-abuse: {{xref:FORM-06}} | OPTIONAL
Cross-References
Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL
Downstream: {{xref:FORM-02}}, {{xref:FORM-04}}, {{xref:FE-07}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where form bindings are missing; do not invent form_ids.
intermediate: Required. Populate submit bindings and validation refs from inputs.
advanced: Required. Add multi-step/draft features and traceability pointers.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, route_id, multi_step, draft_support,
related_feature_ids, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If form_id list is UNKNOWN → block Completeness Gate.
If submit_binding is UNKNOWN → block Completeness Gate.
If validation_schema_ref is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FORM
Pass conditions:
required_fields_present == true
all form_ids are unique
no new form_ids introduced
placeholder_resolution == true
no_unapproved_unknowns == true

FORM-02

FORM-02 — Field Spec (per field: type, rules, copy)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new form_ids; use only {{spec.forms_by_id}} as given.
- **Submit action bindings MUST reference existing endpoints/actions**
- **({{xref:API-01}}/{{xref:API-02}}) if used.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Inventory Summary`
2. `## Form Index (by form_id)`
3. `## Form`
4. `## open_questions:`
5. `## (Repeat the “Form” block for each form_id.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:FE-01}} | OPTIONAL**
- **Downstream: {{xref:FORM-02}}, {{xref:FORM-04}}, {{xref:FE-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- **beginner: Required. Use UNKNOWN where form bindings are missing; do not invent form_ids.**
- **intermediate: Required. Populate submit bindings and validation refs from inputs.**
- **advanced: Required. Add multi-step/draft features and traceability pointers.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, route_id, multi_step, draft_support,**
- related_feature_ids, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If form_id list is UNKNOWN → block

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
