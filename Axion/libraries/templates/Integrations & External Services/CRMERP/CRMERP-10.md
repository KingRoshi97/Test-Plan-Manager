# CRMERP-10 — Observability & Runbooks (dashboards, alerts, operator steps)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-10                                             |
| Template Type     | Integration / CRM & ERP                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability & runbooks (dashboards, alerts, operator steps)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability & Runbooks (dashboards, alerts, operator steps) Document                         |

## 2. Purpose

Define the canonical observability and operator runbooks for CRM/ERP sync: required
dashboards, alerts, triage steps, and operational actions (pause sync, replay, backfill, credential
rotation). This template must be consistent with integration observability and error/reconciliation
policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- CRMERP-04 Scheduling/Triggers: {{crmerp.scheduling}} | OPTIONAL
- CRMERP-06 Rate Limits/Quotas: {{crmerp.limits}} | OPTIONAL
- CRMERP-08 Reconciliation/Backfill: {{crmerp.recon}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

system_id binding
Dashboard requirements (minimum panels)
Key metrics list (success/fail, latency, throttles, backlog)
Alert definitions (failure spike, throttle spike, backlog stuck)
Alert routing policy (oncall/team)
Runbook location and structure
Triage flow (step-by-step)
Operator actions (pause/resume, replay, backfill, rotate creds)
User/customer impact policy (if incidents)
Post-incident review requirements (RCA notes)

Optional Fields
Per-object dashboards | OPTIONAL
SLO definitions | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Alerts must be actionable and map to runbook steps.
Operator actions must require proper permissions and be auditable.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Dashboards
system_id: {{meta.system_id}}
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
4. Runbook Location
runbook_location: {{runbook.location}}
format: {{runbook.format}} (md/wiki/UNKNOWN) | OPTIONAL
5. Triage Flow
steps:
{{triage.steps[0]}}
{{triage.steps[1]}}
{{triage.steps[2]}} | OPTIONAL
6. Operator Actions
actions:
{{ops.actions[0]}}
{{ops.actions[1]}} | OPTIONAL
permissions_ref: {{ops.permissions_ref}} (expected: {{xref:API-04}}/{{xref:ADMIN-01}}) |
OPTIONAL

7. Impact & Comms
user_impact_policy: {{impact.user_impact_policy}}
comms_owner: {{impact.comms_owner}} | OPTIONAL
8. Post-Incident
rca_required: {{post.rca_required}}
rca_location: {{post.rca_location}} | OPTIONAL
9. References
Integration observability baseline: {{xref:IXS-07}} | OPTIONAL
Scheduling: {{xref:CRMERP-04}} | OPTIONAL
Rate limits: {{xref:CRMERP-06}} | OPTIONAL
Reconciliation/backfill: {{xref:CRMERP-08}} | OPTIONAL
Support tools: {{xref:ADMIN-02}} | OPTIONAL
Cross-References
Upstream: {{xref:CRMERP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-02}}, {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define dashboards + key metrics + triage steps; use UNKNOWN for SLOs.
intermediate: Required. Define alert routing and operator actions.
advanced: Required. Add per-object dashboards, SLOs, and RCA rigor and comms ownership.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, panel list, optional triage steps, runbook
format, permissions ref, comms owner, rca location, per-object dashboards, SLOs,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dash.minimum_panels is UNKNOWN → block Completeness Gate.
If metrics.list is UNKNOWN → block Completeness Gate.
If triage.steps[0] is UNKNOWN → block Completeness Gate.
If alerts list is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
dashboards_defined == true
alerts_defined == true
triage_and_operator_actions_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Webhooks Consumers & Providers
(WHCP)

Webhooks Consumers & Providers (WHCP)
WHCP-01 Webhook Event Catalog (by webhook_id/event_id)
WHCP-02 Outbound Webhook Producer Spec (signing, retries, dedupe)
WHCP-03 Inbound Webhook Consumer Spec (verification, idempotency)
WHCP-04 Delivery Semantics (ordering, replay, backoff)
WHCP-05 Security Rules (signatures, secrets rotation, allowlists)
WHCP-06 Endpoint Registration & Management (subscriptions, secrets)
WHCP-07 Error Handling (DLQ, quarantine, manual replay)
WHCP-08 Observability (delivery rate, latency, failures)
WHCP-09 Payload Versioning & Compatibility (schema evolution)
WHCP-10 Testing & Sandbox Strategy (test hooks, simulators)

WHCP-01

WHCP-01 — Webhook Event Catalog (by webhook_id/event_id)
Header Block

## 5. Optional Fields

Per-object dashboards | OPTIONAL
SLO definitions | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Alerts must be actionable and map to runbook steps.**
- **Operator actions must require proper permissions and be auditable.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Dashboards`
2. `## Key Metrics`
3. `## Alerts`
4. `## Alert`
5. `## (Repeat per alert.)`
6. `## Runbook Location`
7. `## Triage Flow`
8. `## steps:`
9. `## Operator Actions`
10. `## actions:`

## 8. Cross-References

- **Upstream: {{xref:CRMERP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ADMIN-02}}, {{xref:ADMIN-06}} | OPTIONAL**
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
