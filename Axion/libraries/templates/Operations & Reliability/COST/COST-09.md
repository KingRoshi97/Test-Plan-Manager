# COST-09 — Cost Reporting (dashboards, cadence)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-09                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cost reporting (dashboards, cadence)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Cost Reporting (dashboards, cadence) Document                         |

## 2. Purpose

Define the canonical cost reporting outputs: dashboards, periodic reports, and what dimensions
are required (team/service/tenant). This template makes cost visible and actionable and
supports budget governance.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost model overview: {{xref:COST-01}} | OPTIONAL
- Attribution tags standard: {{xref:COST-08}} | OPTIONAL
- Budgets/alerts: {{xref:COST-04}} | OPTIONAL
- Cost drivers catalog: {{xref:COST-02}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Report types (dashboar... | spec         | Yes             |
| Cadence per report type   | spec         | Yes             |
| Audience/distribution     | spec         | Yes             |
| Required dimensions (t... | spec         | Yes             |
| Dashboard references (... | spec         | Yes             |
| Alert linkage (budget ... | spec         | Yes             |
| Action items rule (wha... | spec         | Yes             |
| Ownership (who publishes) | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Executive summary format | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Reporting must align to tag schema; if tags missing, report must show coverage gaps.
Reports must be tied to action rules (opt backlog, budget actions).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Report Types
types: {{report.types}}
2. Cadence
cadence: {{report.cadence}}
3. Audience
audience: {{audience.list}}
4. Dimensions
dimensions: {{dims.list}}
5. Dashboards
dashboard_ids: {{dashboards.ids}}
6. Alerts & Actions
budget_alert_ref: {{xref:COST-04}} | OPTIONAL
action_rule: {{actions.rule}}
7. Ownership
owner: {{owner.team}}
8. Telemetry
reports_published_metric: {{telemetry.published_metric}}
late_report_metric: {{telemetry.late_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:COST-08}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-06}}, {{xref:COST-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define types, cadence, dims, dashboards, owner.
intermediate: Required. Define action rule and telemetry metrics.
advanced: Required. Add exec summary format and strict coverage gap reporting +
accountability.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, exec summary, optional metric,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If report.types is UNKNOWN → block Completeness Gate.
If report.cadence is UNKNOWN → block Completeness Gate.

If dims.list is UNKNOWN → block Completeness Gate.
If dashboards.ids is UNKNOWN → block Completeness Gate.
If telemetry.published_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
reporting_defined == true
cadence_and_dimensions_defined == true
dashboard_linkage_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-10

COST-10 — Incident Cost Review (post-incident spend)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Reporting must align to tag schema; if tags missing, report must show coverage gaps.**
- **Reports must be tied to action rules (opt backlog, budget actions).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Report Types`
2. `## Cadence`
3. `## Audience`
4. `## Dimensions`
5. `## Dashboards`
6. `## Alerts & Actions`
7. `## Ownership`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:COST-08}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-06}}, {{xref:COST-10}} | OPTIONAL**
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
