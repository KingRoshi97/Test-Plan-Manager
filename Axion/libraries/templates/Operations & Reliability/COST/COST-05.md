# COST-05 — Unit Economics (cost per user/action)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | COST-05                                             |
| Template Type     | Operations / Cost Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring unit economics (cost per user/action)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Unit Economics (cost per user/action) Document                         |

## 2. Purpose

Define the canonical unit economics model: how to compute cost per user, cost per key action,
and cost per tenant using cost drivers and usage metrics. This template supports pricing
decisions and cost optimization prioritization.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Cost drivers catalog: {{xref:COST-02}} | OPTIONAL
- Cost reporting baselines: {{xref:COST-09}} | OPTIONAL
- Funnels/KPIs (usage volume): {{xref:ANL-07}} | OPTIONAL
- Throughput targets (action volume proxy): {{xref:PERF-04}} | OPTIONAL
- Forecast model: {{xref:COST-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Unit definitions (user... | spec         | Yes             |
| Action catalog for uni... | spec         | Yes             |
| Cost allocation rule (... | spec         | Yes             |
| Usage measurement rule... | spec         | Yes             |
| Computation formulas (... | spec         | Yes             |
| Cadence (monthly)         | spec         | Yes             |
| Owner (finops/product)    | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Pricing linkage notes | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Unit economics must be based on measurable usage and driver costs; avoid guesses.
Allocation rules must be consistent and documented.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Units
units: {{units.list}}
2. Actions
actions: {{actions.list}}
3. Allocation
allocation_rule: {{alloc.rule}}
4. Usage Measurement
usage_rule: {{usage.rule}}
usage_sources: {{usage.sources}} | OPTIONAL
5. Formulas
formulas: {{formulas.list}}
6. Cadence & Ownership
cadence: {{cadence.value}}
owner: {{owner.team}}
7. Telemetry
unit_cost_trend_metric: {{telemetry.unit_cost_trend_metric}}
Cross-References
Upstream: {{xref:COST-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:COST-06}}, {{xref:COST-03}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define unit definitions, allocation rule, usage rule, formulas.
intermediate: Required. Define actions list, cadence, telemetry metric.
advanced: Required. Add pricing linkage notes and stricter allocation audits + variance analysis.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, usage sources, pricing linkage,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If units.list is UNKNOWN → block Completeness Gate.
If alloc.rule is UNKNOWN → block Completeness Gate.
If usage.rule is UNKNOWN → block Completeness Gate.
If formulas.list is UNKNOWN → block Completeness Gate.
If telemetry.unit_cost_trend_metric is UNKNOWN → block Completeness Gate.

Completeness Gate
Gate ID: TMP-05.PRIMARY.COST
Pass conditions:
required_fields_present == true
units_and_actions_defined == true
allocation_defined == true
formulas_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

COST-06

COST-06 — Optimization Backlog (ranked opportunities)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Unit economics must be based on measurable usage and driver costs; avoid guesses.**
- **Allocation rules must be consistent and documented.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Units`
2. `## Actions`
3. `## Allocation`
4. `## Usage Measurement`
5. `## Formulas`
6. `## Cadence & Ownership`
7. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:COST-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:COST-06}}, {{xref:COST-03}} | OPTIONAL**
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
