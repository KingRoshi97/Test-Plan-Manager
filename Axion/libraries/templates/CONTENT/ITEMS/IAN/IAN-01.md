# IAN-01 — Navigation Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAN-01                                             |
| Template Type     | Design / Information Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring navigation map    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Navigation Map Document                         |

## 2. Purpose

Define the canonical navigation structure users experience: primary navigation surfaces,
secondary navigation, and the rules that govern how users move between sections. This is the
source of truth for navigation intent and structure (not implementation code).

## 3. Inputs Required

- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● DES-01: {{xref:DES-01}} | OPTIONAL
- ● PRD-03: {{xref:PRD-03}} | OPTIONAL
- ● RSC-02: {{xref:RSC-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Primary navigation ite... | spec         | Yes             |
| Secondary navigation i... | spec         | Yes             |
| For each nav item:        | spec         | Yes             |
| ○ nav_id                  | spec         | Yes             |
| ○ label (ties to CDX i... | spec         | Yes             |
| ○ destination (screen_... | spec         | Yes             |
| ○ visibility rules (ro... | spec         | Yes             |
| ○ ordering/priority       | spec         | Yes             |
| ○ icon (optional pointer) | spec         | Yes             |
| ○ badges/indicators ru... | spec         | Yes             |
| Global navigation rules:  | spec         | Yes             |
| ○ default landing         | spec         | Yes             |

## 5. Optional Fields

● Search entry points | OPTIONAL
● Deep link entry points | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Do not invent roles; use PRD-03 / IAM concepts.
- Destinations should use screen_id where possible; route_id is finalized in IAN-02.
- Navigation must avoid dead ends: every destination must offer an exit path.
- If visibility rules exist, define a deterministic fallback (hide vs disabled vs upsell).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Navigation Overview (required)`
2. `## 2) Primary Navigation (required)`
3. `## label`
4. `## y[0].lab`
5. `## el}}`
6. `## destinati`
7. `## on_scree`
8. `## n_id`
9. `## destinati`
10. `## on_route`

## 8. Cross-References

- Upstream: {{xref:PRD-03}} | OPTIONAL, {{xref:PRD-04}} | OPTIONAL, {{xref:DES-01}} |
- **OPTIONAL, {{xref:RSC-02}} | OPTIONAL**
- Downstream: {{xref:IAN-02}}, {{xref:DES-02}} | OPTIONAL, {{xref:MAP-01}} |
- **OPTIONAL, {{xref:FE-01}} | OPTIONAL, {{xref:MOB-01}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
