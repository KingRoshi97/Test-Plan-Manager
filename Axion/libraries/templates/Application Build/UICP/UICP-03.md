# UICP-03 — Responsive Layout Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-03                                          |
| Template Type     | Build / UI Composition                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring responsive layout spec    |
| Filled By         | Internal Agent                                   |
| Consumes          | UICP-01, FE-06                                   |
| Produces          | Filled Responsive Layout Spec                    |

## 2. Purpose

Define the canonical responsive layout patterns used across the app, including breakpoint definitions, grid rules, container widths, and responsive behavior for common components and page sections. This template must be consistent with theming/tokens and page composition patterns and must not invent breakpoints not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- UICP-01 Page Composition Patterns: `{{ui.page_patterns}}` | OPTIONAL
- FE-06 Theming/Tokens Integration: `{{ui.theming}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Breakpoint set | Names + widths |
| Layout primitives | grid/flex/stack |
| Container width rules | Max width by breakpoint |
| Spacing scaling rules | Token binding |
| Responsive typography rules | Token binding |
| Responsive navigation rules | Sidebar → drawer, etc. |
| Component responsive patterns | Cards, lists, tables, forms |
| Testing guidance | How to verify responsiveness |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Orientation rules (portrait/landscape) | OPTIONAL |
| Platform differences (web vs mobile) | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- All responsive rules MUST use design tokens and avoid raw values unless allowed.
- Breakpoints MUST be a fixed, shared set across the app.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:UICP-01}}` | OPTIONAL, `{{xref:FE-06}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:FE-02}}`, `{{xref:FE-05}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define breakpoint set and baseline layout primitives; use UNKNOWN for tables/forms if not present. |
| intermediate | Required. Define container + spacing + nav responsive rules. |
| advanced | Required. Add platform/orientation differences and robust testing guidance. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, grid/stack rules, gutter rules, token refs, gap/body scaling, sidebar/drawer, tables/forms patterns, test checklist items, orientation/platform notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If breakpoint set is UNKNOWN → block Completeness Gate.
- If padding_scaling_rule is UNKNOWN → block Completeness Gate.
- If tests.checklist is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.UICP
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] breakpoints_defined == true
- [ ] token_bound_spacing_and_typography_defined == true
- [ ] responsive_nav_rules_defined == true
- [ ] testing_guidance_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

