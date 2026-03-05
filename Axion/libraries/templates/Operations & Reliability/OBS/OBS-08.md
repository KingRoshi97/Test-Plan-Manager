# OBS-08 — Alert Routing & Ownership (teams, oncall, escalation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OBS-08                                             |
| Template Type     | Operations / Observability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alert routing & ownership (teams, oncall, escalation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alert Routing & Ownership (teams, oncall, escalation) Document                         |

## 2. Purpose

Define the canonical routing and ownership model for operational alerts: which teams own
which alerts/services, paging/escalation behavior, and how ownership is maintained. This
template reduces misrouted pages and improves incident response speed.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- Oncall/escalation policy: {{xref:ALRT-04}} | OPTIONAL
- Incident roles & responsibilities: {{xref:IRP-03}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Ownership model (servi... | spec         | Yes             |
| Team registry (team_id... | spec         | Yes             |
| Oncall targets (pager ... | spec         | Yes             |
| Routing rules (alert_i... | spec         | Yes             |
| Escalation ladder (pri... | spec         | Yes             |
| Handoff rules (when to... | spec         | Yes             |
| Coverage expectations ... | spec         | Yes             |
| Runbook linkage rule (... | spec         | Yes             |
| Maintenance/change con... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Follow-the-sun notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Every paging alert must have an owning team and an escalation path.
Routing changes must be audited or recorded.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Ownership Model
model: {{own.model}}
definitions: {{own.definitions}} | OPTIONAL
2. Teams
teams: {{teams.list}}
3. Oncall Targets
targets: {{oncall.targets}}
4. Routing
routes:
alert_id: {{routes[0].alert_id}}
team_id: {{routes[0].team_id}}
oncall_target: {{routes[0].oncall_target}} | OPTIONAL
coverage: {{routes[0].coverage}} | OPTIONAL
(Repeat per route.)
5. Escalation
ladder: {{escalation.ladder}}
handoff_rule: {{escalation.handoff_rule}} | OPTIONAL
6. Runbooks
runbook_link_rule: {{runbooks.link_rule}}
runbook_index_ref: {{xref:IRP-10}} | OPTIONAL
7. Change Control
who_can_edit: {{change.who_can_edit}}
approval_rule: {{change.approval_rule}} | OPTIONAL
8. Telemetry
misroute_metric: {{telemetry.misroute_metric}}
ack_time_metric: {{telemetry.ack_time_metric}} | OPTIONAL
9. References
Alert catalog: {{xref:ALRT-02}} | OPTIONAL
Escalation policy: {{xref:ALRT-04}} | OPTIONAL
Incident roles: {{xref:IRP-03}} | OPTIONAL
Cross-References
Upstream: {{xref:ALRT-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ALRT-02}}, {{xref:IRP-02}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define teams, routing rules, and escalation ladder.
intermediate: Required. Define coverage expectations and change control and telemetry.
advanced: Required. Add follow-the-sun and strict audit/change governance and handoff rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, oncall target, coverage,
handoff rule, approval rule, optional metrics, follow-the-sun, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If teams.list is UNKNOWN → block Completeness Gate.
If routes[].alert_id or routes[].team_id is UNKNOWN → block Completeness Gate.
If escalation.ladder is UNKNOWN → block Completeness Gate.
If runbooks.link_rule is UNKNOWN → block Completeness Gate.
If telemetry.misroute_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.OBS
Pass conditions:
required_fields_present == true
teams_and_routes_defined == true
escalation_defined == true
runbook_linkage_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

OBS-09

OBS-09 — Sampling & Cardinality Policy (limits, hashing, budgets)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Every paging alert must have an owning team and an escalation path.**
- **Routing changes must be audited or recorded.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Ownership Model`
2. `## Teams`
3. `## Oncall Targets`
4. `## Routing`
5. `## routes:`
6. `## (Repeat per route.)`
7. `## Escalation`
8. `## Runbooks`
9. `## Change Control`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:ALRT-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ALRT-02}}, {{xref:IRP-02}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define teams, routing rules, and escalation ladder.**
- **intermediate: Required. Define coverage expectations and change control and telemetry.**
- **advanced: Required. Add follow-the-sun and strict audit/change governance and handoff rigor.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, oncall target, coverage,**
- handoff rule, approval rule, optional metrics, follow-the-sun, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If teams.list is UNKNOWN → block

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
