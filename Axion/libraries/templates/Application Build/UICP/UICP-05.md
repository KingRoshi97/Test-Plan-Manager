# UICP-05 — Interaction Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-05                                          |
| Template Type     | Build / UI Composition                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring interaction patterns      |
| Filled By         | Internal Agent                                   |
| Consumes          | UICP-01, FE-03, FE-07, ROUTE-05                  |
| Produces          | Filled Interaction Patterns                      |

## 2. Purpose

Define the canonical interaction patterns used across the UI: modals, drawers, toasts, tooltips, confirmations, and other transient UI. Includes behavior rules, accessibility rules, back/escape handling, and when to use each pattern. This template must be consistent with state/error models and routing back/history rules and must not invent interaction primitives not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- UICP-01 Page Composition Patterns: `{{ui.page_patterns}}` | OPTIONAL
- FE-03 UI State Model: `{{fe.state_model}}` | OPTIONAL
- FE-07 Error Handling UX: `{{fe.error_ux}}` | OPTIONAL
- ROUTE-05 Back/History Rules: `{{route.back_rules}}` | OPTIONAL
- FE-05 Accessibility Notes: `{{fe.a11y_notes}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Pattern registry | Pattern types used |
| When to use each | Modal vs drawer vs page |
| Open/close rules | Escape/back, click outside |
| Focus management rules | Trap, return focus |
| Stacking rules | Multiple modals |
| Toast rules | Duration, max stack, placement |
| Confirmation patterns | Destructive actions |
| Error surface integration | Bind to FE-07 |
| Accessibility rules for each pattern | ARIA roles |
| Telemetry requirements | Optional |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Animation/motion rules | OPTIONAL |
| Mobile-specific gesture rules | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Interaction patterns MUST follow back/history rules (`{{xref:ROUTE-05}}`).
- Focus trapping/return MUST follow a11y rules (`{{xref:FE-05}}`).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:UICP-01}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:FE-02}}`, `{{xref:ROUTE-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-A11Y]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define when-to-use and close rules; use UNKNOWN for telemetry/animations. |
| intermediate | Required. Define focus/stacking/toast limits and error integration. |
| advanced | Required. Add reduced-motion and mobile gesture rules with measurable constraints. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, page_when, back/click-outside/close button rules, focus initial rule, stacking limits/z-index, toast placement/dedupe, confirm copy/danger style, error surface ref, a11y announce/reduced motion, telemetry fields, animation/gesture notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If patterns.used is UNKNOWN → block Completeness Gate.
- If focus.trap_required is UNKNOWN → block Completeness Gate.
- If toast.max or toast.duration_ms is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.UICP
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] patterns_and_usage_defined == true
- [ ] open_close_rules_defined == true
- [ ] a11y_rules_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

