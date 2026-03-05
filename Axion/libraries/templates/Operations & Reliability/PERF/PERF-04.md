# PERF-04 — Throughput Targets (RPS, concurrency)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-04                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring throughput targets (rps, concurrency)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Throughput Targets (RPS, concurrency) Document                         |

## 2. Purpose

Define the canonical throughput and concurrency targets for the system: expected and peak
RPS, concurrent users/sessions, background job throughput, and platform limits. This template
is used to size systems and to define load test pass/fail criteria.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Performance overview: {{xref:PERF-01}} | OPTIONAL
- API endpoint catalog: {{xref:API-01}} | OPTIONAL
- Workload models: {{xref:LOAD-02}} | OPTIONAL
- Cost forecast model: {{xref:COST-03}} | OPTIONAL
- Service SLO catalog: {{xref:SLO-02}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Target registry (target_id list)
target_id (stable identifier)
Surface (api/job/ws/client)
Surface selector (service_id/endpoint_id/job_id)
Expected throughput (RPS or jobs/min)
Peak throughput (burst)
Concurrency target (users/sessions/workers)
Assumptions (traffic mix, regions)
Owner (team)
Telemetry requirements (current throughput vs target)

Optional Fields
Headroom policy (e.g., 2x) | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Targets must be tied to workload models and used in load tests; avoid arbitrary numbers.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Registry Summary
total_targets: {{meta.total}}
notes: {{meta.notes}} | OPTIONAL
2. Targets (repeat)
Target
target_id: {{targets[0].target_id}}
surface: {{targets[0].surface}}
selector: {{targets[0].selector}}
expected_rate: {{targets[0].expected_rate}}
peak_rate: {{targets[0].peak_rate}}
concurrency: {{targets[0].concurrency}}
assumptions: {{targets[0].assumptions}}
owner: {{targets[0].owner}}
headroom_policy: {{targets[0].headroom_policy}} | OPTIONAL
telemetry_metric: {{targets[0].telemetry_metric}}
open_questions:
{{targets[0].open_questions[0]}} | OPTIONAL
(Repeat per target.)
3. References
Load models: {{xref:LOAD-02}} | OPTIONAL
Load criteria: {{xref:LOAD-06}} | OPTIONAL
Capacity findings: {{xref:LOAD-07}} | OPTIONAL
Cross-References
Upstream: {{xref:LOAD-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:LOAD-06}}, {{xref:COST-01}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define targets with expected/peak and concurrency and owner.
intermediate: Required. Define assumptions and telemetry metric per target.

advanced: Required. Add headroom policy and stricter linkage to cost forecasts and scaling
strategy.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, notes, headroom policy, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If targets[].target_id is UNKNOWN → block Completeness Gate.
If targets[].expected_rate is UNKNOWN → block Completeness Gate.
If targets[].peak_rate is UNKNOWN → block Completeness Gate.
If targets[].owner is UNKNOWN → block Completeness Gate.
If targets[*].telemetry_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
targets_defined == true
assumptions_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PERF-05

PERF-05 — Scaling Strategy (horizontal/vertical/caching)
Header Block

## 5. Optional Fields

Headroom policy (e.g., 2x) | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- **Targets must be tied to workload models and used in load tests; avoid arbitrary numbers.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Registry Summary`
2. `## Targets (repeat)`
3. `## Target`
4. `## open_questions:`
5. `## (Repeat per target.)`
6. `## References`

## 8. Cross-References

- **Upstream: {{xref:LOAD-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:LOAD-06}}, {{xref:COST-01}} | OPTIONAL**
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
