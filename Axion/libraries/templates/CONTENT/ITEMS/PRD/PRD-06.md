# PRD-06 — Non-Functional Requirements

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PRD-06                                             |
| Template Type     | Product / Requirements                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring non-functional requirements    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Non-Functional Requirements Document                         |

## 2. Purpose

Define the measurable non-functional requirements that constrain architecture, implementation,
ops, and testing: performance, reliability, security, privacy, scalability, availability, maintainability,
accessibility, and compliance. These must be written as testable requirements with thresholds
wherever possible.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- PRD-01: {{xref:PRD-01}}
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- SPEC_INDEX: {{spec.index}}
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing SLOs/ops notes: {{inputs.slo_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each NFR:             | spec         | Yes             |
| ○ nfr_id                  | spec         | Yes             |
| ○ category                | spec         | Yes             |
| ○ requirement statement   | spec         | Yes             |
| ○ measurable threshold... | spec         | Yes             |
| ○ verification method ... | spec         | Yes             |
| ○ owner                   | spec         | Yes             |
| ○ priority (P0/P1/P2)     | spec         | Yes             |
| Explicit “MVP vs Later... | spec         | Yes             |

## 5. Optional Fields

●
●
●
●

Baseline (current) | OPTIONAL
Dependencies (tools/infrastructure) | OPTIONAL
Cost constraints | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- NFRs must be testable. If a threshold is unknown, include a verification plan for how it
- **will be determined.**
- Do not duplicate security controls; reference SEC templates for control catalogs.
- Every P0 NFR must have a verification method.
- If accessibility applies, include category “accessibility” and cross-reference L10N/A11Y
- **templates.**

## 7. Output Format

### Required Headings (in order)

1. `## 1) NFR Summary (by category)`
2. `## categor`
3. `## count`
4. `## p0_count`
5. `## notes`
6. `## perform`
7. `## ance`
8. `## e.count}}`
9. `## nce.p0}}`
10. `## e.notes}}`

## 8. Cross-References

- Upstream: {{xref:PRD-01}}, {{xref:PRD-02}} | OPTIONAL, {{xref:PRD-04}} | OPTIONAL
- Downstream: {{xref:ARC-01}}, {{xref:ARC-02}}, {{xref:SEC-01}}, {{xref:SEC-02}},
- **{{xref:QA-01}}, {{xref:PERF-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- Skill Level Requiredness Rules
- beginner: Required. Thresholds may be UNKNOWN but must include
- verification_method.
- intermediate: Required. Add realistic thresholds where inputs exist; map NFRs to
- surfaces.
- advanced: Required. Add explicit SLO/SLA targets and error budget notes where
- applicable.
- Unknown Handling
- UNKNOWN_ALLOWED: threshold, baseline, dependencies,
- cost_constraints, open_questions
- If priority == P0 and verification_method is UNKNOWN → block

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
