# RISK-01 — Assumptions Register

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RISK-01                                             |
| Template Type     | Product / Risk                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring assumptions register    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Assumptions Register Document                         |

## 2. Purpose

Maintain the canonical list of assumptions the product/build depends on, including validation
plans and timelines. Assumptions are not constraints; they are beliefs that must be tested or
monitored.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- URD-01: {{xref:URD-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Assumptions list (minimum 10 for non-trivial products)
● For each assumption:
○ assumption_id
○ statement
○ category (market/user/tech/ops/legal/financial)
○ why_it_matters
○ risk_if_false
○ validation_plan
○ validate_by (date or milestone) (or UNKNOWN)

○
○
○
○

owner
status (unvalidated/validated/invalidated/monitoring)
evidence (if validated) | OPTIONAL
impacted_feature_ids / domains / docs

## 5. Optional Fields

● Monitoring signals | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Each assumption must have a validation_plan (no exceptions).
- If status is validated/invalidated, evidence must be present.
- If validate_by is UNKNOWN, include a mitigation note.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Assumptions Register (canonical)`
2. `## pti`
3. `## statem`
4. `## ent`
5. `## categ`
6. `## ory`
7. `## why_`
8. `## it_m`
9. `## atter`
10. `## risk_`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-02}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL,
- **{{xref:URD-01}} | OPTIONAL**
- Downstream: {{xref:URD-05}} | OPTIONAL, {{xref:RISK-02}}, {{xref:STK-02}} |
- **OPTIONAL, {{xref:IMP-01}} | OPTIONAL**
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
