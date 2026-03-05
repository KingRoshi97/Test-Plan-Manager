# JBS-01 — Jobs Inventory (by job_id)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-01                                             |
| Template Type     | Build / Background Jobs                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring jobs inventory (by job_id)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Jobs Inventory (by job_id) Document                         |

## 2. Purpose

Define the canonical registry of background jobs by stable job_id: what jobs exist, why they
exist, how they’re triggered, what they touch, and what reliability controls apply.

## 3. Inputs Required

- ● WFO-01: {{xref:WFO-01}} | OPTIONAL
- ● WFO-04: {{xref:WFO-04}} | OPTIONAL
- ● EVT-01: {{xref:EVT-01}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Jobs list (minimum 12 for non-trivial systems; justify if smaller)
● For each job:
○ job_id (stable)
○ name
○ purpose
○ type (scheduled/event-driven/api-triggered/manual)
○ trigger definition (cron/event/endpoint)
○ owner_service/boundary
○ inputs (high level)
○ outputs/side effects (events/writes)
○ data sensitivity level (PII)
○ idempotency requirement (yes/no + policy pointer)
○ concurrency posture (single/partitioned/parallel)
○ retry profile (ERR-05 profile id)
○ DLQ/quarantine behavior pointer (WFO-05)
○ observability requirements (metrics/log fields)
○ runbook pointer (OPS-06) | OPTIONAL

## 5. Optional Fields

● Priority class | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- job_id must be stable and never reused for different behavior.
- Jobs must declare retry profile and idempotency stance.
- High-PII jobs require explicit redaction rules.
- Scheduled jobs must declare env enablement and safety constraints.

## 7. Output Format

### Required Headings (in order)

1. `## Jobs Inventory (canonical)`
2. `## nam`
3. `## type`
4. `## trigg`
5. `## own`
6. `## inpu`
7. `## outp`
8. `## uts`
9. `## pii`
10. `## ide`

## 8. Cross-References

- Upstream: {{xref:WFO-01}} | OPTIONAL, {{xref:ERR-05}} | OPTIONAL
- Downstream: {{xref:JBS-02}}, {{xref:JBS-04}} | OPTIONAL, {{xref:JBS-06}} | OPTIONAL
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
