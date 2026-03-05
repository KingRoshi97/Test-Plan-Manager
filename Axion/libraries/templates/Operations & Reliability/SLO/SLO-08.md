# SLO-08 — Review Cadence & Ownership (monthly reviews)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-08                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring review cadence & ownership (monthly reviews)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Review Cadence & Ownership (monthly reviews) Document                         |

## 2. Purpose

Define the canonical process for SLO reviews: cadence, participants, required inputs/outputs,
and how actions are tracked. This template ensures reliability governance is routine and tied to
error budgets, incidents, and change freezes.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Error budget policy: {{xref:SLO-04}} | OPTIONAL
- SLO reporting: {{xref:SLO-10}} | OPTIONAL
- Postmortem template: {{xref:IRP-06}} | OPTIONAL
- Change calendar/freeze: {{xref:REL-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Cadence (monthly/quart... | spec         | Yes             |
| Participants/roles (SR... | spec         | Yes             |
| Required inputs (SLO r... | spec         | Yes             |
| Agenda template (what ... | spec         | Yes             |
| Decision rules (when t... | spec         | Yes             |
| Action items tracking ... | spec         | Yes             |
| Escalation rule (budge... | spec         | Yes             |
| Documentation storage ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Executive summary format | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Reviews must produce action items when budgets are unhealthy.
Changes to SLO targets must be documented and approved.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Cadence
cadence: {{cadence.value}}
2. Participants
roles: {{roles.list}}
3. Inputs
inputs: {{inputs.list}}
4. Agenda
agenda: {{agenda.items}}
5. Decisions
adjustment_rule: {{decisions.adjustment_rule}}
approval_rule: {{decisions.approval_rule}} | OPTIONAL
6. Action Items
tracking_rule: {{actions.tracking_rule}}
storage_location: {{actions.storage_location}} | OPTIONAL
7. Escalation
escalation_rule: {{escalate.rule}}
8. Storage
docs_location: {{docs.location}}
9. Telemetry
reviews_held_metric: {{telemetry.reviews_held_metric}}
actions_closed_metric: {{telemetry.actions_closed_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SLO-09}}, {{xref:REL-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define cadence, roles, agenda, and tracking rule.
intermediate: Required. Define decision/approval rules and escalation and telemetry metrics.
advanced: Required. Add exec summary format and stricter governance for SLO target changes
and freezes.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, approval rule, storage location, actions
closed metric, exec summary, open_questions
If any Required Field is UNKNOWN, allow only if:

{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If cadence.value is UNKNOWN → block Completeness Gate.
If roles.list is UNKNOWN → block Completeness Gate.
If agenda.items is UNKNOWN → block Completeness Gate.
If actions.tracking_rule is UNKNOWN → block Completeness Gate.
If telemetry.reviews_held_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
cadence_and_roles_defined == true
agenda_defined == true
tracking_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SLO-09

SLO-09 — Exceptions & Adjustments (temporary changes)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Reviews must produce action items when budgets are unhealthy.**
- **Changes to SLO targets must be documented and approved.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Cadence`
2. `## Participants`
3. `## Inputs`
4. `## Agenda`
5. `## Decisions`
6. `## Action Items`
7. `## Escalation`
8. `## Storage`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:SLO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-09}}, {{xref:REL-09}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
