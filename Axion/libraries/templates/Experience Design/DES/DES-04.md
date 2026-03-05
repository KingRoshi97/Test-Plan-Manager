# DES-04 — UI Component Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-04                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring ui component inventory    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled UI Component Inventory Document                         |

## 2. Purpose

Create the canonical list of UI components (by ID) needed to implement the screens and flows.
Components here are functional building blocks, not styling tokens.

## 3. Inputs Required

- ● DES-03: {{xref:DES-03}}
- ● DSYS-02: {{xref:DSYS-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Component list (minimu... | spec         | Yes             |
| For each component:       | spec         | Yes             |
| ○ component_id            | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ used_on_screen_ids      | spec         | Yes             |
| ○ states (loading/disa... | spec         | Yes             |
| ○ props/inputs (concep... | spec         | Yes             |
| ○ outputs/events (what... | spec         | Yes             |
| ○ accessibility notes ... | spec         | Yes             |
| ○ variant notes (if any)  | spec         | Yes             |
| “layout-only”             | spec         | Yes             |

## 5. Optional Fields

● Reuse candidates (existing library mapping) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Component IDs must be stable (comp_<slug>).
- Props are conceptual; implementation details live in FE templates.
- If using design system components, reference DSYS component names/variants.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Component Inventory (canonical)`
2. `## name`
3. `## purpo`
4. `## screen`
5. `## _ids`
6. `## states`
7. `## props`
8. `## _inpu`
9. `## output`
10. `## s_eve`

## 8. Cross-References

- Upstream: {{xref:DES-03}}, {{xref:DSYS-02}} | OPTIONAL
- Downstream: {{xref:FE-02}}, {{xref:MAP-01}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
