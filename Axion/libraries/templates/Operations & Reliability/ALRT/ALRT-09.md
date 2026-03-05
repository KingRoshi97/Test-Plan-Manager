# ALRT-09 — Alert Dashboards (what to watch)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ALRT-09                                             |
| Template Type     | Operations / Alerting                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring alert dashboards (what to watch)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Alert Dashboards (what to watch) Document                         |

## 2. Purpose

Define the canonical dashboards used specifically for alert monitoring and oncall: what panels
are required, how they map to alert coverage and SLO burn, and how oncall uses them during
incidents.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Alert catalog: {{xref:ALRT-02}} | OPTIONAL
- SLO reporting: {{xref:SLO-10}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Oncall dashboard regis... | spec         | Yes             |
| dash_id (stable identi... | spec         | Yes             |
| Purpose (alert overvie... | spec         | Yes             |
| Required panels list (... | spec         | Yes             |
| Alert coverage mapping... | spec         | Yes             |
| SLO burn mapping (whic... | spec         | Yes             |
| Ownership (team)          | spec         | Yes             |
| Staleness/review cadence  | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Links/drilldowns | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Oncall dashboards must cover critical alerts and SLO burn indicators.
Dashboards must reference existing alerts/SLOs; do not invent IDs.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_oncall_dashboards: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Dashboards (repeat)
Dashboard
dash_id: {{dash[0].dash_id}}
purpose: {{dash[0].purpose}}
required_panels: {{dash[0].required_panels}}
alert_mapping: {{dash[0].alert_mapping}}
slo_mapping: {{dash[0].slo_mapping}}
owner: {{dash[0].owner}}
review_cadence: {{dash[0].review_cadence}}
telemetry_metric: {{dash[0].telemetry_metric}}
links: {{dash[0].links}} | OPTIONAL
open_questions:
{{dash[0].open_questions[0]}} | OPTIONAL
(Repeat per dashboard.)
3. References
Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
Alert catalog: {{xref:ALRT-02}} | OPTIONAL
SLO reporting: {{xref:SLO-10}} | OPTIONAL
Cross-References
Upstream: {{xref:OBS-07}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IRP-02}}, {{xref:ALRT-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define dashboards with required panels and mappings and owners.
intermediate: Required. Define review cadence and telemetry and coverage mapping.
advanced: Required. Add drilldowns and stricter staleness thresholds + enforcement.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, links, open_questions
If any Required Field is UNKNOWN, allow only if:

{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If dash[].dash_id is UNKNOWN → block Completeness Gate.
If dash[].required_panels is UNKNOWN → block Completeness Gate.
If dash[].alert_mapping is UNKNOWN → block Completeness Gate.
If dash[].owner is UNKNOWN → block Completeness Gate.
If dash[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ALRT
Pass conditions:
required_fields_present == true
dashboard_registry_defined == true
panels_and_mappings_defined == true
ownership_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ALRT-10

ALRT-09 — Alert Dashboards (what to watch)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Oncall dashboards must cover critical alerts and SLO burn indicators.**
- **Dashboards must reference existing alerts/SLOs; do not invent IDs.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Dashboards (repeat)`
3. `## Dashboard`
4. `## open_questions:`
5. `## (Repeat per dashboard.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:OBS-07}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IRP-02}}, {{xref:ALRT-10}} | OPTIONAL**
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
