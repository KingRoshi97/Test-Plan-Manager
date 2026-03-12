# STK-04 — Approval Gates (who signs

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | STK-04                                             |
| Template Type     | Product / Stakeholders                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring approval gates (who signs    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Approval Gates (who signs Document                         |

## 2. Purpose

Define the approval checkpoints for the kit so builds can be gated deterministically. This
specifies which docs/artifacts require sign-off, by whom, and under what pass conditions.

## 3. Inputs Required

- ● STK-01: {{xref:STK-01}}
- ● STK-03: {{xref:STK-03}} | OPTIONAL
- ● Standards: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Gate list (minimum 5 f... | spec         | Yes             |
| For each gate:            | spec         | Yes             |
| ○ gate_id                 | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ required_artifacts (... | spec         | Yes             |
| ○ approver_stakeholder... | spec         | Yes             |
| ○ pass_conditions (hum... | spec         | Yes             |
| ○ evidence_required (l... | spec         | Yes             |
| ○ SLA (approval time e... | spec         | Yes             |
| ○ failure_path (what h... | spec         | Yes             |

## 5. Optional Fields

● Delegated approvals | OPTIONAL
● Conditional gates (only for certain targets) | OPTIONAL

## 6. Rules

- Approvers must exist in STK-01.
- Gates must align to the pipeline’s gating model; do not invent gate semantics that
- **conflict with TMP-05.**
- Each gate must declare evidence_required; otherwise it is not enforceable.
- If a gate references artifacts that don’t exist, mark UNKNOWN and block completeness.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Approval Gates (canonical)`
2. `## name`
3. `## stage`
4. `## required`
5. `## _artifact`
6. `## approver`
7. `## _ids`
8. `## pass_condi`
9. `## tions`
10. `## evidenc`

## 8. Cross-References

- Upstream: {{xref:STK-01}}, {{xref:STK-03}} | OPTIONAL
- Downstream: {{xref:TRC-03}} | OPTIONAL, {{xref:TRC-04}} | OPTIONAL, {{xref:REL-01}}
- | OPTIONAL
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
