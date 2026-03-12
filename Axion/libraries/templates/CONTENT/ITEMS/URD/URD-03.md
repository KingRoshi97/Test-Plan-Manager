# URD-03 — User Needs & Pain Points

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | URD-03                                             |
| Template Type     | Product / User Research                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring user needs & pain points    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled User Needs & Pain Points Document                         |

## 2. Purpose

Convert research themes into a ranked catalog of user needs and pain points. This provides a
deterministic input to prioritization, feature shaping, UX flows, and acceptance criteria without
redefining implementation.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- URD-02: {{xref:URD-02}}
- PRD-03: {{xref:PRD-03}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Raw evidence links: {{inputs.evidence_links}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Needs list (minimum 5)    | spec         | Yes             |
| Pain points list (mini... | spec         | Yes             |
| For each item:            | spec         | Yes             |
| ○ item_id                 | spec         | Yes             |
| ○ type (need / pain_po... | spec         | Yes             |
| ○ statement               | spec         | Yes             |
| ○ impacted persona(s)     | spec         | Yes             |
| ○ severity/importance ... | spec         | Yes             |
| ○ frequency signal (qu... | spec         | Yes             |
| ○ supporting evidence ... | spec         | Yes             |
| ○ mapped theme_id(s)      | spec         | Yes             |
| ○ mapped feature_ids (... | spec         | Yes             |

## 5. Optional Fields

● Segment differences (per persona/tier) | OPTIONAL
● Opportunity notes (what to build/change) | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Every need/pain point must map to at least one theme_id from URD-02.**
- **Evidence pointers must exist for high-ranked items (top 5).**
- **Feature mapping is optional at this stage; if present, only use existing IDs from PRD-04.**
- Do not translate directly into requirements here; recommendations live in URD-02 and
- **changes are tracked via STK decisions.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Ranked Needs & Pain Points (canonical)`
2. `## it ty`
3. `## e pe`
4. `## statem`
5. `## ent`
6. `## person`
7. `## a_ids`
8. `## severit`
9. `## y_or_i`
10. `## mporta`

## 8. Cross-References

- Upstream: {{xref:URD-02}}, {{xref:PRD-03}} | OPTIONAL
- Downstream: {{xref:PRD-04}} | OPTIONAL, {{xref:DES-01}} | OPTIONAL,
- **{{xref:PRD-09}} | OPTIONAL, {{xref:RSC-03}} | OPTIONAL**
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
