# IAN-03 — Information Architecture Tree

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IAN-03                                             |
| Template Type     | Design / Information Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring information architecture tree    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Information Architecture Tree Document                         |

## 2. Purpose

Define the canonical information hierarchy: top-level sections, sub-sections, and the
screens/pages that live within each. This makes the product navigable, supports labeling
consistency, and prevents duplicated or orphaned surfaces.

## 3. Inputs Required

- ● IAN-01: {{xref:IAN-01}} | OPTIONAL
- ● DES-02: {{xref:DES-02}} | OPTIONAL
- ● URD-03: {{xref:URD-03}} | OPTIONAL
- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● CDX-01: {{xref:CDX-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| IA tree (minimum 2 lev... | spec         | Yes             |
| Each node includes:       | spec         | Yes             |
| ○ node_id                 | spec         | Yes             |
| ○ label (or label key)    | spec         | Yes             |
| ○ type (section/subsec... | spec         | Yes             |
| ○ destination (screen_... | spec         | Yes             |
| ○ visibility rules (ro... | spec         | Yes             |
| ○ ordering                | spec         | Yes             |
| (can have secondary li... | spec         | Yes             |

## 5. Optional Fields

● Search taxonomy (tags/categories) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- IA labels must align with CDX-01 style rules; final strings live in CDX-02.
- Avoid duplicating screens in multiple primary homes; if needed, choose one primary and
- **list others as secondary links.**
- Visibility rules must be deterministic (no “depends”).
- If a screen is “utility” (settings, help), it must still have a home location.

## 7. Output Format

### Required Headings (in order)

1. `## 1) IA Tree (required)`
2. `## Use a structured outline plus a canonical table.`
3. `## Outline`
4. `## 2) IA Nodes Table (canonical)`
5. `## label`
6. `## type`
7. `## [0].labe`
8. `## l}}`
9. `## [1].labe`
10. `## l}}`

## 8. Cross-References

- Upstream: {{xref:IAN-01}}, {{xref:DES-02}} | OPTIONAL, {{xref:URD-03}} | OPTIONAL
- Downstream: {{xref:IAN-02}} | OPTIONAL, {{xref:CDX-02}} | OPTIONAL, {{xref:DISC-*}} |
- OPTIONAL
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
