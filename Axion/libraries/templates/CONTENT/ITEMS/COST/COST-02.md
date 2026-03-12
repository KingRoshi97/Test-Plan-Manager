# COST-02 — Cost Drivers Catalog (compute, storage, egress)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-02                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cost drivers catalog (compute, storage, egress)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Cost Drivers Catalog (compute, storage, egress) Document                         |

## 2. Purpose

Create the canonical catalog of cost drivers, indexed by driver_id, including what the driver is,
what controls it, and which telemetry tracks it. This catalog supports budgeting, forecasting, and
optimization work.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost model overview: {{xref:COST-01}} | OPTIONAL
- Compute baseline: {{xref:IAC-06}} | OPTIONAL
- Data baseline (storage): {{xref:IAC-07}} | OPTIONAL
- Log routing/storage: {{xref:LTS-05}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Driver registry (driver_id list)
driver_id (stable identifier)
Driver name/category (compute/storage/egress/vendor)
What creates the cost (usage description)
Primary levers (scale down, cache, compress)
Owner (team/finops)
Telemetry metric refs (metric_id list)
Budget linkage (COST-04)
Optimization candidates (common fixes)
Telemetry requirements (driver cost anomalies)

Optional Fields
Provider SKU references | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Drivers should be attributable (tags/accounts) and connected to measurable telemetry.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_drivers: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Drivers (repeat)
Driver
driver_id: {{drivers[0].driver_id}}
name: {{drivers[0].name}}
category: {{drivers[0].category}}
usage_description: {{drivers[0].usage_description}}
levers: {{drivers[0].levers}}
owner: {{drivers[0].owner}}
metric_ids: {{drivers[0].metric_ids}}
budget_ref: {{xref:COST-04}} | OPTIONAL
optimization_candidates: {{drivers[0].optimization_candidates}}
anomaly_metric: {{drivers[0].anomaly_metric}}
sku_refs: {{drivers[0].sku_refs}} | OPTIONAL
open_questions:
{{drivers[0].open_questions[0]}} | OPTIONAL
(Repeat per driver.)
3. References
Forecast: {{xref:COST-03}} | OPTIONAL
Reporting: {{xref:COST-09}} | OPTIONAL
Cross-References
Upstream: {{xref:COST-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-04}}, {{xref:COST-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define driver registry, category, usage description, levers, owner.
intermediate: Required. Define telemetry metrics and optimization candidates and anomaly

metric.
advanced: Required. Add SKU refs and stricter budget linkage + attribution requirements.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, budget ref, sku refs,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If drivers[].driver_id is UNKNOWN → block Completeness Gate.
If drivers[].category is UNKNOWN → block Completeness Gate.
If drivers[].levers is UNKNOWN → block Completeness Gate.
If drivers[].owner is UNKNOWN → block Completeness Gate.
If drivers[*].anomaly_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
driver_registry_defined == true
telemetry_defined == true
ownership_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-03

COST-03 — Forecast Model (monthly/annual)
Header Block

## 5. Optional Fields

Provider SKU references | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Drivers should be attributable (tags/accounts) and connected to measurable telemetry.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Drivers (repeat)`
3. `## Driver`
4. `## open_questions:`
5. `## (Repeat per driver.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:COST-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-04}}, {{xref:COST-06}} | OPTIONAL**
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
