# LOAD-07 — Capacity Findings Report (results template)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | LOAD-07                                             |
| Template Type     | Operations / Load Testing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring capacity findings report (results template)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Capacity Findings Report (results template) Document                         |

## 2. Purpose

Define the canonical reporting template for load test findings: what ran, what passed/failed,
bottlenecks found, capacity limits, and recommended next actions. This template standardizes
result communication and creates an evidence artifact for performance readiness.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Scenarios catalog: {{xref:LOAD-03}} | OPTIONAL
- Pass/fail criteria: {{xref:LOAD-06}} | OPTIONAL
- Tooling/harness: {{xref:LOAD-05}} | OPTIONAL
- Dashboards: {{xref:OBS-07}} | OPTIONAL
- Cost reporting: {{xref:COST-09}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Report metadata (date, env, commit)
Scenario(s) executed (scenario_id list)
Workload model summary (model_id)
Key results (pass/fail)
Capacity limit statement (what max sustainable load)
Primary bottlenecks found (top 1–5)
SLO/latency impact summary
Mitigations recommended (ranked)
Follow-up tests required
Evidence artifacts links (reports/charts)
Telemetry requirements (report published, follow-ups closed)

Optional Fields
Cost impact summary | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Findings must be backed by evidence artifacts (charts, logs).
Avoid “recommendations” phrasing that introduces new scope; treat as mitigation options.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Report Metadata
date: {{meta.date}}
environment: {{meta.environment}}
commit_sha: {{meta.commit_sha}}
2. What Ran
scenario_ids: {{run.scenario_ids}}
model_ids: {{run.model_ids}} | OPTIONAL
3. Results
pass_fail_summary: {{results.pass_fail_summary}}
key_metrics: {{results.key_metrics}} | OPTIONAL
4. Capacity Limit
max_sustainable_load: {{capacity.max_sustainable_load}}
constraints: {{capacity.constraints}} | OPTIONAL
5. Bottlenecks
{{bottlenecks[0]}}
{{bottlenecks[1]}} | OPTIONAL
6. Impact
slo_impact: {{impact.slo_impact}}
latency_impact: {{impact.latency_impact}} | OPTIONAL
7. Mitigations
{{mitigations[0]}}
{{mitigations[1]}} | OPTIONAL
8. Follow-Ups
tests_required: {{followups.tests_required}}
owners: {{followups.owners}} | OPTIONAL
9. Evidence
artifacts: {{evidence.artifacts}}
10.Telemetry
report_published_metric: {{telemetry.report_published_metric}}
followups_closed_metric: {{telemetry.followups_closed_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:LOAD-03}}, {{xref:SPEC_INDEX}} | OPTIONAL

Downstream: {{xref:LOAD-08}}, {{xref:COST-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Fill metadata, scenarios, pass/fail, capacity limit, evidence artifacts.
intermediate: Required. Add bottlenecks, impact summary, mitigations, telemetry.
advanced: Required. Add cost impact summary and strict follow-up tracking with owners/dates.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, model ids, key metrics, capacity
constraints, optional bottlenecks/mitigations, cost impact, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If meta.date is UNKNOWN → block Completeness Gate.
If run.scenario_ids is UNKNOWN → block Completeness Gate.
If results.pass_fail_summary is UNKNOWN → block Completeness Gate.
If capacity.max_sustainable_load is UNKNOWN → block Completeness Gate.
If evidence.artifacts is UNKNOWN → block Completeness Gate.
If telemetry.report_published_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.LOAD
Pass conditions:
required_fields_present == true
metadata_defined == true
results_defined == true
capacity_and_evidence_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

LOAD-08

LOAD-08 — Bottleneck Analysis Template (what failed)
Header Block

## 5. Optional Fields

Cost impact summary | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Findings must be backed by evidence artifacts (charts, logs).**
- **Avoid “recommendations” phrasing that introduces new scope; treat as mitigation options.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Report Metadata`
2. `## What Ran`
3. `## Results`
4. `## Capacity Limit`
5. `## Bottlenecks`
6. `## Impact`
7. `## Mitigations`
8. `## Follow-Ups`
9. `## Evidence`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:LOAD-03}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-08}}, {{xref:COST-10}} | OPTIONAL**
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
