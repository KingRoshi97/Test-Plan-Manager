# DSYS-05 — Theming Rules (light/dark,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DSYS-05                                             |
| Template Type     | Design / System                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring theming rules (light/dark,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Theming Rules (light/dark, Document                         |

## 2. Purpose

Define the enforceable theming model (light/dark/brand variations) so UI can switch themes
without breaking semantics, accessibility, or product identity. This document sets rules for token
resolution, contrast, and brand constraints.

## 3. Inputs Required

- ● DSYS-01: {{xref:DSYS-01}}
- ● A11YD-04: {{xref:A11YD-04}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Theme list (minimum 1;... | spec         | Yes             |
| For each theme:           | spec         | Yes             |
| ○ theme_id                | spec         | Yes             |
| ○ intended environment... | spec         | Yes             |
| ○ token value source (... | spec         | Yes             |
| ○ contrast compliance ... | spec         | Yes             |
| Theme switching rules:    | spec         | Yes             |
| ○ system preference ha... | spec         | Yes             |
| ○ app override handling   | spec         | Yes             |
| ○ persistence rules       | spec         | Yes             |
| Brand constraints:        | spec         | Yes             |
| ○ non-negotiable token... | spec         | Yes             |

## 5. Optional Fields

● Seasonal/campaign themes | OPTIONAL
● High-contrast theme support | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Theme values must map to semantic tokens, not direct “raw” values in components.
- Contrast requirements apply in every theme; exceptions are not allowed for text/controls.
- Brand anchors must be preserved across themes (defined explicitly).
- If app supports manual theme selection, OS preference must still be respected unless
- **explicitly overridden.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Themes (required)`
2. `## theme`
3. `## _id`
4. `## name`
5. `## default_sour`
6. `## user_selectable`
7. `## persists`
8. `## notes`
9. `## theme`
10. `## _light`

## 8. Cross-References

- Upstream: {{xref:DSYS-01}}, {{xref:A11YD-04}} | OPTIONAL
- Downstream: {{xref:FE-06}} | OPTIONAL, {{xref:MOB-*}} | OPTIONAL, {{xref:QA-04}} |
- OPTIONAL
- Standards: {{standards.rules[STD-A11Y]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
