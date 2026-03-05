# VAP-05 — Accessibility for Visual Assets

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | VAP-05                                             |
| Template Type     | Design / Visual Assets                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring accessibility for visual assets    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Accessibility for Visual Assets Document                         |

## 2. Purpose

Define enforceable accessibility rules for visual assets: alt text, decorative vs informative
classification, icon-only control labeling, and how meaning is conveyed. This ensures assets
don’t create accessibility gaps or confuse assistive technologies.

## 3. Inputs Required

- ● A11YD-03: {{xref:A11YD-03}} | OPTIONAL
- ● DSYS-04: {{xref:DSYS-04}} | OPTIONAL
- ● VAP-01: {{xref:VAP-01}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}} | OPTIONAL
- ● CDX-02: {{xref:CDX-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Classification rules:     | spec         | Yes             |
| ○ decorative assets       | spec         | Yes             |
| ○ informative assets      | spec         | Yes             |
| ○ functional assets (i... | spec         | Yes             |
| Alt text requirements:    | spec         | Yes             |
| ○ when required           | spec         | Yes             |
| ○ length guidance         | spec         | Yes             |
| ○ content rules (what ... | spec         | Yes             |
| ○ localization readiness  | spec         | Yes             |
| Icon-only control rules:  | spec         | Yes             |
| ○ accessible label sou... | spec         | Yes             |
| ○ when tooltips are ac... | spec         | Yes             |

## 5. Optional Fields

● Audio description rules (video) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Decorative assets must be hidden from screen readers.
- Informative assets must have alt text that conveys purpose, not appearance only.
- Icons used as controls must have programmatic labels even if visually unlabeled.
- Alt text must not duplicate adjacent visible text unless needed for context.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Classification Rules (required)`
2. `## class`
3. `## definition`
4. `## examples`
5. `## SR_behavior`
6. `## ef}}`
7. `## ples}}`
8. `## vior}}`
9. `## informati`
10. `## def}}`

## 8. Cross-References

- Upstream: {{xref:VAP-01}} | OPTIONAL, {{xref:A11YD-03}} | OPTIONAL,
- **{{xref:DSYS-04}} | OPTIONAL**
- Downstream: {{xref:FE-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL
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
