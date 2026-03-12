# PRD-07 — Constraints & Assumptions

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-07                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring constraints & assumptions    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Constraints & Assumptions Document                         |

## 2. Purpose

Centralize the hard constraints and working assumptions that shape the build. This document
prevents hidden requirements, forces explicit trade-offs, and feeds planning, architecture, risk
management, and release gating.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- SPEC_INDEX: {{spec.index}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing constraints notes: {{inputs.constraints_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Constraints list (mini... | spec         | Yes             |
| For each constraint:      | spec         | Yes             |
| ○ constraint_id           | spec         | Yes             |
| ○ statement               | spec         | Yes             |
| ○ type (business/techn... | spec         | Yes             |
| ○ rationale               | spec         | Yes             |
| ○ impacted areas (doma... | spec         | Yes             |
| ○ enforcement (how it ... | spec         | Yes             |
| ○ severity (hard/soft)    | spec         | Yes             |
| Assumptions list (mini... | spec         | Yes             |
| For each assumption:      | spec         | Yes             |
| ○ assumption_id           | spec         | Yes             |

## 5. Optional Fields

● Linked NFRs | OPTIONAL
● Dependencies (external systems) | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Constraints are “must” statements; assumptions are “we believe” statements.**
- Each assumption must include a validation plan (even if minimal).
- If enforcement or validation plan is unknown, mark UNKNOWN and add to Open
- **Questions.**
- If a constraint conflicts with another constraint/NFR, flag explicitly.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Constraints Catalog (required)`
2. `## nst`
3. `## rai`
4. `## nt_`
5. `## stateme`
6. `## type`
7. `## severity`
8. `## rational`
9. `## impacte`
10. `## d_doma`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-06}} | OPTIONAL
- Downstream: {{xref:RISK-01}} | OPTIONAL, {{xref:ARC-01}}, {{xref:IMP-01}},
- **{{xref:REL-*}} | OPTIONAL**
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
