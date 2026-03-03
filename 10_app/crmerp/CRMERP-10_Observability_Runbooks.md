# CRMERP-10 — Observability & Runbooks (dashboards, alerts, operator steps)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-10 |
| title | Observability & Runbooks (dashboards, alerts, operator steps) |
| type | crmerp_observability_runbooks |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-10_Observability_Runbooks.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["CRMERP-04", "CRMERP-06", "CRMERP-08", "IXS-07"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "CRMERP-01", "CRMERP-04", "CRMERP-06", "CRMERP-08", "IXS-07", "ADMIN-02"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical observability and operator runbooks for CRM/ERP sync: required
dashboards, alerts, triage steps, and operational actions (pause sync, replay, backfill, credential
rotation). This template must be consistent with integration observability and error/reconciliation
policies.

## Inputs Required

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

## Required Fields

- system_id binding
- Dashboard requirements (minimum panels)
- Key metrics list (success/fail, latency, throttles, backlog)
- Alert definitions (failure spike, throttle spike, backlog stuck)
- Alert routing policy (oncall/team)
- Runbook location and structure
- Triage flow (step-by-step)
- Operator actions (pause/resume, replay, backfill, rotate creds)
- User/customer impact policy (if incidents)
- Post-incident review requirements (RCA notes)

## Optional Fields

- Per-object dashboards | OPTIONAL
- SLO definitions | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Alerts must be actionable and map to runbook steps.
- Operator actions must require proper permissions and be auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

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

## Cross-References

Upstream: {{xref:CRMERP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ADMIN-02}}, {{xref:ADMIN-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define dashboards + key metrics + triage steps; use UNKNOWN for SLOs.
intermediate: Required. Define alert routing and operator actions.
advanced: Required. Add per-object dashboards, SLOs, and RCA rigor and comms ownership.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, panel list, optional triage steps, runbook
format, permissions ref, comms owner, rca location, per-object dashboards, SLOs,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dash.minimum_panels is UNKNOWN → block Completeness Gate.
If metrics.list is UNKNOWN → block Completeness Gate.
If triage.steps[0] is UNKNOWN → block Completeness Gate.
If alerts list is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
dashboards_defined == true
alerts_defined == true
triage_and_operator_actions_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
