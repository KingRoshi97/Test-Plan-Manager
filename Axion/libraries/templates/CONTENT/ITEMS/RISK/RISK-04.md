# RISK-04 — Contingency Triggers (what

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RISK-04                                             |
| Template Type     | Product / Risk                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring contingency triggers (what    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Contingency Triggers (what Document                         |

## 2. Purpose

Define explicit trigger conditions that force a plan change (scope, timeline, architecture, rollout).
This makes escalation and contingency behavior deterministic instead of reactive.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- ●
- RISK-02: {{xref:RISK-02}}
- RSC-01: {{xref:RSC-01}} | OPTIONAL
- RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- STK-04: {{xref:STK-04}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Trigger list (minimum 8)  | spec         | Yes             |
| For each trigger:         | spec         | Yes             |
| ○ trig_id                 | spec         | Yes             |
| ○ related_risk_id         | spec         | Yes             |
| ○ condition (clear thr... | spec         | Yes             |
| ○ detection_method (ho... | spec         | Yes             |
| ○ response_action (wha... | spec         | Yes             |
| ○ decision_owner (stak... | spec         | Yes             |
| ○ response_sla            | spec         | Yes             |
| ○ rollback_or_mitigati... | spec         | Yes             |
| ○ comms_required (who ... | spec         | Yes             |

## 5. Optional Fields

● Severity tiers | OPTIONAL
● Playbook link | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Conditions must be measurable (thresholds, counts, time windows).
- Decision owner must exist in STK-01/04 governance.
- Any trigger that changes scope must reference RSC-04 change control path.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Contingency Triggers (canonical)`
2. `## related`
3. `## _risk_i`
4. `## conditio`
5. `## detecti`
6. `## on_me`
7. `## thod`
8. `## respon`
9. `## se_acti`
10. `## decisio`

## 8. Cross-References

- Upstream: {{xref:RISK-02}}, {{xref:RSC-01}} | OPTIONAL, {{xref:RELIA-01}} | OPTIONAL
- Downstream: {{xref:RSC-04}} | OPTIONAL, {{xref:REL-04}} | OPTIONAL,
- **{{xref:OPS-05}} | OPTIONAL**
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
