# LOAD-06 — Pass/Fail Criteria (SLO ties)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-06                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring pass/fail criteria (slo ties)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Pass/Fail Criteria (SLO ties) Document                         |

## 2. Purpose

Define the canonical pass/fail criteria for load tests: which metrics are evaluated, what
thresholds apply, and what constitutes a failure. This template ties load results to latency
budgets, throughput targets, and SLO measurement rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SLO measurement rules: {{xref:SLO-06}} | OPTIONAL
- Latency budgets: {{xref:PERF-03}} | OPTIONAL
- Throughput targets: {{xref:PERF-04}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Alert catalog (for overload signals): {{xref:ALRT-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Criteria registry (criteria_id list)
criteria_id (stable identifier)
Scenario binding (scenario_id)
Metrics evaluated (latency/error/throughput)
Thresholds per metric (p95 <= X, error <= Y)
Evaluation window (steady-state window)
Warmup exclusion rule (ignore first N minutes)
Failure classification (hard fail vs warn)
Evidence rule (include charts/reports)
Telemetry requirements (criteria failures count)

Optional Fields
Saturation signals (CPU, queue depth) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Criteria must be measurable with captured metrics; do not use subjective pass conditions.
If budgets/targets are unknown, criteria must flag it and default to conservative fail behavior or
explicit waiver.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_criteria: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Criteria (repeat)
Criteria
criteria_id: {{criteria[0].criteria_id}}
scenario_id: {{criteria[0].scenario_id}}
metrics: {{criteria[0].metrics}}
thresholds: {{criteria[0].thresholds}}
eval_window: {{criteria[0].eval_window}}
warmup_rule: {{criteria[0].warmup_rule}}
fail_class: {{criteria[0].fail_class}}
evidence_rule: {{criteria[0].evidence_rule}}
saturation_signals: {{criteria[0].saturation_signals}} | OPTIONAL
telemetry_metric: {{criteria[0].telemetry_metric}}
open_questions:
{{criteria[0].open_questions[0]}} | OPTIONAL
(Repeat per criteria.)
3. References
Latency budgets: {{xref:PERF-03}} | OPTIONAL
Throughput targets: {{xref:PERF-04}} | OPTIONAL
Findings report: {{xref:LOAD-07}} | OPTIONAL
Cross-References
Upstream: {{xref:SLO-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-07}}, {{xref:LOAD-08}}, {{xref:PERF-09}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define metrics/thresholds, warmup rule, fail class, evidence rule.

intermediate: Required. Define steady-state window and saturation signals and telemetry.
advanced: Required. Add stricter waiver behavior and multi-metric gating with trend
comparisons.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, saturation signals,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If criteria[].criteria_id is UNKNOWN → block Completeness Gate.
If criteria[].thresholds is UNKNOWN → block Completeness Gate.
If criteria[].fail_class is UNKNOWN → block Completeness Gate.
If criteria[].evidence_rule is UNKNOWN → block Completeness Gate.
If criteria[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
criteria_registry_defined == true
thresholds_defined == true
evaluation_defined == true
evidence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-07

LOAD-07 — Capacity Findings Report (results template)
Header Block

## 5. Optional Fields

Saturation signals (CPU, queue depth) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Criteria must be measurable with captured metrics; do not use subjective pass conditions.**
- If budgets/targets are unknown, criteria must flag it and default to conservative fail behavior or
- **explicit waiver.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Criteria (repeat)`
3. `## Criteria`
4. `## open_questions:`
5. `## (Repeat per criteria.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:SLO-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-07}}, {{xref:LOAD-08}}, {{xref:PERF-09}} | OPTIONAL**
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
