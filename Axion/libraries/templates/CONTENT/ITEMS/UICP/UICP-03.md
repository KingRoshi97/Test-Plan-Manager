# UICP-03 — Responsive Layout Patterns (breakpoints usage)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | UICP-03                                             |
| Template Type     | Build / UI Composition                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring responsive layout patterns (breakpoints usage)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Responsive Layout Patterns (breakpoints usage) Document                         |

## 2. Purpose

Define the canonical responsive layout patterns used across the app, including breakpoint
definitions, grid rules, container widths, and responsive behavior for common components and
page sections. This template must be consistent with theming/tokens and page composition
patterns and must not invent breakpoints not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- UICP-01 Page Composition Patterns: {{ui.page_patterns}} | OPTIONAL
- FE-06 Theming/Tokens Integration: {{ui.theming}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Breakpoint set (names ... | spec         | Yes             |
| Layout primitives (gri... | spec         | Yes             |
| Container width rules ... | spec         | Yes             |
| Spacing scaling rules ... | spec         | Yes             |
| Responsive typography ... | spec         | Yes             |
| Responsive navigation ... | spec         | Yes             |
| Component responsive p... | spec         | Yes             |
| Testing guidance (how ... | spec         | Yes             |

## 5. Optional Fields

Orientation rules (portrait/landscape) | OPTIONAL
Platform differences (web vs mobile) | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
All responsive rules MUST use design tokens and avoid raw values unless allowed.
Breakpoints MUST be a fixed, shared set across the app.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Breakpoints
breakpoints:
● name: {{bp[0].name}}
min_width_px: {{bp[0].min_width_px}}
● name: {{bp[1].name}} | OPTIONAL
min_width_px: {{bp[1].min_width_px}} | OPTIONAL
2. Layout Primitives
primitives: {{layout.primitives}}
grid_rules: {{layout.grid_rules}} | OPTIONAL
stack_rules: {{layout.stack_rules}} | OPTIONAL
3. Container Rules
max_width_by_bp: {{container.max_width_by_bp}}
gutter_rules: {{container.gutter_rules}} | OPTIONAL
4. Spacing Scaling
spacing_tokens_ref: {{spacing.tokens_ref}} (expected: {{xref:FE-06}}) | OPTIONAL
padding_scaling_rule: {{spacing.padding_scaling_rule}}
gap_scaling_rule: {{spacing.gap_scaling_rule}} | OPTIONAL
5. Typography Scaling
typography_tokens_ref: {{type.tokens_ref}} (expected: {{xref:FE-06}}) | OPTIONAL
heading_scaling_rule: {{type.heading_scaling_rule}}
body_scaling_rule: {{type.body_scaling_rule}} | OPTIONAL
6. Responsive Navigation
nav_responsive_rules: {{nav.rules}}
sidebar_to_drawer_rule: {{nav.sidebar_to_drawer_rule}} | OPTIONAL
7. Component Patterns
cards: {{components.cards}}
lists: {{components.lists}}
tables: {{components.tables}} | OPTIONAL
forms: {{components.forms}} | OPTIONAL
8. Testing Guidance
test_checklist:
{{tests.checklist[0]}}
{{tests.checklist[1]}} | OPTIONAL
9. References
Page patterns: {{xref:UICP-01}} | OPTIONAL
Theming/tokens: {{xref:FE-06}} | OPTIONAL

Cross-References
Upstream: {{xref:UICP-01}} | OPTIONAL, {{xref:FE-06}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:FE-02}}, {{xref:FE-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define breakpoint set and baseline layout primitives; use UNKNOWN for
tables/forms if not present.
intermediate: Required. Define container + spacing + nav responsive rules.
advanced: Required. Add platform/orientation differences and robust testing guidance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, grid/stack rules, gutter rules, token refs,
gap/body scaling, sidebar/drawer, tables/forms patterns, test checklist items, orientation/platform
notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If breakpoint set is UNKNOWN → block Completeness Gate.
If padding_scaling_rule is UNKNOWN → block Completeness Gate.
If tests.checklist is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.UICP
Pass conditions:
required_fields_present == true
breakpoints_defined == true
token_bound_spacing_and_typography_defined == true
responsive_nav_rules_defined == true
testing_guidance_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

UICP-04

UICP-04 — Content Hierarchy Rules (typography, spacing)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- All responsive rules MUST use design tokens and avoid raw values unless allowed.
- **Breakpoints MUST be a fixed, shared set across the app.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Breakpoints`
2. `## breakpoints:`
3. `## Layout Primitives`
4. `## Container Rules`
5. `## Spacing Scaling`
6. `## Typography Scaling`
7. `## Responsive Navigation`
8. `## Component Patterns`
9. `## Testing Guidance`
10. `## test_checklist:`

## 8. Cross-References

- **Upstream: {{xref:UICP-01}} | OPTIONAL, {{xref:FE-06}} | OPTIONAL, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:FE-02}}, {{xref:FE-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
