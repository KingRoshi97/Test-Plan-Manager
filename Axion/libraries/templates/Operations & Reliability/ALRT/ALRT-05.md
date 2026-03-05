# ALRT-05 — Noise Reduction Rules (dedupe, suppression)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-05                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring noise reduction rules (dedupe, suppression)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Noise Reduction Rules (dedupe, suppression) Document                         |

## 2. Purpose

Define the canonical rules that reduce alert noise: deduplication keys, grouping, suppression
during maintenance, escalation dampening, and anti-flap policies. This template ensures
alerting stays actionable.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Alert rule spec: {{xref:ALRT-03}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Sampling/cardinality policy: {{xref:OBS-09}} | OPTIONAL
- Maintenance windows policy: {{xref:REL-07}} | OPTIONAL
- Incident workflow: {{xref:IRP-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Noise control principl... | spec         | Yes             |
| Deduplication rule (de... | spec         | Yes             |
| Grouping rule (by serv... | spec         | Yes             |
| Suppression rules (mai... | spec         | Yes             |
| Anti-flap rule (cooldo... | spec         | Yes             |
| Escalation dampening (... | spec         | Yes             |
| Ticketing conversion r... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |
| Review/tuning cadence     | spec         | Yes             |

## 5. Optional Fields

Auto-silence rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Noise controls must not suppress true sev1 outages; suppression must be scoped and
time-bounded.
Every suppression should have an owner and expiry.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Principles
{{principles[0]}}
{{principles[1]}} | OPTIONAL
2. Deduplication
dedupe_rule: {{dedupe.rule}}
3. Grouping
group_rule: {{group.rule}}
4. Suppression
maintenance_ref: {{xref:REL-07}} | OPTIONAL
suppression_rule: {{suppress.rule}}
expiry_rule: {{suppress.expiry_rule}} | OPTIONAL
5. Anti-Flap
anti_flap_rule: {{flap.rule}}
cooldown_minutes: {{flap.cooldown_minutes}} | OPTIONAL
6. Escalation Dampening
dampening_rule: {{dampen.rule}}
7. Ticketing Conversion
ticket_rule: {{ticket.rule}}
8. Telemetry
pages_per_day_metric: {{telemetry.pages_per_day_metric}}
suppressed_alert_metric: {{telemetry.suppressed_alert_metric}} | OPTIONAL
9. Review Cadence
cadence: {{review.cadence}}
Cross-References
Upstream: {{xref:ALRT-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-10}}, {{xref:IRP-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define dedupe/group/suppression and telemetry.
intermediate: Required. Define anti-flap and dampening and ticketing rule and cadence.
advanced: Required. Add auto-silence and strict sev1 protection constraints and expiry
governance.

Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional principles, expiry rule, cooldown
minutes, optional metric, auto-silence, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dedupe.rule is UNKNOWN → block Completeness Gate.
If suppress.rule is UNKNOWN → block Completeness Gate.
If flap.rule is UNKNOWN → block Completeness Gate.
If telemetry.pages_per_day_metric is UNKNOWN → block Completeness Gate.
If review.cadence is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
noise_controls_defined == true
suppression_and_anti_flap_defined == true
telemetry_defined == true
cadence_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-06

ALRT-06 — Incident Triggers (alert → IRP runbook)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Noise controls must not suppress true sev1 outages; suppression must be scoped and**
- **time-bounded.**
- **Every suppression should have an owner and expiry.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Principles`
2. `## Deduplication`
3. `## Grouping`
4. `## Suppression`
5. `## Anti-Flap`
6. `## Escalation Dampening`
7. `## Ticketing Conversion`
8. `## Telemetry`
9. `## Review Cadence`

## 8. Cross-References

- **Upstream: {{xref:ALRT-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-10}}, {{xref:IRP-08}} | OPTIONAL**
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
