# ALRT-04 — Oncall & Escalation Policy (rota, paging)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-04                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring oncall & escalation policy (rota, paging)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Oncall & Escalation Policy (rota, paging) Document                         |

## 2. Purpose

Define the canonical oncall and escalation policy: how paging works, escalation ladders,
coverage expectations, and handoff rules. This template standardizes “who gets paged” and ties
alert routing to incident roles.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Incident roles/responsibilities: {{xref:IRP-03}} | OPTIONAL
- Alert routing/ownership: {{xref:OBS-08}} | OPTIONAL
- Alerting overview: {{xref:ALRT-01}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Coverage model (24/7 v... | spec         | Yes             |
| Primary/secondary esca... | spec         | Yes             |
| Paging channels (phone... | spec         | Yes             |
| Ack expectations (time... | spec         | Yes             |
| Escalation timing rule... | spec         | Yes             |
| Handoff rules (shift c... | spec         | Yes             |
| Backup roles (manager/... | spec         | Yes             |
| Incident commander ass... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Change control rule (w... | spec         | Yes             |

## 5. Optional Fields

Follow-the-sun policy | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Paging must have a primary owner and a backup path; no dead-ends.
Ack expectations should map to severity (sev1 faster).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Coverage
coverage: {{coverage.model}}
hours: {{coverage.hours}} | OPTIONAL
2. Ladders
primary_ladder: {{ladder.primary}}
secondary_ladder: {{ladder.secondary}} | OPTIONAL
3. Paging Channels
channels: {{channels.list}}
4. Ack / Escalation Timing
ack_sla_minutes: {{timing.ack_sla_minutes}}
escalation_steps: {{timing.escalation_steps}}
5. Handoff
handoff_rule: {{handoff.rule}}
shift_change_rule: {{handoff.shift_change_rule}} | OPTIONAL
6. IC Assignment
ic_rule: {{ic.rule}}
7. Telemetry
ack_time_metric: {{telemetry.ack_time_metric}}
missed_page_metric: {{telemetry.missed_page_metric}} | OPTIONAL
8. Change Control
who_can_edit_schedules: {{change.who_can_edit_schedules}}
approval_rule: {{change.approval_rule}} | OPTIONAL
Cross-References
Upstream: {{xref:IRP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:OBS-08}}, {{xref:IRP-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define coverage model, ladders, ack SLA, and IC rule.
intermediate: Required. Define escalation steps, handoff rules, telemetry metrics.
advanced: Required. Add follow-the-sun and strict schedule change governance and
severity-based ack mapping.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, hours, secondary ladder, shift change
rule, approval rule, optional metrics, follow-the-sun, open_questions

If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If coverage.model is UNKNOWN → block Completeness Gate.
If ladder.primary is UNKNOWN → block Completeness Gate.
If timing.ack_sla_minutes is UNKNOWN → block Completeness Gate.
If timing.escalation_steps is UNKNOWN → block Completeness Gate.
If ic.rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
coverage_and_ladders_defined == true
timing_defined == true
handoff_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-05

ALRT-05 — Noise Reduction Rules (dedupe, suppression)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Paging must have a primary owner and a backup path; no dead-ends.**
- **Ack expectations should map to severity (sev1 faster).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Coverage`
2. `## Ladders`
3. `## Paging Channels`
4. `## Ack / Escalation Timing`
5. `## Handoff`
6. `## IC Assignment`
7. `## Telemetry`
8. `## Change Control`

## 8. Cross-References

- **Upstream: {{xref:IRP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:OBS-08}}, {{xref:IRP-02}} | OPTIONAL**
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
