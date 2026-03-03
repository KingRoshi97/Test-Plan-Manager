# UICP-02 — Composition Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-02                                          |
| Template Type     | Build / UI Composition                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring composition rules         |
| Filled By         | Internal Agent                                   |
| Consumes          | UICP-01, FE-02                                   |
| Produces          | Filled Composition Rules                         |

## 2. Purpose

Define the canonical rules for composing UI components: how props are passed, how slots/children are used, how variants are selected, how to avoid prop drilling, and how composition patterns enforce consistency across the UI. This template must be consistent with component implementation specs and must not invent composition primitives not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- UICP-01 Page Composition Patterns: `{{ui.page_patterns}}` | OPTIONAL
- FE-02 Component Implementation Specs: `{{fe.component_specs}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Composition principles | Reusability, separation of concerns |
| Props rules | Required/optional/default |
| Slots/children rules | When used, constraints |
| Variant selection rules | How variants chosen |
| State ownership rules | Where state lives |
| Data dependency boundaries | Components vs containers |
| Styling boundaries | Token usage, class composition |
| Event/callback patterns | Naming, payload |
| Anti-patterns list | What not to do |
| Testing considerations | Component tests vs integration |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Performance notes (memoization) | OPTIONAL |
| Accessibility composition notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Component composition MUST not break a11y requirements.
- Variants MUST be selected deterministically (no "magic" branching).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:UICP-01}}` | OPTIONAL, `{{xref:FE-02}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:UICP-03}}`, `{{xref:UICP-05}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-A11Y]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define principles + prop/variant basics; use UNKNOWN for perf notes. |
| intermediate | Required. Define state/data boundaries and anti-patterns. |
| advanced | Required. Add memoization rules and accessibility composition notes. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, defaults/naming rules, children usage, variant inputs/fallback, state component/derived rules, hook usage rule, class composition/no inline styles, payload shape, integration tests, performance notes, a11y notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If principles list is UNKNOWN → block Completeness Gate.
- If variants.selection_rule is UNKNOWN → block Completeness Gate.
- If style.token_only_rule is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.UICP
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] principles_defined == true
- [ ] variant_selection_defined == true
- [ ] styling_boundaries_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

