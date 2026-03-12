# LOAD-03 — Test Scenarios Catalog (by scenario_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-03                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring test scenarios catalog (by scenario_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Test Scenarios Catalog (by scenario_id) Document                         |

## 2. Purpose

Create the canonical catalog of load test scenarios, indexed by scenario_id, including the
workload model used, the systems exercised, the duration, and the pass/fail rules. This catalog
is used to standardize load testing and track coverage.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Workload models: {{xref:LOAD-02}} | OPTIONAL
- Pass/fail criteria: {{xref:LOAD-06}} | OPTIONAL
- Endpoint catalog: {{xref:API-01}} | OPTIONAL
- Latency budgets: {{xref:PERF-03}} | OPTIONAL
- Throughput targets: {{xref:PERF-04}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Scenario registry (scenario_id list)
scenario_id (stable identifier)
Scenario name/summary
Workload model binding (model_id)
Systems/surfaces exercised (service_id/endpoint_id list)
Duration (minutes)
Ramp pattern (if separate from model)
Pass/fail criteria binding (criteria_id or rules)
Evidence artifacts produced (reports, graphs)
Owner (team)
Telemetry requirements (scenario pass rate, run duration)

Optional Fields
Cost estimate notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Scenarios must reference existing model_ids and real endpoint/service IDs.
Pass/fail must reference measurable metrics (latency/error/throughput).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_scenarios: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Scenarios (repeat)
Scenario
scenario_id: {{scenarios[0].scenario_id}}
name: {{scenarios[0].name}}
model_id: {{scenarios[0].model_id}}
surfaces: {{scenarios[0].surfaces}}
duration_minutes: {{scenarios[0].duration_minutes}}
ramp_pattern: {{scenarios[0].ramp_pattern}} | OPTIONAL
pass_fail: {{scenarios[0].pass_fail}}
evidence_artifacts: {{scenarios[0].evidence_artifacts}}
owner: {{scenarios[0].owner}}
telemetry_metric: {{scenarios[0].telemetry_metric}}
cost_notes: {{scenarios[0].cost_notes}} | OPTIONAL
open_questions:
{{scenarios[0].open_questions[0]}} | OPTIONAL
(Repeat per scenario.)
3. References
Harness/tooling: {{xref:LOAD-05}} | OPTIONAL
Findings report: {{xref:LOAD-07}} | OPTIONAL
Cross-References
Upstream: {{xref:LOAD-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-07}}, {{xref:LOAD-08}}, {{xref:COST-01}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define scenario_id/name/model binding/duration and evidence artifacts.
intermediate: Required. Define pass/fail bindings and telemetry metric.

advanced: Required. Add cost estimate notes and strict mapping to budgets and targets +
change triggers.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, ramp pattern, cost notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scenarios[].scenario_id is UNKNOWN → block Completeness Gate.
If scenarios[].model_id is UNKNOWN → block Completeness Gate.
If scenarios[].pass_fail is UNKNOWN → block Completeness Gate.
If scenarios[].evidence_artifacts is UNKNOWN → block Completeness Gate.
If scenarios[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
scenario_registry_defined == true
bindings_defined == true
evidence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-04

LOAD-04 — Data & Environment Setup (fixtures, isolation)
Header Block

## 5. Optional Fields

Cost estimate notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Scenarios must reference existing model_ids and real endpoint/service IDs.**
- **Pass/fail must reference measurable metrics (latency/error/throughput).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Scenarios (repeat)`
3. `## Scenario`
4. `## open_questions:`
5. `## (Repeat per scenario.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:LOAD-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-07}}, {{xref:LOAD-08}}, {{xref:COST-01}} | OPTIONAL**
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
