# LOAD-08 — Bottleneck Analysis Template (what failed)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-08                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring bottleneck analysis template (what failed)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Bottleneck Analysis Template (what failed) Document                         |

## 2. Purpose

Define the canonical analysis template used when load tests fail or degrade: how to identify the
limiting component (CPU, DB, cache, queue, network), what evidence to collect, and how to
propose mitigations. This template standardizes bottleneck writeups.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Dashboards inventory: {{xref:OBS-07}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Tracing standard: {{xref:LTS-02}} | OPTIONAL
- DB performance policy: {{xref:PERF-06}} | OPTIONAL
- Failure modes catalog: {{xref:RELIA-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Incident/scenario reference (scenario_id)
Symptom summary (what degraded)
Limiting resource hypothesis (CPU/DB/IO)
Evidence checklist (metrics/logs/traces)
Primary signals (which metric_ids)
Isolation steps (how narrowed down)
Root cause statement (if known)
Mitigation options (ranked)
Retest plan (what scenario rerun)
Telemetry requirements (time-to-root-cause)

Optional Fields
Cost tradeoff notes | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Every claim must be backed by evidence artifacts or marked UNKNOWN.
Mitigations must be tied to the bottleneck mechanism (not generic).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Reference
scenario_id: {{ref.scenario_id}}
test_run_id: {{ref.test_run_id}} | OPTIONAL
2. Symptoms
summary: {{symptoms.summary}}
metrics_affected: {{symptoms.metrics_affected}} | OPTIONAL
3. Hypothesis
limiting_resource: {{hyp.resource}}
hypothesis_notes: {{hyp.notes}} | OPTIONAL
4. Evidence
checklist: {{evidence.checklist}}
primary_signals: {{evidence.primary_signals}}
5. Isolation
steps: {{isolation.steps}}
6. Root Cause
root_cause: {{rc.root_cause}}
7. Mitigations
{{mitigations[0]}}
{{mitigations[1]}} | OPTIONAL
8. Retest Plan
retest_scenario_id: {{retest.scenario_id}}
criteria_ref: {{xref:LOAD-06}} | OPTIONAL
9. Telemetry
time_to_rca_metric: {{telemetry.time_to_rca_metric}}
Cross-References
Upstream: {{xref:LOAD-07}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PERF-10}}, {{xref:COST-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Fill reference, symptoms, evidence checklist, root cause (or UNKNOWN),
retest plan.

intermediate: Required. Add hypothesis + isolation steps + mitigations + telemetry.
advanced: Required. Add cost tradeoffs and strict evidence linking (dashboards/trace IDs).
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, test run id, metrics affected, hypothesis
notes, cost tradeoffs, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If ref.scenario_id is UNKNOWN → block Completeness Gate.
If evidence.checklist is UNKNOWN → block Completeness Gate.
If evidence.primary_signals is UNKNOWN → block Completeness Gate.
If retest.scenario_id is UNKNOWN → block Completeness Gate.
If telemetry.time_to_rca_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
reference_defined == true
evidence_defined == true
mitigation_and_retest_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-09

LOAD-09 — Chaos/Failure Injection Plan (optional)
Header Block

## 5. Optional Fields

Cost tradeoff notes | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Every claim must be backed by evidence artifacts or marked UNKNOWN.**
- **Mitigations must be tied to the bottleneck mechanism (not generic).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Reference`
2. `## Symptoms`
3. `## Hypothesis`
4. `## Evidence`
5. `## Isolation`
6. `## Root Cause`
7. `## Mitigations`
8. `## Retest Plan`
9. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:LOAD-07}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PERF-10}}, {{xref:COST-06}} | OPTIONAL**
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
