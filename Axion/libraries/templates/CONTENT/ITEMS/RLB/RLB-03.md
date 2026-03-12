# RLB-03 — Responsive Component

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLB-03                                             |
| Template Type     | Design / Responsive Layout                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring responsive component    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Responsive Component Document                         |

## 2. Purpose

Define how key UI components adapt across breakpoints and input types so responsive
behavior is consistent and accessible. This covers component-level transformations (table →
cards, nav shifts), density shifts, and interaction differences.

## 3. Inputs Required

- ● RLB-01: {{xref:RLB-01}} | OPTIONAL
- ● DSYS-02: {{xref:DSYS-02}} | OPTIONAL
- ● DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- ● A11YD-01: {{xref:A11YD-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each entry:           | spec         | Yes             |
| ○ target_component_id ... | spec         | Yes             |
| ○ breakpoint behavior ... | spec         | Yes             |
| ○ layout changes (stac... | spec         | Yes             |
| ○ interaction changes ... | spec         | Yes             |
| ○ accessibility impact... | spec         | Yes             |
| ○ performance consider... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Platform notes (mobile web vs native) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Responsive adaptations must preserve meaning and available actions.
- If converting tables to cards, sorting/filtering must remain accessible.
- Truncation must not hide critical info; provide disclosure or expand.
- Keyboard navigation must still work in all breakpoint variants.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Responsive Component Catalog (canonical)`
2. `## target`
3. `## type`
4. `## (compo`
5. `## nent/pat`
6. `## tern)`
7. `## bp_x`
8. `## bp_s`
9. `## bp_m`
10. `## bp_l`

## 8. Cross-References

- notes
- Upstream: {{xref:RLB-01}} | OPTIONAL, {{xref:DSYS-02}} | OPTIONAL,
- **{{xref:DSYS-03}} | OPTIONAL**
- Downstream: {{xref:RLB-04}}, {{xref:FE-*}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL
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
