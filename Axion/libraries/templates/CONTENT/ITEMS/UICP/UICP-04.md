# UICP-04 — Content Hierarchy Rules (typography, spacing)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-04                                             |
| Template Type     | Build / UI Composition                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring content hierarchy rules (typography, spacing)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Content Hierarchy Rules (typography, spacing) Document                         |

## 2. Purpose

Define the canonical content hierarchy rules for UI: typography levels, spacing rhythm, density
rules, and how to enforce consistent visual hierarchy across screens and components. This
template must be consistent with design tokens/theming and must not invent token names not
present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FE-06 Theming/Tokens Integration: {{ui.theming}} | OPTIONAL
- DSYS-01 Tokens Catalog: {{dsys.tokens_catalog}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Typography scale level... | spec         | Yes             |
| Token mapping per leve... | spec         | Yes             |
| Spacing scale (token-b... | spec         | Yes             |
| Vertical rhythm rules ... | spec         | Yes             |
| Section hierarchy rule... | spec         | Yes             |
| Density rules (compact... | spec         | Yes             |
| Iconography sizing rul... | spec         | Yes             |
| Accessibility consider... | spec         | Yes             |
| Examples/usage rules      | spec         | Yes             |

## 5. Optional Fields

Per-platform typography adjustments | OPTIONAL
Localization considerations (long strings) | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Use tokens only; no raw typography/spacing values unless explicitly allowed.
Hierarchy rules MUST be applied consistently across UICP patterns and FE components.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Typography Levels
Level
name: {{type.levels[0].name}} (H1/H2/body/UNKNOWN)
token_font_size: {{type.levels[0].token_font_size}}
token_font_weight: {{type.levels[0].token_font_weight}} | OPTIONAL
token_line_height: {{type.levels[0].token_line_height}} | OPTIONAL
usage: {{type.levels[0].usage}} | OPTIONAL
(Repeat per level.)
2. Spacing Scale
spacing_tokens: {{spacing.tokens}}
stack_spacing_rules: {{spacing.stack_rules}}
section_padding_rules: {{spacing.section_padding_rules}} | OPTIONAL
3. Vertical Rhythm
default_gap_token: {{rhythm.default_gap_token}}
heading_to_body_gap: {{rhythm.heading_to_body_gap}} | OPTIONAL
body_to_actions_gap: {{rhythm.body_to_actions_gap}} | OPTIONAL
4. Section Hierarchy
headline_rule: {{sections.headline_rule}}
content_rule: {{sections.content_rule}}
actions_rule: {{sections.actions_rule}} | OPTIONAL
5. Density Rules
modes: {{density.modes}} (compact/comfortable/UNKNOWN)
mode_rules: {{density.rules}} | OPTIONAL
6. Iconography
icon_size_tokens: {{icons.size_tokens}} | OPTIONAL
alignment_rules: {{icons.alignment_rules}} | OPTIONAL
7. Accessibility Considerations
line_length_rule: {{a11y.line_length_rule}} | OPTIONAL
min_font_size_rule: {{a11y.min_font_size_rule}} | OPTIONAL
8. Examples / Usage
examples:
{{examples[0]}}
{{examples[1]}} | OPTIONAL

9. References
Theming/tokens integration: {{xref:FE-06}} | OPTIONAL
Tokens catalog: {{xref:DSYS-01}} | OPTIONAL
Cross-References
Upstream: {{xref:FE-06}} | OPTIONAL, {{xref:DSYS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:UICP-01}}, {{xref:FE-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-A11Y]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define typography + spacing scales; use UNKNOWN for optional
iconography rules.
intermediate: Required. Bind levels to tokens and define rhythm rules.
advanced: Required. Add density modes and localization adjustments.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, usage, font weight/line height tokens,
section padding rules, rhythm gaps, actions rule, density rules, icon tokens/alignment, a11y
rules, examples, platform/localization notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If type.levels list is UNKNOWN → block Completeness Gate.
If spacing.tokens is UNKNOWN → block Completeness Gate.
If spacing.stack_rules is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.UICP
Pass conditions:
required_fields_present == true
typography_levels_defined == true
spacing_scale_defined == true
rhythm_rules_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

UICP-05

UICP-05 — Interaction Patterns (modals, drawers, toasts)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Use tokens only; no raw typography/spacing values unless explicitly allowed.
- **Hierarchy rules MUST be applied consistently across UICP patterns and FE components.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Typography Levels`
2. `## Level`
3. `## (Repeat per level.)`
4. `## Spacing Scale`
5. `## Vertical Rhythm`
6. `## Section Hierarchy`
7. `## Density Rules`
8. `## Iconography`
9. `## Accessibility Considerations`
10. `## Examples / Usage`

## 8. Cross-References

- **Upstream: {{xref:FE-06}} | OPTIONAL, {{xref:DSYS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:UICP-01}}, {{xref:FE-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-A11Y]}} | OPTIONAL

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
