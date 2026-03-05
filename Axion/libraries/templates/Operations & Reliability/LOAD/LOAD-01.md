# LOAD-01 — Load Testing Overview (goals, scope)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-01                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring load testing overview (goals, scope)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Load Testing Overview (goals, scope) Document                         |

## 2. Purpose

Create the single, canonical overview of load and stress testing: why we run it, what’s in-scope,
what success means, and how it connects to throughput targets and SLOs. This document
anchors the LOAD set.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Throughput targets: {{xref:PERF-04}} | OPTIONAL
- Latency budgets: {{xref:PERF-03}} | OPTIONAL
- SLO measurement rules: {{xref:SLO-06}} | OPTIONAL
- Workload models: {{xref:LOAD-02}} | OPTIONAL
- Pass/fail criteria: {{xref:LOAD-06}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Goals (capacity confidence, bottleneck discovery)
In-scope systems/surfaces
Out-of-scope statement (explicit)
Test types (load, stress, soak, spike)
Environment requirements (prod-like)
Data requirements (seed, privacy constraints)
Ownership (who runs tests)
Cadence (per release/quarterly)
Evidence artifact rule (store reports)
Telemetry requirements (test failures, trends)

Optional Fields
Tooling notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Load tests must be repeatable and have clear pass/fail criteria.
Never use real PII in load test data unless explicitly allowed by PRIV rules.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Goals
{{goals[0]}}
{{goals[1]}}
{{goals[2]}} | OPTIONAL
2. Scope
in_scope: {{scope.in}}
out_of_scope: {{scope.out}} | OPTIONAL
3. Test Types
types: {{types.list}}
4. Environments
env_rule: {{env.rule}}
envs: {{env.envs}} | OPTIONAL
5. Data
data_rule: {{data.rule}}
privacy_ref: {{xref:PRIV-02}} | OPTIONAL
6. Cadence & Ownership
cadence: {{cadence.value}}
owner: {{owner.team}}
7. Evidence
report_artifacts: {{evidence.report_artifacts}}
storage_location: {{evidence.storage_location}} | OPTIONAL
8. Telemetry
load_test_fail_metric: {{telemetry.fail_metric}}
trend_metric: {{telemetry.trend_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:PERF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-02}}, {{xref:LOAD-03}}, {{xref:LOAD-07}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define scope, test types, env rule, cadence, evidence artifacts.

intermediate: Required. Define data rule and ownership and telemetry metrics.
advanced: Required. Add tooling notes and strict repeatability + change-trigger guidance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, optional goal, out of scope, envs list,
privacy ref, storage location, optional metrics, tooling notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scope.in is UNKNOWN → block Completeness Gate.
If types.list is UNKNOWN → block Completeness Gate.
If env.rule is UNKNOWN → block Completeness Gate.
If evidence.report_artifacts is UNKNOWN → block Completeness Gate.
If telemetry.fail_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
scope_defined == true
test_types_defined == true
env_and_data_defined == true
evidence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-02

LOAD-02 — Workload Models (traffic shapes, personas)
Header Block

## 5. Optional Fields

Tooling notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Load tests must be repeatable and have clear pass/fail criteria.**
- **Never use real PII in load test data unless explicitly allowed by PRIV rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Goals`
2. `## Scope`
3. `## Test Types`
4. `## Environments`
5. `## Data`
6. `## Cadence & Ownership`
7. `## Evidence`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:PERF-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-02}}, {{xref:LOAD-03}}, {{xref:LOAD-07}} | OPTIONAL**
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
