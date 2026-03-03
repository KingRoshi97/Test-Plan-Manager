# UICP-04 — Shell/Frame Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-04                                          |
| Template Type     | Build / UI Composition                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring shell/frame model         |
| Filled By         | Internal Agent                                   |
| Consumes          | FE-06, DSYS-01                                   |
| Produces          | Filled Shell/Frame Model                         |

## 2. Purpose

Define the canonical content hierarchy rules for UI: typography levels, spacing rhythm, density rules, and how to enforce consistent visual hierarchy across screens and components. This template must be consistent with design tokens/theming and must not invent token names not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- FE-06 Theming/Tokens Integration: `{{ui.theming}}` | OPTIONAL
- DSYS-01 Tokens Catalog: `{{dsys.tokens_catalog}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Typography scale levels | H1/H2/H3/body/caption |
| Token mapping per level | Font size/weight/line height |
| Spacing scale | Token-based |
| Vertical rhythm rules | Stack spacing |
| Section hierarchy rules | Headline → content → actions |
| Density rules | Compact/comfortable |
| Iconography sizing rules | If applicable |
| Accessibility considerations | Readability, line length |
| Examples/usage rules | When to use each level |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Per-platform typography adjustments | OPTIONAL |
| Localization considerations (long strings) | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Use tokens only; no raw typography/spacing values unless explicitly allowed.
- Hierarchy rules MUST be applied consistently across UICP patterns and FE components.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:FE-06}}` | OPTIONAL, `{{xref:DSYS-01}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:UICP-01}}`, `{{xref:FE-02}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL, `{{standards.rules[STD-A11Y]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define typography + spacing scales; use UNKNOWN for optional iconography rules. |
| intermediate | Required. Bind levels to tokens and define rhythm rules. |
| advanced | Required. Add density modes and localization adjustments. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, usage, font weight/line height tokens, section padding rules, rhythm gaps, actions rule, density rules, icon tokens/alignment, a11y rules, examples, platform/localization notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If type.levels list is UNKNOWN → block Completeness Gate.
- If spacing.tokens is UNKNOWN → block Completeness Gate.
- If spacing.stack_rules is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.UICP
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] typography_levels_defined == true
- [ ] spacing_scale_defined == true
- [ ] rhythm_rules_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

