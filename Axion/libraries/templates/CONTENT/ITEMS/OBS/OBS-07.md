# OBS-07 — Dashboards Inventory (by dashboard_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-07                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring dashboards inventory (by dashboard_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Dashboards Inventory (by dashboard_id) Document                         |

## 2. Purpose

Create the canonical inventory of operational dashboards, indexed by dashboard_id, including
what each dashboard is for, required panels, owners, and linked alerts/SLOs. This template
ensures dashboard coverage and reduces “tribal knowledge” during incidents.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Latency budgets: {{xref:PERF-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Dashboard registry (dashboard_id list)
dashboard_id (stable identifier)
Dashboard name
Purpose (what questions it answers)
Primary audience (oncall/dev/product)
Panels list (panel_id/name + metric refs)
Required filters (env, service)
Owner (team/role)
SLO bindings (slo_id list)
Alert bindings (alert_id list)
Link to runbooks (IRP/DOC refs)
Telemetry requirements (dashboard usage/staleness)

Optional Fields
Screenshot link/pointer | OPTIONAL
Drill-down links (to traces/logs) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-OBS-CARDINALITY]}} | OPTIONAL
Dashboards must reference existing metric_ids (OBS-03) and not invent metrics.
Each SLO-critical service must have at least one primary dashboard.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_dashboards: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Dashboards (repeat per dashboard_id)
Dashboard
dashboard_id: {{dashboards[0].dashboard_id}}
name: {{dashboards[0].name}}
purpose: {{dashboards[0].purpose}}
audience: {{dashboards[0].audience}}
required_filters: {{dashboards[0].required_filters}}
panels: {{dashboards[0].panels}}
owner: {{dashboards[0].owner}}
slo_bindings: {{dashboards[0].slo_bindings}}
alert_bindings: {{dashboards[0].alert_bindings}} | OPTIONAL
runbook_refs: {{dashboards[0].runbook_refs}} | OPTIONAL
screenshot_ref: {{dashboards[0].screenshot_ref}} | OPTIONAL
drilldowns: {{dashboards[0].drilldowns}} | OPTIONAL
telemetry_metric: {{dashboards[0].telemetry_metric}}
open_questions:
{{dashboards[0].open_questions[0]}} | OPTIONAL
(Repeat per dashboard.)
3. References
Metrics catalog: {{xref:OBS-03}} | OPTIONAL
Alerting: {{xref:ALRT-02}} | OPTIONAL
Incident runbooks: {{xref:IRP-10}} | OPTIONAL
Cross-References
Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-09}}, {{xref:SLO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define dashboards with panels and owners and required filters.
intermediate: Required. Add SLO bindings, alert bindings, and runbook refs.
advanced: Required. Add drilldowns, usage/staleness telemetry, and strict metric_id traceability.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, alert bindings, runbook refs,
screenshot ref, drilldowns, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dashboards[].dashboard_id is UNKNOWN → block Completeness Gate.
If dashboards[].panels is UNKNOWN → block Completeness Gate.
If dashboards[].owner is UNKNOWN → block Completeness Gate.
If dashboards[].slo_bindings is UNKNOWN → block Completeness Gate.
If dashboards[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OBS
Pass conditions:
required_fields_present == true
dashboard_registry_defined == true
panels_and_filters_defined == true
ownership_defined == true
slo_linkage_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OBS-08

OBS-08 — Alert Routing & Ownership (teams, oncall, escalation)
Header Block

## 5. Optional Fields

Screenshot link/pointer | OPTIONAL
Drill-down links (to traces/logs) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-OBS-CARDINALITY]}} | OPTIONAL
- **Dashboards must reference existing metric_ids (OBS-03) and not invent metrics.**
- Each SLO-critical service must have at least one primary dashboard.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Dashboards (repeat per dashboard_id)`
3. `## Dashboard`
4. `## open_questions:`
5. `## (Repeat per dashboard.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:OBS-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-09}}, {{xref:SLO-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define dashboards with panels and owners and required filters.**
- **intermediate: Required. Add SLO bindings, alert bindings, and runbook refs.**
- **advanced: Required. Add drilldowns, usage/staleness telemetry, and strict metric_id traceability.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, alert bindings, runbook refs,**
- screenshot ref, drilldowns, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If dashboards[].dashboard_id is UNKNOWN → block

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
