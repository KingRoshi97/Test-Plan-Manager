# STK-02 — Decision Log (what/why/when)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | STK-02                                             |
| Template Type     | Product / Stakeholders                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring decision log (what/why/when)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Decision Log (what/why/when) Document                         |

## 2. Purpose

Create the canonical audit of material decisions that affect scope, architecture, security, data,
UX, release, and operations. This log is the source of truth for “why we chose X,” and is used to
prevent re-litigating decisions.

## 3. Inputs Required

- ● STK-01: {{xref:STK-01}}
- ● Standards: {{standards.index}} | OPTIONAL
- ● Decision notes: {{inputs.decision_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Decision entries (can ... | spec         | Yes             |
| For each decision:        | spec         | Yes             |
| ○ decision_id             | spec         | Yes             |
| ○ date                    | spec         | Yes             |
| ○ decision_title          | spec         | Yes             |
| ○ decision_statement      | spec         | Yes             |
| ○ context                 | spec         | Yes             |
| ○ options_considered      | spec         | Yes             |
| ○ rationale               | spec         | Yes             |
| ○ approver_stakeholder_id | spec         | Yes             |
| ○ status (proposed/app... | spec         | Yes             |
| ○ affected_docs (IDs)     | spec         | Yes             |

## 5. Optional Fields

● Evidence/links | OPTIONAL
● Follow-ups | OPTIONAL

## 6. Rules

- Decision IDs must be stable and unique (dec_YYYYMMDD_<slug> or dec_<seq>).
- Approver must be a stakeholder from STK-01.
- If a decision changes PRD scope or requirements, it must reference PRD-04 and
- **RSC-04.**
- Reversals must be explicit and point to the reversing decision.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Decision Log (canonical)`
2. `## cis`
3. `## ion`
4. `## _id`
5. `## date`
6. `## area`
7. `## title`
8. `## decision`
9. `## _stateme`
10. `## approver_`

## 8. Cross-References

- Upstream: {{xref:STK-01}}
- Downstream: {{xref:RSC-04}} | OPTIONAL, {{xref:PRD-04}} | OPTIONAL, {{xref:ARC-*}}
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
