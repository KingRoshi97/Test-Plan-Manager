# LOAD-05 — Tooling & Harness (runner, metrics capture)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-05                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring tooling & harness (runner, metrics capture)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Tooling & Harness (runner, metrics capture) Document                         |

## 2. Purpose

Define the canonical tooling and harness used to run load tests: the runner, scenario wiring,
metrics capture, result storage, and CI integration. This template standardizes how load is
generated and how results are made comparable.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Test pipeline spec: {{xref:CICD-03}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Harness overview: {{xref:QAH-01}} | OPTIONAL
- Load testing overview: {{xref:LOAD-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Tooling inventory (tool_id list)
tool_id (stable identifier)
Runner selection (k6/locust/jmeter/UNKNOWN)
Scenario wiring rule (scenario_id → runner scripts)
Metrics capture rule (what captured, where)
Result storage location (artifacts repo/bucket)
CI integration rule (when tests run)
Secrets handling rule (test creds)
Environment config rule (endpoints, tokens)
Telemetry requirements (runner failures, missing metrics)

Optional Fields
Distributed load generation notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Test credentials must be handled via secrets management; never hardcode.
Load results must include enough metadata to reproduce (commit SHA, env).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Tools
tools: {{tools.list}}
2. Runner
runner: {{runner.name}}
runner_rule: {{runner.rule}} | OPTIONAL
3. Scenario Wiring
wiring_rule: {{wiring.rule}}
script_location: {{wiring.script_location}} | OPTIONAL
4. Metrics Capture
metrics: {{metrics.captured}}
capture_pipeline: {{metrics.pipeline}} | OPTIONAL
5. Results Storage
storage_location: {{results.storage_location}}
retention_rule: {{results.retention_rule}} | OPTIONAL
6. CI Integration
ci_rule: {{ci.rule}}
pipeline_ref: {{xref:CICD-03}} | OPTIONAL
7. Secrets
secrets_rule: {{secrets.rule}}
secrets_ref: {{xref:SDR-02}} | OPTIONAL
8. Environment Config
config_rule: {{env.config_rule}}
9. Telemetry
runner_fail_metric: {{telemetry.runner_fail_metric}}
missing_metrics_metric: {{telemetry.missing_metrics_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:LOAD-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-06}}, {{xref:LOAD-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define runner, scenario wiring, metrics capture, results storage, CI rule.

intermediate: Required. Define secrets handling, env config, telemetry metrics.
advanced: Required. Add distributed generation notes and strict reproducibility metadata
requirements.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, runner rule, script location, pipeline,
retention rule, pipeline ref, secrets ref, optional metrics, distributed notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If runner.name is UNKNOWN → block Completeness Gate.
If wiring.rule is UNKNOWN → block Completeness Gate.
If metrics.captured is UNKNOWN → block Completeness Gate.
If results.storage_location is UNKNOWN → block Completeness Gate.
If ci.rule is UNKNOWN → block Completeness Gate.
If telemetry.runner_fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
tooling_and_wiring_defined == true
metrics_and_storage_defined == true
ci_and_secrets_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-06

LOAD-06 — Pass/Fail Criteria (SLO ties)
Header Block

## 5. Optional Fields

Distributed load generation notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Test credentials must be handled via secrets management; never hardcode.**
- **Load results must include enough metadata to reproduce (commit SHA, env).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Tools`
2. `## Runner`
3. `## Scenario Wiring`
4. `## Metrics Capture`
5. `## Results Storage`
6. `## CI Integration`
7. `## Secrets`
8. `## Environment Config`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:LOAD-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-06}}, {{xref:LOAD-07}} | OPTIONAL**
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
