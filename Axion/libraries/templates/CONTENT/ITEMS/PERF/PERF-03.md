# PERF-03 — Latency Budgets (per surface)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-03                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring latency budgets (per surface)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Latency Budgets (per surface) Document                         |

## 2. Purpose

Define the canonical latency budgets for key surfaces (web screens, mobile screens, API
endpoints, background jobs): target p50/p95 values and the budget breakdown (client vs
network vs server) where applicable. This template is used to set performance expectations and
gates.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API budget spec: {{xref:PBP-04}} | OPTIONAL
- Measurement rules: {{xref:SLO-06}} | OPTIONAL
- Critical path inventory: {{xref:PERF-02}} | OPTIONAL
- Endpoint catalog: {{xref:API-01}} | OPTIONAL
- Route map/layout: {{xref:FE-01}} | OPTIONAL
- Mobile navigation map: {{xref:MOB-01}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Budget registry (budget_id list)
budget_id (stable identifier)
Surface type (api/screen/job/ws)
Surface selector (endpoint_id/screen_id/job_id)
p50 target (ms)
p95 target (ms)
Budget breakdown (client/network/server)
Measurement location (client/server)
Owner (team)
Telemetry requirements (p95 metric per budget)

Optional Fields
Notes (device/network assumptions) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Budgets must map to real surface IDs (endpoint_id/screen_id/job_id).
Targets must be measurable with referenced metrics.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_budgets: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Budgets (repeat)
Budget
budget_id: {{budgets[0].budget_id}}
surface_type: {{budgets[0].surface_type}}
surface_selector: {{budgets[0].surface_selector}}
p50_ms: {{budgets[0].p50_ms}}
p95_ms: {{budgets[0].p95_ms}}
breakdown: {{budgets[0].breakdown}}
measurement: {{budgets[0].measurement}}
owner: {{budgets[0].owner}}
metric_ref: {{budgets[0].metric_ref}} | OPTIONAL
notes: {{budgets[0].notes}} | OPTIONAL
telemetry_metric: {{budgets[0].telemetry_metric}}
open_questions:
{{budgets[0].open_questions[0]}} | OPTIONAL
(Repeat per budget.)
3. References
Critical paths: {{xref:PERF-02}} | OPTIONAL
Perf gates: {{xref:PERF-09}} | OPTIONAL
Cross-References
Upstream: {{xref:PBP-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PERF-09}}, {{xref:LOAD-06}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define budgets with selectors and p50/p95 targets.
intermediate: Required. Define breakdown + measurement location + telemetry metric.

advanced: Required. Add device/network notes and strict linkage to critical paths and SLO
windows.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, metric ref, notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If budgets[].budget_id is UNKNOWN → block Completeness Gate.
If budgets[].surface_selector is UNKNOWN → block Completeness Gate.
If budgets[].p95_ms is UNKNOWN → block Completeness Gate.
If budgets[].owner is UNKNOWN → block Completeness Gate.
If budgets[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
budget_registry_defined == true
targets_defined == true
measurement_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PERF-04

PERF-04 — Throughput Targets (RPS, concurrency)
Header Block

## 5. Optional Fields

Notes (device/network assumptions) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Budgets must map to real surface IDs (endpoint_id/screen_id/job_id).**
- **Targets must be measurable with referenced metrics.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Budgets (repeat)`
3. `## Budget`
4. `## open_questions:`
5. `## (Repeat per budget.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:PBP-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PERF-09}}, {{xref:LOAD-06}} | OPTIONAL**
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
