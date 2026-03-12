# SMIP-04 — Experiment Measurement Plan

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMIP-04                                             |
| Template Type     | Product / Metrics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring experiment measurement plan    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Experiment Measurement Plan Document                         |

## 2. Purpose

Define how experiments will be measured: success metrics, guardrails, stop conditions, and
analysis requirements. This is the product-facing measurement plan that can be executed by
the experimentation system.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- SMIP-01: {{xref:SMIP-01}}
- URD-05: {{xref:URD-05}} | OPTIONAL
- SMIP-03: {{xref:SMIP-03}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Experiment list (minim... | spec         | Yes             |
| For each experiment:      | spec         | Yes             |
| ○ exp_id                  | spec         | Yes             |
| ○ hypothesis              | spec         | Yes             |
| ○ primary_metric_id       | spec         | Yes             |
| ○ secondary_metric_ids    | spec         | Yes             |
| ○ guardrail_metric_ids    | spec         | Yes             |
| success threshold         | spec         | Yes             |
| stop conditions           | spec         | Yes             |
| segments                  | spec         | Yes             |
| duration / sample size... | spec         | Yes             |
| analysis notes            | spec         | Yes             |

## 5. Optional Fields

● Statistical method notes | OPTIONAL
● Open questions | OPTIONAL

## 6. Rules

- If applies == false, include N/A block only.
- Primary/guardrail metrics must exist in SMIP-01.
- Stop conditions must be explicit and measurable.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Experiment Plans (if applies)`
3. `## hypothe`
4. `## sis`
5. `## primary_m`
6. `## etric_id`
7. `## guardrail`
8. `## _metric_`
9. `## ids`
10. `## success`

## 8. Cross-References

- Upstream: {{xref:SMIP-01}}, {{xref:URD-05}} | OPTIONAL
- Downstream: {{xref:EXPER-*}} | OPTIONAL
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
