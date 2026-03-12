# PRD-09 — Acceptance Criteria Catalog (by

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-09                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring acceptance criteria catalog (by    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Acceptance Criteria Catalog (by Document                         |

## 2. Purpose

Define the canonical acceptance criteria set that proves features are “done.” This catalog
anchors QA planning and test case generation while remaining product-level (not
implementation-level). Criteria are written in testable language and mapped to feature IDs and,
when available, flow IDs.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- PRD-04: {{xref:PRD-04}}
- PRD-05: {{xref:PRD-05}} | OPTIONAL
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- SPEC_INDEX: {{spec.index}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Acceptance criteria li... | spec         | Yes             |
| For each criterion:       | spec         | Yes             |
| ○ ac_id                   | spec         | Yes             |
| ○ linked_feature_id       | spec         | Yes             |
| ○ linked_flow_id (or U... | spec         | Yes             |
| ○ criterion statement ... | spec         | Yes             |
| accessibility)            | spec         | Yes             |
| ○ priority (P0/P1/P2)     | spec         | Yes             |
| ○ pass condition (what... | spec         | Yes             |
| ○ negative cases (at l... | spec         | Yes             |

## 5. Optional Fields

● References to NFRs (nfr_id) | OPTIONAL
● References to business rules (br_id) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Criteria must be testable and unambiguous. Avoid “fast”, “easy”, “intuitive” unless
- **quantified.**
- For P0 features, include:
- **○ at least one happy-path criterion**
- **○ at least one negative/edge criterion**
- If a criterion depends on an NFR threshold, reference PRD-06 or nfr_id.
- Do not define UI layout; that belongs in DES templates. Reference screen IDs when
- **needed.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Acceptance Criteria Catalog (canonical)`
2. `## feature_i`
3. `## flow_id`
4. `## nce[0].fe ance[0].f`
5. `## ature_id}} low_id}}`
6. `## type`
7. `## priority`
8. `## criterion`
9. `## pass_con`
10. `## dition`

## 8. Cross-References

- Upstream: {{xref:PRD-04}}, {{xref:PRD-05}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL
- Downstream: {{xref:QA-01}}, {{xref:QA-02}}, {{xref:DES-01}} | OPTIONAL,
- **{{xref:DES-04}} | OPTIONAL**
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
