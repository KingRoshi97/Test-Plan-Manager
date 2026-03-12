# COST-03 — Forecast Model (monthly/annual)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-03                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring forecast model (monthly/annual)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Forecast Model (monthly/annual) Document                         |

## 2. Purpose

Define the canonical cost forecasting model: how monthly/annual cost is projected using growth
assumptions, workload projections, and unit cost drivers. This template supports budget
planning and scenario analysis.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost model overview: {{xref:COST-01}} | OPTIONAL
- Cost drivers catalog: {{xref:COST-02}} | OPTIONAL
- Throughput targets (growth proxy): {{xref:PERF-04}} | OPTIONAL
- Cost reporting baselines: {{xref:COST-09}} | OPTIONAL
- Funnels/KPIs (growth): {{xref:ANL-07}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Forecast horizon (months) | spec         | Yes             |
| Scenarios (base/high/low) | spec         | Yes             |
| Input assumptions (use... | spec         | Yes             |
| Unit costs (per driver... | spec         | Yes             |
| Computation rule (how ... | spec         | Yes             |
| Update cadence (monthly)  | spec         | Yes             |
| Owner (finops)            | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Sensitivity analysis notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Forecast must be explainable (inputs → outputs).
Use the cost drivers catalog for unit costs; do not invent drivers.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Horizon
months: {{horizon.months}}
2. Scenarios
scenarios: {{scenarios.list}}
3. Assumptions
assumptions: {{assumptions.list}}
4. Unit Costs
unit_costs: {{unit_costs.list}}
5. Computation
calculation_rule: {{calc.rule}}
6. Cadence & Ownership
cadence: {{cadence.value}}
owner: {{owner.team}}
7. Telemetry
forecast_error_metric: {{telemetry.forecast_error_metric}}
Cross-References
Upstream: {{xref:COST-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-04}}, {{xref:COST-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define horizon, scenarios, assumptions, and calc rule.
intermediate: Required. Define unit costs and cadence and telemetry.
advanced: Required. Add sensitivity analysis and strict linkage to growth KPIs + throughput
targets.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, sensitivity notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If horizon.months is UNKNOWN → block Completeness Gate.
If scenarios.list is UNKNOWN → block Completeness Gate.
If assumptions.list is UNKNOWN → block Completeness Gate.
If calc.rule is UNKNOWN → block Completeness Gate.
If telemetry.forecast_error_metric is UNKNOWN → block Completeness Gate.

Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
forecast_inputs_defined == true
calculation_defined == true
ownership_and_cadence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-04

COST-04 — Budget & Alerts (thresholds, routing)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Forecast must be explainable (inputs → outputs).**
- Use the cost drivers catalog for unit costs; do not invent drivers.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Horizon`
2. `## Scenarios`
3. `## Assumptions`
4. `## Unit Costs`
5. `## Computation`
6. `## Cadence & Ownership`
7. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:COST-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-04}}, {{xref:COST-09}} | OPTIONAL**
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
