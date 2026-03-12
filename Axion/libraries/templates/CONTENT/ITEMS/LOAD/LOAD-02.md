# LOAD-02 — Workload Models (traffic shapes, personas)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-02                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring workload models (traffic shapes, personas)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Workload Models (traffic shapes, personas) Document                         |

## 2. Purpose

Define the canonical workload models used for load tests: traffic shapes, personas, endpoint
mixes, and ramp patterns. This template ensures load tests simulate realistic usage and map to
throughput targets and critical paths.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Throughput targets: {{xref:PERF-04}} | OPTIONAL
- Critical paths: {{xref:PERF-02}} | OPTIONAL
- Funnels/KPIs (usage distribution): {{xref:ANL-07}} | OPTIONAL
- Endpoint catalog: {{xref:API-01}} | OPTIONAL
- Journey inventory: {{xref:RJT-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Model registry (model_id list)
model_id (stable identifier)
Persona definition (user type)
Traffic shape (steady/ramp/spike/soak)
Duration (minutes)
Target load (RPS/concurrency)
Endpoint mix (endpoint_id → %)
Think time rules (user pacing)
Data requirements (accounts, fixtures)
Owner (team)
Telemetry requirements (actual vs intended load)

Optional Fields
Regional distribution | OPTIONAL
Cache warmup phase | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Workload models must reference real endpoint IDs; do not invent endpoint_id values.
Target load must map to PERF-04 targets or explicitly state UNKNOWN.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_models: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Models (repeat)
Model
model_id: {{models[0].model_id}}
persona: {{models[0].persona}}
traffic_shape: {{models[0].traffic_shape}}
duration_minutes: {{models[0].duration_minutes}}
target_load: {{models[0].target_load}}
endpoint_mix: {{models[0].endpoint_mix}}
think_time_rule: {{models[0].think_time_rule}}
data_requirements: {{models[0].data_requirements}}
owner: {{models[0].owner}}
regional_distribution: {{models[0].regional_distribution}} | OPTIONAL
cache_warmup: {{models[0].cache_warmup}} | OPTIONAL
telemetry_metric: {{models[0].telemetry_metric}}
open_questions:
{{models[0].open_questions[0]}} | OPTIONAL
(Repeat per model.)
3. References
Scenarios catalog: {{xref:LOAD-03}} | OPTIONAL
Setup rules: {{xref:LOAD-04}} | OPTIONAL
Cross-References
Upstream: {{xref:PERF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-03}}, {{xref:LOAD-06}}, {{xref:LOAD-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Define models with traffic shape, duration, target load, endpoint mix.
intermediate: Required. Define think time and data requirements and telemetry.
advanced: Required. Add regional distribution and cache warmup and strict mapping to
KPIs/critical paths.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, regional distribution, cache
warmup, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If models[].model_id is UNKNOWN → block Completeness Gate.
If models[].target_load is UNKNOWN → block Completeness Gate.
If models[].endpoint_mix is UNKNOWN → block Completeness Gate.
If models[].owner is UNKNOWN → block Completeness Gate.
If models[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
model_registry_defined == true
target_load_and_mix_defined == true
data_and_pacing_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-03

LOAD-03 — Test Scenarios Catalog (by scenario_id)
Header Block

## 5. Optional Fields

Regional distribution | OPTIONAL
Cache warmup phase | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Workload models must reference real endpoint IDs; do not invent endpoint_id values.**
- **Target load must map to PERF-04 targets or explicitly state UNKNOWN.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Models (repeat)`
3. `## Model`
4. `## open_questions:`
5. `## (Repeat per model.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:PERF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-03}}, {{xref:LOAD-06}}, {{xref:LOAD-07}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**
- Skill Level Requiredness Rules
- **beginner: Required. Define models with traffic shape, duration, target load, endpoint mix.**
- **intermediate: Required. Define think time and data requirements and telemetry.**
- **advanced: Required. Add regional distribution and cache warmup and strict mapping to**
- KPIs/critical paths.
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, regional distribution, cache**
- warmup, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If models[].model_id is UNKNOWN → block

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
