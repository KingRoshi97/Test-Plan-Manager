# SLO-10 — Reporting (dashboards, exec summaries)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SLO-10                                             |
| Template Type     | Operations / SLOs & Reliability                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring reporting (dashboards, exec summaries)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Reporting (dashboards, exec summaries) Document                         |

## 2. Purpose

Define the canonical reporting outputs for SLOs/error budgets: dashboards, periodic reports,
and executive summaries, including what is included, cadence, and distribution. This template
makes reliability visible and actionable.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Endpoint SLO catalog: {{xref:SLO-03}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Alert dashboards: {{xref:ALRT-09}} | OPTIONAL
- Error budget policy: {{xref:SLO-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Report types (dashboar... | spec         | Yes             |
| Cadence per report type   | spec         | Yes             |
| Audience/distribution ... | spec         | Yes             |
| Required contents (SLO... | spec         | Yes             |
| Dashboard references (... | spec         | Yes             |
| Exec summary format rules | spec         | Yes             |
| Action items section r... | spec         | Yes             |
| Ownership (who publishes) | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Customer-facing reporting rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Reports must be based on measured data and link to dashboards.
When budgets are unhealthy, reports must include action items and owners.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Report Types
types: {{report.types}}
2. Cadence
cadence: {{report.cadence}}
3. Audience
audience: {{audience.list}}
4. Contents
required_sections: {{content.sections}}
5. Dashboards
dashboard_ids: {{dashboards.ids}}
6. Exec Summary
format_rule: {{exec.format_rule}}
template: {{exec.template}} | OPTIONAL
7. Actions
action_section_rule: {{actions.rule}}
8. Ownership
owner: {{owner.team}}
9. Telemetry
reports_published_metric: {{telemetry.published_metric}}
missed_cadence_metric: {{telemetry.missed_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SLO-08}}, {{xref:REL-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define report types, cadence, required contents, owner.
intermediate: Required. Define exec summary format, dashboard refs, telemetry.
advanced: Required. Add customer-facing rules and strict distribution + accountability practices.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, exec template, missed metric,
customer-facing rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If report.types is UNKNOWN → block Completeness Gate.

If report.cadence is UNKNOWN → block Completeness Gate.
If content.sections is UNKNOWN → block Completeness Gate.
If dashboards.ids is UNKNOWN → block Completeness Gate.
If telemetry.published_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SLO
Pass conditions:
required_fields_present == true
reporting_defined == true
cadence_and_audience_defined == true
dashboard_linkage_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Performance & Scalability (PERF)

PERF-01

PERF-01 — Performance Overview (targets, constraints)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Reports must be based on measured data and link to dashboards.**
- **When budgets are unhealthy, reports must include action items and owners.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Report Types`
2. `## Cadence`
3. `## Audience`
4. `## Contents`
5. `## Dashboards`
6. `## Exec Summary`
7. `## Actions`
8. `## Ownership`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:SLO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SLO-08}}, {{xref:REL-09}} | OPTIONAL**
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
