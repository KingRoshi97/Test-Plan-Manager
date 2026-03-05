# BRP-04 — Exceptions & Edge-Case Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | BRP-04                                             |
| Template Type     | Product / Business Rules                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring exceptions & edge-case policy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Exceptions & Edge-Case Policy Document                         |

## 2. Purpose

Define the canonical handling for edge cases and exceptions so behavior is consistent across
UI/API/ops and is testable. This prevents ad-hoc “special cases” being implemented differently
across the system.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- BRP-01: {{xref:BRP-01}} | OPTIONAL
- PRD-09: {{xref:PRD-09}} | OPTIONAL
- DMG-03: {{xref:DMG-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Known edge case notes: {{inputs.edge_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Exceptions list (minim... | spec         | Yes             |
| For each exception:       | spec         | Yes             |
| ○ ex_id                   | spec         | Yes             |
| ○ triggering_condition    | spec         | Yes             |
| ○ affected_rule_ids / ... | spec         | Yes             |
| ○ expected_system_beha... | spec         | Yes             |
| ○ user_experience (wha... | spec         | Yes             |
| ○ enforcement_points (... | spec         | Yes             |
| ○ logging/audit requir... | spec         | Yes             |
| ○ test cases required ... | spec         | Yes             |
| ○ severity (P0/P1/P2)     | spec         | Yes             |
| Global policy for “unk... | spec         | Yes             |

## 5. Optional Fields

● Support playbook pointer | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Every exception must be testable (must map to a test case requirement).
- P0 exceptions must define logging/audit requirements and a user-facing experience.
- If “unhandled case” behavior is not defined, default must be explicit (fail-safe vs
- **permissive).**

## 7. Output Format

### Required Headings (in order)

1. `## 1) Exceptions Catalog (canonical)`
2. `## e conditio affected_ expecte`
3. `## refs`
4. `## d_beha`
5. `## vior`
6. `## user_`
7. `## exper`
8. `## ience`
9. `## enforce`
10. `## ment_po`

## 8. Cross-References

- Upstream: {{xref:BRP-01}} | OPTIONAL, {{xref:DMG-03}} | OPTIONAL
- Downstream: {{xref:API-03}} | OPTIONAL, {{xref:ARC-06}} | OPTIONAL, {{xref:QA-02}} |
- **OPTIONAL, {{xref:ADMIN-02}} | OPTIONAL**
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
