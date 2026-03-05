# RISK-02 — Risk Register

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RISK-02                                             |
| Template Type     | Product / Risk                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring risk register    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Risk Register Document                         |

## 2. Purpose

Track and prioritize risks with clear mitigation, owners, and triggers. This is the canonical list
used for planning tradeoffs, security posture, ops readiness, and release gating.

## 3. Inputs Required

- ●
- ●
- ●
- ●
- RISK-01: {{xref:RISK-01}} | OPTIONAL
- PRD-06: {{xref:PRD-06}} | OPTIONAL
- RSC-01: {{xref:RSC-01}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Risks list (minimum 10... | spec         | Yes             |
| For each risk:            | spec         | Yes             |
| ○ risk_id                 | spec         | Yes             |
| ○ statement               | spec         | Yes             |
| ○ category (product/te... | spec         | Yes             |
| ○ probability (low/med... | spec         | Yes             |
| ○ impact (low/med/high... | spec         | Yes             |
| ○ severity (derived or... | spec         | Yes             |
| ○ mitigation_plan         | spec         | Yes             |
| owner                     | spec         | Yes             |
| trigger_signals (what ... | spec         | Yes             |
| status (open/mitigatin... | spec         | Yes             |

## 5. Optional Fields

● Contingency plan | OPTIONAL
● Residual risk | OPTIONAL
● Links/evidence | OPTIONAL

## 6. Rules

- Every risk must have a mitigation_plan.
- Any “accepted” risk must include rationale and approver (stakeholder_id) or STK-02
- **reference.**
- Top risks (by severity) must have triggers.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Risk Register (canonical)`
2. `## state`
3. `## ment`
4. `## categ`
5. `## ory`
6. `## prob`
7. `## abili`
8. `## impa`
9. `## sever`
10. `## ity`

## 8. Cross-References

- Upstream: {{xref:RISK-01}} | OPTIONAL, {{xref:PRD-06}} | OPTIONAL, {{xref:RSC-01}} |
- OPTIONAL
- Downstream: {{xref:IMP-01}} | OPTIONAL, {{xref:RELIA-01}} | OPTIONAL,
- **{{xref:SEC-01}} | OPTIONAL, {{xref:STK-02}} | OPTIONAL**
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
