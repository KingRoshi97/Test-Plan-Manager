# ALRT-02 — Alert Catalog (by alert_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-02                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alert catalog (by alert_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alert Catalog (by alert_id) Document                         |

## 2. Purpose

Create the canonical catalog of alerts, indexed by alert_id, including what each alert monitors,
severity, routing, runbook links, and SLO relationships. This catalog is the source of truth for
operational alert coverage.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Endpoint SLO catalog: {{xref:SLO-03}} | OPTIONAL
- Alert routing/ownership: {{xref:OBS-08}} | OPTIONAL
- Incident runbooks index: {{xref:IRP-10}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Alert registry (alert_id list)
alert_id (stable identifier)
Name/summary
Metric(s) used (metric_id refs)
Condition/threshold summary
Severity (sev1/sev2/sev3/UNKNOWN)
Routing target (team/oncall)
Runbook reference
SLO binding (slo_id) | OPTIONAL
Customer impact flag (yes/no/UNKNOWN)
Noise controls (dedupe/suppression)
Owner (team)
Telemetry requirements (alerts fired, ack time)

Optional Fields
Dashboard reference | OPTIONAL
Example alert payload | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Paging alerts must have owners, routing, and runbooks.
Alerts must reference existing metric_ids; do not invent metrics.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_alerts: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Alerts (repeat per alert_id)
Alert
alert_id: {{alerts[0].alert_id}}
name: {{alerts[0].name}}
metrics: {{alerts[0].metrics}}
condition_summary: {{alerts[0].condition_summary}}
severity: {{alerts[0].severity}}
routing: {{alerts[0].routing}}
owner: {{alerts[0].owner}}
runbook_ref: {{alerts[0].runbook_ref}}
slo_binding: {{alerts[0].slo_binding}} | OPTIONAL
customer_impact: {{alerts[0].customer_impact}}
noise_controls: {{alerts[0].noise_controls}}
dashboard_ref: {{alerts[0].dashboard_ref}} | OPTIONAL
example_payload: {{alerts[0].example_payload}} | OPTIONAL
telemetry_metric: {{alerts[0].telemetry_metric}}
ack_time_metric: {{alerts[0].ack_time_metric}} | OPTIONAL
open_questions:
{{alerts[0].open_questions[0]}} | OPTIONAL
(Repeat per alert.)
3. References
Alert rule spec: {{xref:ALRT-03}} | OPTIONAL
Oncall policy: {{xref:ALRT-04}} | OPTIONAL
Noise reduction: {{xref:ALRT-05}} | OPTIONAL
Cross-References
Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:ALRT-03}}, {{xref:IRP-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define alerts with metrics, severity, routing, runbook ref, owner.
intermediate: Required. Define noise controls, customer impact, telemetry metrics.
advanced: Required. Add SLO bindings, dashboard refs, and example payloads + stricter
thresholds docs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, slo binding, dashboard ref,
example payload, ack time metric, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If alerts[].alert_id is UNKNOWN → block Completeness Gate.
If alerts[].metrics is UNKNOWN → block Completeness Gate.
If alerts[].severity is UNKNOWN → block Completeness Gate.
If alerts[].routing is UNKNOWN → block Completeness Gate.
If alerts[].runbook_ref is UNKNOWN → block Completeness Gate.
If alerts[].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
alert_registry_defined == true
metrics_and_conditions_defined == true
ownership_and_runbooks_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-03

ALRT-03 — Alert Rule Spec (condition, threshold, window)
Header Block

## 5. Optional Fields

Dashboard reference | OPTIONAL
Example alert payload | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Paging alerts must have owners, routing, and runbooks.**
- **Alerts must reference existing metric_ids; do not invent metrics.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Alerts (repeat per alert_id)`
3. `## Alert`
4. `## open_questions:`
5. `## (Repeat per alert.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-03}}, {{xref:IRP-02}} | OPTIONAL**
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
