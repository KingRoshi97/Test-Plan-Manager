# WFO-06 — Workflow Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WFO-06                                             |
| Template Type     | Architecture / Workflow                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring workflow observability    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Workflow Observability Document                         |

## 2. Purpose

Define the required observability signals for workflows: traceability fields, audit events, metrics,
and dashboards so workflow health can be monitored and diagnosed consistently across
services.

## 3. Inputs Required

- ● WFO-01: {{xref:WFO-01}} | OPTIONAL
- ● OBS-01: {{xref:OBS-01}} | OPTIONAL
- ● OBS-03: {{xref:OBS-03}} | OPTIONAL
- ● AUDIT-01: {{xref:AUDIT-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Required trace fields:    | spec         | Yes             |
| ○ wf_id, run_id, step_id  | spec         | Yes             |
| ○ correlation_id/trace_id | spec         | Yes             |
| ○ entity identifiers (... | spec         | Yes             |
| Required audit events ... | spec         | Yes             |
| Metrics catalog:          | spec         | Yes             |
| ○ runs_started, runs_s... | spec         | Yes             |
| ○ step_duration, queue... | spec         | Yes             |
| ○ dlq_count               | spec         | Yes             |
| Tag policy (avoid high... | spec         | Yes             |
| Alert thresholds (what... | spec         | Yes             |
| Coverage checks (every... | spec         | Yes             |

## 5. Optional Fields

● Dashboard requirements | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- All workflows must emit wf_id + run_id + correlation_id at minimum.
- Metrics must avoid high-cardinality tags (no user_id as metric label).
- Sensitive workflows must emit audit events (aligned with PMAD-05/PMAD-06).
- Alerts must be deterministic and tied to thresholds.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Required Trace Fields (required)`
2. `## field`
3. `## required`
4. `## description`
5. `## redaction`
6. `## wf_id`
7. `## true`
8. `## run_id`
9. `## true`
10. `## step_id`

## 8. Cross-References

- Upstream: {{xref:OBS-01}} | OPTIONAL, {{xref:OBS-03}} | OPTIONAL, {{xref:AUDIT-01}}
- | OPTIONAL
- Downstream: {{xref:ALRT-}} | OPTIONAL, {{xref:OPS-05}} | OPTIONAL, {{xref:IRP-}} |
- OPTIONAL
- Standards: {{standards.rules[STD-RELIABILITY]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
