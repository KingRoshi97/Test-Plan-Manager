# RLB-02 — Layout Adaptation Rules (per

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLB-02                                             |
| Template Type     | Design / Responsive Layout                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring layout adaptation rules (per    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Layout Adaptation Rules (per Document                         |

## 2. Purpose

Define deterministic layout adaptation rules across breakpoints: how navigation, grids, density,
and content hierarchy change as screen size changes. This ensures responsive behavior is
predictable and implementation-ready.

## 3. Inputs Required

- ● RLB-01: {{xref:RLB-01}}
- ● DSYS-03: {{xref:DSYS-03}} | OPTIONAL
- ● DES-03: {{xref:DES-03}} | OPTIONAL
- ● IAN-01: {{xref:IAN-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each breakpoint:      | spec         | Yes             |
| ○ navigation adaptatio... | spec         | Yes             |
| ○ grid/columns adaptation | spec         | Yes             |
| ○ density adaptation (... | spec         | Yes             |
| ○ component substituti... | spec         | Yes             |
| ○ modal sizing rules (... | spec         | Yes             |
| Cross-breakpoint invar... | spec         | Yes             |
| Verification checklist    | spec         | Yes             |

## 5. Optional Fields

● Platform-specific notes (web vs tablet) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Responsive changes must not break flow completion (DES-01).
- Information hierarchy must remain consistent; avoid hiding critical actions.
- Navigation changes must align to IAN-01 structure.
- Component substitution must preserve accessibility and semantics.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Breakpoint Rules (canonical)`
2. `## brea`
3. `## kpoi`
4. `## nav_pat`
5. `## tern`
6. `## grid_col`
7. `## umns`
8. `## density_`
9. `## mode`
10. `## content_pr`

## 8. Cross-References

- Upstream: {{xref:RLB-01}}, {{xref:DSYS-03}} | OPTIONAL, {{xref:IAN-01}} | OPTIONAL
- Downstream: {{xref:RLB-03}}, {{xref:FE-01}} | OPTIONAL, {{xref:QA-02}} | OPTIONAL
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
