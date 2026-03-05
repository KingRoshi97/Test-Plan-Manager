# STK-03 — RACI / Ownership Matrix

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | STK-03                                             |
| Template Type     | Product / Stakeholders                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring raci / ownership matrix    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled RACI / Ownership Matrix Document                         |

## 2. Purpose

Define operational ownership across recurring responsibilities so execution is deterministic (who
does what). This is the canonical “who is responsible/accountable” table used during build and
release.

## 3. Inputs Required

- ● STK-01: {{xref:STK-01}}
- ● Standards: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Responsibility list (m... | spec         | Yes             |
| For each responsibility:  | spec         | Yes             |
| ○ responsibility_id       | spec         | Yes             |
| ○ area                    | spec         | Yes             |
| ○ description             | spec         | Yes             |
| ○ R (responsible) stak... | spec         | Yes             |
| ○ A (accountable) stak... | spec         | Yes             |
| ○ C (consulted) stakeh... | spec         | Yes             |
| ○ I (informed) stakeho... | spec         | Yes             |

## 5. Optional Fields

● SLA/hand-off notes | OPTIONAL
● Backup owners | OPTIONAL

## 6. Rules

- A must be exactly one stakeholder.
- Stakeholder IDs must come from STK-01.
- Responsibilities must cover at least: product, design, backend, frontend, data, security,
- **ops, QA, release.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) RACI Matrix (canonical)`
2. `## responsi`
3. `## bility_id`
4. `## area`
5. `## description`
6. `## notes`
7. `## resp_01`
8. `## area}}`
9. `## ription}}`
10. `## ].R}}`

## 8. Cross-References

- Upstream: {{xref:STK-01}}
- Downstream: {{xref:STK-04}} | OPTIONAL
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
