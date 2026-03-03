# FORM-01 — Forms Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-01                                          |
| Template Type     | Build / Forms                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring forms inventory           |
| Filled By         | Internal Agent                                   |
| Consumes          | FE-01, SPEC_INDEX                                |
| Produces          | Filled Forms Inventory                           |

## 2. Purpose

Create the single, canonical inventory of all forms in the application, indexed by form_id, and mapped to screens/routes. This document must be consistent with the Canonical Spec and must not invent form_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FE-01 Route Map + Layout: `{{fe.route_layout}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Forms index (form_id list) | Canonical list of all forms |
| form_id | Stable identifier |
| form_name | Human-readable |
| screen_id | Where the form lives |
| route_id | Optional |
| purpose/intent | What the form does |
| submit action binding | endpoint_id or action_id |
| validation schema ref | FORM-04 binding |
| success behavior | What happens after submit |
| error behavior | Bind to FORM-05/FE-07 |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Multi-step indicator | OPTIONAL |
| Draft/autosave support | OPTIONAL |
| Related feature IDs | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not introduce new form_ids; use only `{{spec.forms_by_id}}` as given.
- Submit action bindings MUST reference existing endpoints/actions (`{{xref:API-01}}`/`{{xref:API-02}}`) if used.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:SPEC_INDEX}}` | OPTIONAL, `{{xref:FE-01}}` | OPTIONAL
- **Downstream**: `{{xref:FORM-02}}`, `{{xref:FORM-04}}`, `{{xref:FE-07}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-NAMING]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Use UNKNOWN where form bindings are missing; do not invent form_ids. |
| intermediate | Required. Populate submit bindings and validation refs from inputs. |
| advanced | Required. Add multi-step/draft features and traceability pointers. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, route_id, multi_step, draft_support, related_feature_ids, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If form_id list is UNKNOWN → block Completeness Gate.
- If submit_binding is UNKNOWN → block Completeness Gate.
- If validation_schema_ref is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FORM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] all form_ids are unique
- [ ] no new form_ids introduced
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

