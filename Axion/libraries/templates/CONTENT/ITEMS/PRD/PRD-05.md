# PRD-05 — User Stories / JTBD Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-05                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring user stories / jtbd map    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled User Stories / JTBD Map Document                         |

## 2. Purpose

Translate the feature catalog into user-centered intent statements (User Stories and/or
Jobs-To-Be-Done) that can be traced to feature IDs and later to flows, screens, endpoints, and
test cases. This creates a clear “why” layer without redefining implementation.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-03: {{xref:PRD-03}}
- PRD-04: {{xref:PRD-04}}
- SPEC_INDEX: {{spec.index}}
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Story/JTBD format choi... | spec         | Yes             |
| For each item:            | spec         | Yes             |
| ○ story_id / job_id       | spec         | Yes             |
| ○ persona_id              | spec         | Yes             |
| ○ linked_feature_ids      | spec         | Yes             |
| ○ intent statement (st... | spec         | Yes             |
| ○ acceptance outcomes ... | spec         | Yes             |
| ○ priority (P0/P1/P2)     | spec         | Yes             |
| ○ edge cases summary      | spec         | Yes             |
| Coverage mapping: ever... | spec         | Yes             |

## 5. Optional Fields

●
●
●
●

Preconditions | OPTIONAL
Frequency / importance | OPTIONAL
Related workflows (derived) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not create new features; map only to existing IDs from {{spec.features_by_id}}.
- Use canonical persona IDs from {{spec.personas_by_id}} or {{xref:PRD-03}}.
- If acceptance outcomes are unknown, mark UNKNOWN and add to Open Questions.
- **P0 coverage is mandatory; if missing, fails Completeness Gate.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Format Selection`
2. `## 2) User Stories (if used)`
3. `## sto`
4. `## ry_i`
5. `## persona_id`
6. `## story`
7. `## linked_featu`
8. `## re_ids`
9. `## priority`
10. `## acceptance`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-03}}, {{xref:PRD-04}}
- Downstream: {{xref:DES-01}}, {{xref:DES-04}}, {{xref:QA-02}} | OPTIONAL,
- **{{xref:IMP-01}} | OPTIONAL**
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
