# RISK-03 — Dependency Map

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RISK-03                                             |
| Template Type     | Product / Risk                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring dependency map    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Dependency Map Document                         |

## 2. Purpose

List the internal and external dependencies that affect delivery, along with owners, timelines,
and failure modes. This makes sequencing and risk mitigation deterministic.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- RSC-01: {{xref:RSC-01}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- IMP-01: {{xref:IMP-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Dependency list (minim... | spec         | Yes             |
| For each dependency:      | spec         | Yes             |
| ○ dep_id                  | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ description             | spec         | Yes             |
| ○ needed_for (mileston... | spec         | Yes             |
| ○ owner                   | spec         | Yes             |
| ○ due_date (or UNKNOWN)   | spec         | Yes             |
| ○ status (not_started/... | spec         | Yes             |
| ○ failure_mode (what h... | spec         | Yes             |
| ○ mitigation (fallback... | spec         | Yes             |

## 5. Optional Fields

● Contract/SLA info | OPTIONAL
● Links | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- Every dependency must have a failure_mode and mitigation.
- If due_date is UNKNOWN, it must include a tracking plan.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Dependency Map (canonical)`
2. `## name`
3. `## type`
4. `## needed_`
5. `## for`
6. `## owner`
7. `## due_da`
8. `## status`
9. `## failure_m`
10. `## ode`

## 8. Cross-References

- Upstream: {{xref:RSC-01}} | OPTIONAL, {{xref:IMP-01}} | OPTIONAL, {{xref:PRD-04}} |
- OPTIONAL
- Downstream: {{xref:RISK-02}} | OPTIONAL, {{xref:REL-01}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- beginner: Required. List deps + needed_for + mitigation.
- intermediate: Required. Add failure modes and status tracking.
- advanced: Not required. (Advanced vendor ops lives in COMP/OPS.)
- Unknown Handling
- UNKNOWN_ALLOWED: due_date, links, contract_sla, open_questions
- If failure_mode or mitigation is UNKNOWN → block

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
