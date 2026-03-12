# NOTIF-10 — Observability & Support Runbooks (delivery metrics, alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | NOTIF-10                                             |
| Template Type     | Integration / Notifications                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability & support runbooks (delivery metrics, alerts)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability & Support Runbooks (delivery metrics, alerts) Document                         |

## 2. Purpose

Define the canonical observability and support runbooks for notifications: dashboards, alerts,
triage flows, and operator actions for delivery issues (throttling, bounces, provider outages, DLQ
backlogs). This template must be consistent with send/deliverability/failure policies and
integration observability.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- NOTIF-01 Channel Inventory: {{notif.channels}}
- NOTIF-02 Provider Inventory: {{notif.providers}} | OPTIONAL
- NOTIF-04 Send Policy: {{notif.send_policy}} | OPTIONAL
- NOTIF-05 Deliverability Rules: {{notif.deliverability}} | OPTIONAL
- NOTIF-09 Failure Handling: {{notif.failures}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- ADMIN-02 Support Tools: {{admin.support_tools}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Dashboards minimum panels (by channel/provider)
Key metrics list (send, delivered, bounced, suppressed, dlq depth)
Alert definitions (delivery drop, bounce spike, dlq stuck, provider outage)
Alert routing policy (oncall/support)
Runbook location and format
Triage flows (by incident type)
Operator actions (pause sends, rotate creds, clear suppression)
Permissioning requirements for actions
Customer comms triggers (when to notify users)
Post-incident review requirements

Optional Fields
SLOs per channel | OPTIONAL
Auto-mitigation rules (switch provider) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Alerts must be actionable and reference triage steps.
Operator actions must be permissioned and auditable.
Dashboards must avoid PII; use aggregates/hashes only.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Dashboards
dashboard_name: {{dash.name}}
minimum_panels: {{dash.minimum_panels}}
panel_list: {{dash.panel_list}} | OPTIONAL
2. Key Metrics
metrics: {{metrics.list}}
3. Alerts
Alert
alert_id: {{alerts[0].alert_id}}
condition: {{alerts[0].condition}}
severity: {{alerts[0].severity}} (low/med/high/UNKNOWN)
routing: {{alerts[0].routing}}
runbook_ref: {{alerts[0].runbook_ref}} | OPTIONAL
(Repeat per alert.)
4. Runbooks
runbook_location: {{runbooks.location}}
format: {{runbooks.format}} (md/wiki/UNKNOWN) | OPTIONAL
5. Triage Flows
Flow
incident_type: {{triage[0].incident_type}}
steps:
{{triage[0].steps[0]}}
{{triage[0].steps[1]}} | OPTIONAL
primary_tools: {{triage[0].primary_tools}} | OPTIONAL
(Repeat per incident type.)
6. Operator Actions
actions: {{ops.actions}}

permissions_ref: {{ops.permissions_ref}} (expected: {{xref:API-04}}/{{xref:ADMIN-01}}) |
OPTIONAL
7. Customer Comms
notify_users_when: {{comms.notify_users_when}}
comms_owner: {{comms.owner}} | OPTIONAL
8. Post-Incident
rca_required: {{post.rca_required}}
rca_location: {{post.rca_location}} | OPTIONAL
9. References
Send policy: {{xref:NOTIF-04}} | OPTIONAL
Deliverability: {{xref:NOTIF-05}} | OPTIONAL
Failure handling: {{xref:NOTIF-09}} | OPTIONAL
Preference center: {{xref:NOTIF-06}} | OPTIONAL
Provider inventory: {{xref:NOTIF-02}} | OPTIONAL
Support tools: {{xref:ADMIN-02}} | OPTIONAL
Cross-References
Upstream: {{xref:NOTIF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define dashboards + key metrics + one triage flow.
intermediate: Required. Define alerts, routing, operator actions, and comms triggers.
advanced: Required. Add SLOs and auto-mitigation and incident-type triage rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, panel list, optional tools, runbook format,
permissions ref, comms owner, rca location, slos, auto-mitigation, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dash.minimum_panels is UNKNOWN → block Completeness Gate.
If metrics.list is UNKNOWN → block Completeness Gate.
If alerts list is UNKNOWN → block Completeness Gate.
If triage[0].steps[0] is UNKNOWN → block Completeness Gate.
If post.rca_required is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.NOTIF
Pass conditions:
required_fields_present == true
dashboards_and_alerts_defined == true
triage_and_actions_defined == true
comms_and_post_incident_defined == true

placeholder_resolution == true
no_unapproved_unknowns == true

Files/Media & Storage (FMS)

FMS-01

FMS-01 — Storage Provider Inventory (by provider_id/bucket_id)
Header Block

## 5. Optional Fields

SLOs per channel | OPTIONAL
Auto-mitigation rules (switch provider) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Alerts must be actionable and reference triage steps.**
- **Operator actions must be permissioned and auditable.**
- **Dashboards must avoid PII; use aggregates/hashes only.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Dashboards`
2. `## Key Metrics`
3. `## Alerts`
4. `## Alert`
5. `## (Repeat per alert.)`
6. `## Runbooks`
7. `## Triage Flows`
8. `## Flow`
9. `## steps:`
10. `## (Repeat per incident type.)`

## 8. Cross-References

- **Upstream: {{xref:NOTIF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-06}} | OPTIONAL**
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
