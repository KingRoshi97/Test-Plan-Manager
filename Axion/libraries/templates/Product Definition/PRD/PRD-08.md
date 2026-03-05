# PRD-08 — Open Questions Log

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-08                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring open questions log    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Open Questions Log Document                         |

## 2. Purpose

Maintain a single canonical backlog of unresolved product questions that block or affect scope,
design, architecture, security, testing, or release readiness. This prevents unknowns from being
scattered across documents and enables deterministic gating (“no critical unknowns”).

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- PRD-07: {{xref:PRD-07}} | OPTIONAL
- SPEC_INDEX: {{spec.index}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Question list (can be ... | spec         | Yes             |
| For each question:        | spec         | Yes             |
| ○ question_id             | spec         | Yes             |
| ○ question                | spec         | Yes             |
| ○ impact (P0 blocker /... | spec         | Yes             |
| ○ affected feature_ids... | spec         | Yes             |
| owner                     | spec         | Yes             |
| status (open/answered/... | spec         | Yes             |
| target_resolution_date... | spec         | Yes             |
| resolution (if answere... | spec         | Yes             |

## 5. Optional Fields

● Evidence links / notes | OPTIONAL
● Decision log pointer | OPTIONAL
● Dependencies (who/what is needed) | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- 
- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If any P0 blocker question is status=open, release gate must fail (downstream).
- **Question IDs must be stable and unique (oq_01, oq_02… or oq_).**
- If a question is “answered”, provide the resolution text and update affected docs list.
- **Keep resolutions short; detailed answers belong in the relevant canonical doc and**
- **should be referenced.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Open Questions Table (canonical)`
2. `## ques`
3. `## tion`
4. `## categ`
5. `## ory`
6. `## impa`
7. `## affecte`
8. `## d_feat`
9. `## ure_id`
10. `## affect`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-04}}, {{xref:PRD-06}}, {{xref:PRD-07}} |
- OPTIONAL
- Downstream: {{xref:STK-02}} | OPTIONAL, {{xref:RISK-01}} | OPTIONAL, {{xref:REL-*}} |
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
