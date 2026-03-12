# DES-08 — Acceptance Hooks (screen/flow

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DES-08                                             |
| Template Type     | Design / UX                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring acceptance hooks (screen/flow    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Acceptance Hooks (screen/flow Document                         |

## 2. Purpose

Create a deterministic mapping from acceptance criteria (PRD-09) to the UX surfaces where
they are satisfied (flows/screens) so QA and implementation can prove completion without
ambiguity.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- DES-01: {{xref:DES-01}}
- DES-02: {{xref:DES-02}}
- PRD-09: {{xref:PRD-09}}
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Mapping table:            | spec         | Yes             |
| ○ ac_id → flow_id(s) +... | spec         | Yes             |
| Coverage check:           | spec         | Yes             |
| ○ every P0 acceptance ... | spec         | Yes             |

## 5. Optional Fields

● Endpoint/component pointers | OPTIONAL
● Test case pointers | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Only reference existing IDs: ac_* from PRD-09, flow_* from DES-01, screen_* from
- **DES-02.**
- This does not define tests; it defines where criteria are satisfied.
- If any P0 acceptance criterion lacks a hook, gate fails.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Acceptance Hooks Map (canonical)`
2. `## ac_id`
3. `## feature_id`
4. `## mapped_f`
5. `## low_ids`
6. `## mapped_s`
7. `## creen_ids`
8. `## notes`
9. `## mapped_en`
10. `## dpoint_ids`

## 8. Cross-References

- Upstream: {{xref:PRD-09}}, {{xref:DES-01}}, {{xref:DES-02}}
- Downstream: {{xref:QA-02}} | OPTIONAL, {{xref:MAP-04}} | OPTIONAL, {{xref:TRC-02}}
- | OPTIONAL
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
