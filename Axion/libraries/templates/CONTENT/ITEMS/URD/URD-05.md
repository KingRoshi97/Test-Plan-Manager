# URD-05 — Validation Plan (what to test,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | URD-05                                             |
| Template Type     | Product / User Research                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring validation plan (what to test,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Validation Plan (what to test, Document                         |

## 2. Purpose

Define what must be validated (assumptions, usability, value, feasibility), how it will be tested,
and what measurement signals will confirm or falsify the hypotheses. This is the bridge from
discovery into build prioritization, metrics instrumentation, and release readiness.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- ●
- ●
- URD-02: {{xref:URD-02}}
- URD-03: {{xref:URD-03}}
- PRD-02: {{xref:PRD-02}} | OPTIONAL
- PRD-04: {{xref:PRD-04}} | OPTIONAL
- SMIP-01: {{xref:SMIP-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing experiment notes: {{inputs.experiment_notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Validation goals (2–8)    | spec         | Yes             |
| Hypotheses to validate... | spec         | Yes             |
| For each hypothesis:      | spec         | Yes             |
| ○ hypothesis_id           | spec         | Yes             |
| ○ statement               | spec         | Yes             |
| ○ type (value/usabilit... | spec         | Yes             |
| ○ mapped needs/pain po... | spec         | Yes             |
| ○ mapped goals/metrics... | spec         | Yes             |
| ○ method (prototype te... | spec         | Yes             |
| ○ success criteria (pa... | spec         | Yes             |
| ○ measurement signals ... | spec         | Yes             |
| ○ sample target (or UN... | spec         | Yes             |

## 5. Optional Fields

●
●
●
●

Tooling | OPTIONAL
Variants / experiment design notes | OPTIONAL
Guardrails | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- 
- 
- 
- 
- 
- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Each hypothesis must map to at least one URD-03 need/pain point item.
- **Success criteria must be testable (numbers or explicit qualitative thresholds).**
- If measurement requires instrumentation, reference SMIP docs.
- Do not define implementation tasks; this is validation only.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Validation Overview`
2. `## 2) Validation Goals`
3. `## 3) Hypotheses Matrix (required)`
4. `## state`
5. `## ment`
6. `## type`
7. `## mappe mappe`
8. `## d_urd_i d_met`
9. `## tem_id ric_ids`
10. `## meth`

## 8. Cross-References

- Upstream: {{xref:URD-02}}, {{xref:URD-03}}, {{xref:PRD-02}} | OPTIONAL
- Downstream: {{xref:SMIP-01}} | OPTIONAL, {{xref:SMIP-02}} | OPTIONAL,
- **{{xref:RSC-03}} | OPTIONAL, {{xref:STK-02}} | OPTIONAL**
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
