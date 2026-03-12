# ALRT-06 — Incident Triggers (alert → IRP runbook)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-06                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring incident triggers (alert → irp runbook)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Incident Triggers (alert → IRP runbook) Document                         |

## 2. Purpose

Define the canonical mapping between alerts and incident response: which alerts automatically
trigger incident declaration, which runbooks to follow, and what metadata is required to start
incident management quickly and consistently.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Incident workflow: {{xref:IRP-02}} | OPTIONAL
- Incident severity model: {{xref:IRP-01}} | OPTIONAL
- Incident runbooks index: {{xref:IRP-10}} | OPTIONAL
- SLO burn alerts: {{xref:SLO-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Trigger registry (trigger_id list)
trigger_id (stable identifier)
Alert binding (alert_id list)
Default incident severity mapping (sev)
Runbook reference (IRP runbook_id)
Auto-declare rule (yes/no/UNKNOWN)
Escalation rule (who to page)
Customer impact comms rule (when to update status)
Verification/ack rule (when trigger considered resolved)
Telemetry requirements (incidents created, false triggers)

Optional Fields
Automation hook (create incident ticket) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Sev1/Sev2 incident triggers must have explicit runbooks and comms rules.
Do not invent alert_ids; reference ALRT-02.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_triggers: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Triggers (repeat)
Trigger
trigger_id: {{triggers[0].trigger_id}}
alert_ids: {{triggers[0].alert_ids}}
severity: {{triggers[0].severity}}
runbook_ref: {{triggers[0].runbook_ref}}
auto_declare: {{triggers[0].auto_declare}}
escalation_rule: {{triggers[0].escalation_rule}}
customer_comms_rule: {{triggers[0].customer_comms_rule}}
resolve_rule: {{triggers[0].resolve_rule}}
telemetry_metric: {{triggers[0].telemetry_metric}}
false_trigger_metric: {{triggers[0].false_trigger_metric}} | OPTIONAL
automation_hook: {{triggers[0].automation_hook}} | OPTIONAL
open_questions:
{{triggers[0].open_questions[0]}} | OPTIONAL
(Repeat per trigger.)
3. References
Alert catalog: {{xref:ALRT-02}} | OPTIONAL
Incident workflow: {{xref:IRP-02}} | OPTIONAL
Status page rules: {{xref:IRP-05}} | OPTIONAL
Cross-References
Upstream: {{xref:ALRT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IRP-02}}, {{xref:IRP-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define triggers with alert bindings, severity, runbook ref, resolve rule.

intermediate: Required. Define comms rules, escalation rule, telemetry metrics.
advanced: Required. Add automation hooks and strict false-trigger tracking + review process.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, false trigger metric, automation
hook, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If triggers[].trigger_id is UNKNOWN → block Completeness Gate.
If triggers[].alert_ids is UNKNOWN → block Completeness Gate.
If triggers[].runbook_ref is UNKNOWN → block Completeness Gate.
If triggers[].resolve_rule is UNKNOWN → block Completeness Gate.
If triggers[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
trigger_registry_defined == true
alert_bindings_defined == true
runbooks_defined == true
comms_and_resolution_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-07

ALRT-07 — Customer Impact Rules (status page, comms)
Header Block

## 5. Optional Fields

Automation hook (create incident ticket) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Sev1/Sev2 incident triggers must have explicit runbooks and comms rules.**
- Do not invent alert_ids; reference ALRT-02.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Triggers (repeat)`
3. `## Trigger`
4. `## open_questions:`
5. `## (Repeat per trigger.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:ALRT-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IRP-02}}, {{xref:IRP-06}} | OPTIONAL**
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
