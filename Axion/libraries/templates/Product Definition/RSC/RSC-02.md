# RSC-02 — Scope Boundaries (in/out +

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RSC-02                                             |
| Template Type     | Product / Roadmap                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring scope boundaries (in/out +    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Scope Boundaries (in/out + Document                         |

## 2. Purpose

Lock the explicit boundaries of what is in-scope vs out-of-scope for the current build phase, with
rationale. This prevents scope creep and serves as a gating reference for change control.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- STK-02: {{xref:STK-02}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Current phase label (M... | spec         | Yes             |
| In-scope list (minimum... | spec         | Yes             |
| Out-of-scope list (min... | spec         | Yes             |
| Rationale per item (br... | spec         | Yes             |
| Boundary rules (how to... | spec         | Yes             |
| Escalation path (who d... | spec         | Yes             |

## 5. Optional Fields

● Future scope (later) | OPTIONAL
● Known trade-offs | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- “In-scope” can be features, capabilities, platforms, or constraints—must be explicit.
- If using feature IDs, reference PRD-04 only.
- Out-of-scope items must be specific enough to be testable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Phase`
2. `## 2) In-Scope (required)`
3. `## scope`
4. `## _id`
5. `## statement`
6. `## in_01`
7. `## ment}}`
8. `## in_02`
9. `## ment}}`
10. `## type`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-04}} | OPTIONAL
- Downstream: {{xref:RSC-04}}, {{xref:IMP-01}} | OPTIONAL
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
