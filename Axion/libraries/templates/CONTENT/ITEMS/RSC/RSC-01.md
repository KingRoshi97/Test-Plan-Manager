# RSC-01 — Release Roadmap (milestones)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RSC-01                                             |
| Template Type     | Product / Roadmap                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring release roadmap (milestones)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Release Roadmap (milestones) Document                         |

## 2. Purpose

Define the canonical release roadmap: milestones, scope slices, and target dates (or date
ranges). This is not a task plan; it is a product-level sequencing map that aligns stakeholders
and gates.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- PRD-04: {{xref:PRD-04}}
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- STK-04: {{xref:STK-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing roadmap notes: {{inputs.roadmap_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Roadmap horizon (e.g.,... | spec         | Yes             |
| Milestones list (minim... | spec         | Yes             |
| For each milestone:       | spec         | Yes             |
| ○ milestone_id            | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ objective               | spec         | Yes             |
| ○ target_date (or UNKN... | spec         | Yes             |
| ○ included feature_ids... | spec         | Yes             |
| ○ exit criteria (high ... | spec         | Yes             |
| ○ dependencies (intern... | spec         | Yes             |
| ○ stakeholders/approvers  | spec         | Yes             |
| Risks to roadmap (top ... | spec         | Yes             |

## 5. Optional Fields

● Confidence level per milestone | OPTIONAL
● Beta/RC phases | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Milestones must reference existing feature IDs from PRD-04 where possible.**
- **Exit criteria must be measurable or tied to gates (QA/REL).**
- Do not include implementation tasks; that belongs in IMP.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Roadmap Overview`
2. `## 2) Milestones (canonical)`
3. `## mil`
4. `## est`
5. `## e_i`
6. `## name`
7. `## objectiv`
8. `## target`
9. `## _date`
10. `## included`

## 8. Cross-References

- Upstream: {{xref:PRD-04}}, {{xref:PRD-06}} | OPTIONAL, {{xref:PRD-02}} | OPTIONAL
- Downstream: {{xref:IMP-01}} | OPTIONAL, {{xref:REL-*}} | OPTIONAL, {{xref:QA-04}} |
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
