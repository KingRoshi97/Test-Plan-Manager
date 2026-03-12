# ALRT-07 — Customer Impact Rules (status page, comms)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-07                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring customer impact rules (status page, comms)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Customer Impact Rules (status page, comms) Document                         |

## 2. Purpose

Define the canonical rules for determining customer impact and triggering customer-facing
communications: when to update a status page, what channels are used, what approvals are
required, and how communications map to incident severity and SLAs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Incident communications plan: {{xref:IRP-04}} | OPTIONAL
- Status page/customer updates: {{xref:IRP-05}} | OPTIONAL
- Incident triggers mapping: {{xref:ALRT-06}} | OPTIONAL
- SLA commitments: {{xref:SLO-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Customer impact defini... | spec         | Yes             |
| Severity-to-comms mapp... | spec         | Yes             |
| Status page update tri... | spec         | Yes             |
| Comms channels (email/... | spec         | Yes             |
| Approval roles (who ca... | spec         | Yes             |
| Update cadence during ... | spec         | Yes             |
| Content constraints (n... | spec         | Yes             |
| Post-incident follow-u... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Regional impact rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Comms must be timely and consistent with severity and SLA commitments.
Do not include sensitive security details or internal identifiers in public updates.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Impact Definition
definition: {{impact.definition}}
2. Severity Mapping
mapping: {{sev.mapping}}
3. Status Page Triggers
trigger_rule: {{status.trigger_rule}}
status_page_ref: {{xref:IRP-05}} | OPTIONAL
4. Channels
channels: {{channels.list}}
5. Approvals
approver_roles: {{approve.roles}}
publish_rule: {{approve.publish_rule}} | OPTIONAL
6. Update Cadence
cadence_minutes: {{cadence.minutes}}
cadence_rule: {{cadence.rule}} | OPTIONAL
7. Content Constraints
constraints: {{content.constraints}}
8. Post-Incident
followup_rule: {{post.followup_rule}}
postmortem_ref: {{xref:IRP-06}} | OPTIONAL
9. Telemetry
time_to_first_update_metric: {{telemetry.ttfu_metric}}
updates_sent_metric: {{telemetry.updates_sent_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:ALRT-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IRP-04}}, {{xref:IRP-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define impact definition, trigger rule, channels, cadence.
intermediate: Required. Define severity mapping, approvals, content constraints, telemetry.
advanced: Required. Add regional rules and stricter SLA alignment + templated messaging
constraints.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, status page ref, publish rule, cadence

rule, postmortem ref, optional metrics, regional rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If impact.definition is UNKNOWN → block Completeness Gate.
If status.trigger_rule is UNKNOWN → block Completeness Gate.
If channels.list is UNKNOWN → block Completeness Gate.
If content.constraints is UNKNOWN → block Completeness Gate.
If telemetry.ttfu_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
impact_and_severity_mapping_defined == true
triggers_and_channels_defined == true
content_constraints_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-08

ALRT-08 — Alert Testing & Drills (synthetics, fire drills)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Comms must be timely and consistent with severity and SLA commitments.**
- Do not include sensitive security details or internal identifiers in public updates.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Impact Definition`
2. `## Severity Mapping`
3. `## Status Page Triggers`
4. `## Channels`
5. `## Approvals`
6. `## Update Cadence`
7. `## Content Constraints`
8. `## Post-Incident`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:ALRT-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IRP-04}}, {{xref:IRP-06}} | OPTIONAL**
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
