# UICP-01 — Page Layout Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-01                                          |
| Template Type     | Build / UI Composition                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring page layout patterns      |
| Filled By         | Internal Agent                                   |
| Consumes          | FE-01                                            |
| Produces          | Filled Page Layout Patterns                      |

## 2. Purpose

Define the canonical page composition patterns used across the app: layout shells, section structures, standard regions, and how pages compose components into consistent, reusable patterns. This template must be consistent with route/layout specs and must not invent page pattern IDs not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FE-01 Route Map + Layout Spec: `{{fe.route_layout}}` | OPTIONAL
- UICP-04 Content Hierarchy Rules: `{{ui.content_hierarchy}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Page pattern registry (pattern_id list) | Canonical list of page patterns |
| Shell types supported | app/auth/admin/modal |
| Standard regions per shell | header/nav/content/footer |
| Section types | hero, list, details, form, empty/error sections |
| Composition rules | Ordering, nesting |
| Spacing/padding rules binding | UICP-04 |
| Responsive composition rules | Per breakpoint |
| Accessibility considerations for layout regions | ARIA landmarks |
| Examples/pattern usage rules | When to use each |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Per-domain pattern variants | OPTIONAL |
| Animation/motion guidance | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not introduce new pattern_ids; use only `{{spec.ui_patterns_by_id}}` if present, else mark UNKNOWN.
- Patterns MUST be reusable and consistent with FE-01 shells.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FE-01}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:UICP-02}}`, `{{xref:UICP-03}}`, `{{xref:UICP-05}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Use UNKNOWN for pattern registry if not provided; define shell/region baseline. |
| intermediate | Required. Define sections and ordering rules and responsive guidelines. |
| advanced | Required. Add a11y notes and per-domain pattern variants where applicable. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, regions_by_shell, shell_id, section examples, responsive rules, a11y notes, usage rules, section nesting, compose nesting, spacing/padding rules, per-domain variants, motion guidance, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If shells.supported is UNKNOWN → block Completeness Gate.
- If patterns registry is UNKNOWN → block Completeness Gate.
- If compose.ordering_rules is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.UICP
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] shells_and_regions_defined == true
- [ ] pattern_registry_defined == true
- [ ] composition_rules_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

