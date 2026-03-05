# PERF-10 — Performance Runbooks (triage playbooks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-10                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring performance runbooks (triage playbooks)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Performance Runbooks (triage playbooks) Document                         |

## 2. Purpose

Define the canonical runbooks for performance issues: high latency, low throughput, cache
misses, DB slowdowns, and client performance regressions. Runbooks must be step-by-step
and reference the dashboards/metrics needed for triage.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Perf regression gates: {{xref:PERF-09}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Incident workflow: {{xref:IRP-02}} | OPTIONAL
- Bottleneck analysis template: {{xref:LOAD-08}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Runbook registry (runbook_id list)
runbook_id (stable identifier)
Scenario type (api_latency/client_perf/db_slow/cache_miss)
Trigger signals (alerts/metrics thresholds)
Triage steps (ordered)
Isolation steps (identify component)
Mitigation steps (rollback/cache flush/scale)
Verification steps (prove recovery)
Escalation rule (who to involve)
Telemetry requirements (runbook invoked, time-to-mitigate)

Optional Fields
Automation hooks | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
Runbooks must reference metric_ids/dashboard_ids; do not rely on tribal knowledge.
Mitigation steps must prefer safe actions first (reduce load before risky changes).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_runbooks: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Runbooks (repeat)
Runbook
runbook_id: {{books[0].runbook_id}}
scenario: {{books[0].scenario}}
triggers: {{books[0].triggers}}
triage_steps:
{{books[0].triage_steps[0]}}
{{books[0].triage_steps[1]}}
isolation_steps:
{{books[0].isolation_steps[0]}}
{{books[0].isolation_steps[1]}} | OPTIONAL
mitigation_steps:
{{books[0].mitigation_steps[0]}}
{{books[0].mitigation_steps[1]}} | OPTIONAL
verification_steps: {{books[0].verification_steps}}
escalation_rule: {{books[0].escalation_rule}}
telemetry_metric: {{books[0].telemetry_metric}}
automation_hooks: {{books[0].automation_hooks}} | OPTIONAL
open_questions:
{{books[0].open_questions[0]}} | OPTIONAL
(Repeat per runbook.)
3. References
Dashboards: {{xref:OBS-07}} | OPTIONAL
Metrics: {{xref:OBS-03}} | OPTIONAL
Incident workflow: {{xref:IRP-02}} | OPTIONAL
Cross-References
Upstream: {{xref:PERF-09}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:IRP-06}}, {{xref:COST-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define core runbooks with triage/mitigate/verify steps.
intermediate: Required. Define escalation rules and telemetry metrics.
advanced: Required. Add automation hooks and strict trigger mapping to alerts and budgets.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, meta notes, optional steps, automation
hooks, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If books[].runbook_id is UNKNOWN → block Completeness Gate.
If books[].triage_steps[0] is UNKNOWN → block Completeness Gate.
If books[].mitigation_steps[0] is UNKNOWN → block Completeness Gate.
If books[].verification_steps is UNKNOWN → block Completeness Gate.
If books[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
runbooks_defined == true
triage_and_mitigation_defined == true
verification_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

Load/Stress Planning (LOAD)

LOAD-01

LOAD-01 — Load Testing Overview (goals, scope)
Header Block

## 5. Optional Fields

Automation hooks | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-INCIDENT-OPS]}} | OPTIONAL
- **Runbooks must reference metric_ids/dashboard_ids; do not rely on tribal knowledge.**
- **Mitigation steps must prefer safe actions first (reduce load before risky changes).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Runbooks (repeat)`
3. `## Runbook`
4. `## triage_steps:`
5. `## isolation_steps:`
6. `## mitigation_steps:`
7. `## open_questions:`
8. `## (Repeat per runbook.)`
9. `## References`

## 8. Cross-References

- **Upstream: {{xref:PERF-09}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IRP-06}}, {{xref:COST-10}} | OPTIONAL**
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
