# PERF-09 — Performance Regression Gates (thresholds, CI checks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-09                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring performance regression gates (thresholds, ci checks)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Performance Regression Gates (thresholds, CI checks) Document                         |

## 2. Purpose

Define the canonical performance gating rules that block regressions: which tests run in CI,
what thresholds apply, what is allowed to fail, and how waivers work. This template turns
performance budgets into enforceable release gates.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Perf CI gates: {{xref:PBP-06}} | OPTIONAL
- Test pipeline spec: {{xref:CICD-03}} | OPTIONAL
- Release quality gates: {{xref:QA-07}} | OPTIONAL
- Latency budgets: {{xref:PERF-03}} | OPTIONAL
- Journey test cadence: {{xref:RJT-05}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Gate registry (gate_id list)
gate_id (stable identifier)
Surface type (web/mobile/api)
Test suite binding (unit/e2e/load-lite)
Metrics measured (LCP, startup time, p95 latency)
Thresholds per metric (budget values)
Baseline comparison rule (vs main branch)
Fail behavior (block/warn)
Waiver/exception process (COMP-08)
Evidence artifact rule (store reports)
Telemetry requirements (gate failures, trend)

Optional Fields
Canary/perf lab notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Gates must be deterministic and repeatable; flaky perf tests must be quarantined.
Waivers must be time-bound and tracked.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_gates: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Gates (repeat)
Gate
gate_id: {{gates[0].gate_id}}
surface: {{gates[0].surface}}
test_suite: {{gates[0].test_suite}}
metrics: {{gates[0].metrics}}
thresholds: {{gates[0].thresholds}}
baseline_rule: {{gates[0].baseline_rule}}
fail_behavior: {{gates[0].fail_behavior}}
waiver_rule: {{gates[0].waiver_rule}}
evidence_rule: {{gates[0].evidence_rule}}
telemetry_metric: {{gates[0].telemetry_metric}}
canary_notes: {{gates[0].canary_notes}} | OPTIONAL
open_questions:
{{gates[0].open_questions[0]}} | OPTIONAL
(Repeat per gate.)
3. References
Budget spec: {{xref:PBP-06}} | OPTIONAL
Exceptions: {{xref:COMP-08}} | OPTIONAL
Reporting: {{xref:PBP-07}} | OPTIONAL
Cross-References
Upstream: {{xref:PBP-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:REL-06}}, {{xref:LOAD-01}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define gates with metrics/thresholds and fail behavior and evidence rule.

intermediate: Required. Define baseline rule and waiver process and telemetry.
advanced: Required. Add canary/lab notes and strict flake handling and trend governance.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, canary/lab notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If gates[].gate_id is UNKNOWN → block Completeness Gate.
If gates[].thresholds is UNKNOWN → block Completeness Gate.
If gates[].fail_behavior is UNKNOWN → block Completeness Gate.
If gates[].evidence_rule is UNKNOWN → block Completeness Gate.
If gates[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
gate_registry_defined == true
thresholds_defined == true
waiver_defined == true
evidence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PERF-10

PERF-10 — Performance Runbooks (triage playbooks)
Header Block

## 5. Optional Fields

Canary/perf lab notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Gates must be deterministic and repeatable; flaky perf tests must be quarantined.**
- **Waivers must be time-bound and tracked.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Gates (repeat)`
3. `## Gate`
4. `## open_questions:`
5. `## (Repeat per gate.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:PBP-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:REL-06}}, {{xref:LOAD-01}} | OPTIONAL**
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
