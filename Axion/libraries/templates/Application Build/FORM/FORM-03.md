# FORM-03 — Validation UX Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FORM-03                                          |
| Template Type     | Build / Forms                                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring validation ux rules       |
| Filled By         | Internal Agent                                   |
| Consumes          | FORM-01, FORM-02, FE-05, FE-07                   |
| Produces          | Filled Validation UX Rules                       |

## 2. Purpose

Define the canonical UX rules for client-side and server-side form validation: when validation runs, how errors display (inline vs summary), focus management, screen reader announcements, and how server validation errors map to fields. This template must be consistent with accessibility and error UX rules and must not invent validation modes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FORM-01 Forms Inventory: `{{forms.inventory}}`
- FORM-02 Field Specs: `{{forms.field_specs}}`
- FE-05 Accessibility Notes: `{{fe.a11y_notes}}` | OPTIONAL
- FE-07 Error Handling UX: `{{fe.error_ux}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Validation timing rules | on blur/on submit/on change |
| Client vs server validation precedence rules | Order of validation |
| Inline error display rules | Per-field error display |
| Summary error display rules | Top-of-form error summary |
| Focus first error rules | Auto-focus on first error |
| Announcement rules (aria-live) | Screen reader announcements |
| Field-to-error mapping rules | Server errors to field_id |
| Error copy policy | Tone, specificity |
| Disable submit rules | When invalid/pending |
| Success feedback rules | Post-submit feedback |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Per-form overrides | OPTIONAL |
| Async field validation (unique checks) | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Validation UX MUST meet accessibility rules from `{{xref:FE-05}}`.
- Server-side validation errors MUST be mapped to fields when possible; otherwise show summary.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FORM-01}}`, `{{xref:FORM-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:FORM-05}}`, `{{xref:FORM-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-A11Y]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define on_submit + inline error rules; use UNKNOWN for debounce/async validation. |
| intermediate | Required. Define server-to-field mapping and focus/announcement policies. |
| advanced | Required. Add per-form override mechanisms and async validation guidance. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, debounce_ms, server override rule, inline spacing, summary contents/links, focus submit fail, sr announce options, error key format, spinner, post submit nav, per-form overrides, async validation, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If timing.on_submit is UNKNOWN → block Completeness Gate.
- If inline.display_rule is UNKNOWN → block Completeness Gate.
- If server_map.mapping_rule is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.FORM
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] validation_timing_defined == true
- [ ] server_mapping_defined == true
- [ ] a11y_rules_applied == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

