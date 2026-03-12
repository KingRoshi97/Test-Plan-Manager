# DES-02 — Screen Inventory (by

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-02                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring screen inventory (by    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Screen Inventory (by Document                         |

## 2. Purpose

Create the canonical inventory of screens, their IDs, and how they relate to routes/navigation.
This is the bridge between flows and implementation routing.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- DES-01: {{xref:DES-01}}
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- IAN-01: {{xref:IAN-01}} | OPTIONAL
- IAN-02: {{xref:IAN-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Screen list (minimum 8... | spec         | Yes             |
| For each screen:          | spec         | Yes             |
| ○ screen_id               | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ route_id / path (or ... | spec         | Yes             |
| ○ purpose (1–2 sentences) | spec         | Yes             |
| ○ entry points (what r... | spec         | Yes             |
| ○ exit destinations (w... | spec         | Yes             |
| ○ linked_flow_ids         | spec         | Yes             |
| ○ linked_feature_ids      | spec         | Yes             |
| ○ access requirements ... | spec         | Yes             |
| ○ primary states (from... | spec         | Yes             |

## 5. Optional Fields

● Platform variants (web/mobile) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Screen IDs must be stable and unique (screen_<slug>).
- Route IDs must match IAN-02 if present; otherwise mark UNKNOWN and link to IAN
- **work.**
- Access requirements must reference PRD-03/IAM concepts, not invent new roles.
- Do not define component-level layout; that belongs in DES-03/04.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Screen Inventory (canonical)`
2. `## nam`
3. `## route`
4. `## _id_`
5. `## or_p`
6. `## ath`
7. `## purpo`
8. `## entry`
9. `## _poi`
10. `## nts`

## 8. Cross-References

- Upstream: {{xref:DES-01}}, {{xref:PRD-04}} | OPTIONAL
- Downstream: {{xref:DES-03}}, {{xref:IAN-02}} | OPTIONAL, {{xref:MAP-01}} |
- **OPTIONAL, {{xref:FE-01}} | OPTIONAL, {{xref:MOB-01}} | OPTIONAL**
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
