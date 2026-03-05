# ANL-07 — Funnels & KPIs Definition (by kpi_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ANL-07                                             |
| Template Type     | Operations / Analytics                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring funnels & kpis definition (by kpi_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Funnels & KPIs Definition (by kpi_id) Document                         |

## 2. Purpose

Define the canonical set of funnels and KPIs for the product, indexed by kpi_id, including
definitions, event mappings, segmentation rules, and ownership. This template is the bridge
between product goals and analytics events.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Product overview: {{xref:PRD-01}} | OPTIONAL
- Event taxonomy: {{xref:ANL-02}} | OPTIONAL
- Identity model: {{xref:ANL-04}} | OPTIONAL
- Data quality rules: {{xref:ANL-06}} | OPTIONAL
- Metrics catalog (for hybrid KPIs): {{xref:OBS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

KPI registry (kpi_id list)
kpi_id (stable identifier)
Name/description
Type (kpi/funnel/guardrail)
Definition (exact formula)
Event mapping (event_name list)
Inclusion/exclusion rules
Segmentation dimensions (allowed only)
Reporting cadence (daily/weekly/UNKNOWN)
Owner (team/role)
Data quality dependency (ANL-06 refs)
Telemetry requirements (kpi freshness, missing data)

Optional Fields
Target/goal value | OPTIONAL
Dashboard reference | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-OBS-CARDINALITY]}} | OPTIONAL
KPIs must reference existing events from ANL-02; do not invent event names.
Segmentation must use allowed dimensions and respect privacy constraints.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_kpis: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. KPIs (repeat per kpi_id)
KPI
kpi_id: {{kpis[0].kpi_id}}
name: {{kpis[0].name}}
type: {{kpis[0].type}}
definition: {{kpis[0].definition}}
event_mapping: {{kpis[0].event_mapping}}
rules: {{kpis[0].rules}}
segments: {{kpis[0].segments}}
cadence: {{kpis[0].cadence}}
owner: {{kpis[0].owner}}
data_quality_refs: {{kpis[0].data_quality_refs}}
target_value: {{kpis[0].target_value}} | OPTIONAL
dashboard_ref: {{kpis[0].dashboard_ref}} | OPTIONAL
telemetry_metric: {{kpis[0].telemetry_metric}}
open_questions:
{{kpis[0].open_questions[0]}} | OPTIONAL
(Repeat per KPI.)
3. References
Event taxonomy: {{xref:ANL-02}} | OPTIONAL
Data quality: {{xref:ANL-06}} | OPTIONAL
Access controls: {{xref:ANL-10}} | OPTIONAL
Cross-References
Upstream: {{xref:ANL-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:ANL-10}}, {{xref:ANL-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define KPI list and event mappings and owners and cadence.
intermediate: Required. Define formulas and segmentation and data quality refs and telemetry.
advanced: Required. Add targets and dashboard links and strict inclusion/exclusion rules +
freshness SLAs.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, target value, dashboard ref,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If kpis[].kpi_id is UNKNOWN → block Completeness Gate.
If kpis[].definition is UNKNOWN → block Completeness Gate.
If kpis[].event_mapping is UNKNOWN → block Completeness Gate.
If kpis[].owner is UNKNOWN → block Completeness Gate.
If kpis[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.ANL
Pass conditions:
required_fields_present == true
kpi_registry_defined == true
event_mappings_defined == true
definitions_defined == true
ownership_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

ANL-08

ANL-08 — Experimentation Support (flags/assignments)
Header Block

## 5. Optional Fields

Target/goal value | OPTIONAL
Dashboard reference | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-OBS-CARDINALITY]}} | OPTIONAL
- **KPIs must reference existing events from ANL-02; do not invent event names.**
- **Segmentation must use allowed dimensions and respect privacy constraints.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## KPIs (repeat per kpi_id)`
3. `## KPI`
4. `## open_questions:`
5. `## (Repeat per KPI.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:ANL-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:ANL-10}}, {{xref:ANL-08}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define KPI list and event mappings and owners and cadence.**
- **intermediate: Required. Define formulas and segmentation and data quality refs and telemetry.**
- **advanced: Required. Add targets and dashboard links and strict inclusion/exclusion rules +**
- freshness SLAs.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, target value, dashboard ref,**
- open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If kpis[].kpi_id is UNKNOWN → block

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
