# WFO-01 — Workflow Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | WFO-01                                             |
| Template Type     | Architecture / Workflow                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring workflow catalog    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Workflow Catalog Document                         |

## 2. Purpose

Define the canonical registry of workflows (sagas, background jobs, scheduled tasks) by stable
IDs so orchestration is deterministic and traceable. This is the authoritative list of “things that
happen over time” in the system.

## 3. Inputs Required

- ● PRD-04: {{xref:PRD-04}} | OPTIONAL
- ● ARC-03: {{xref:ARC-03}} | OPTIONAL
- ● ARC-05: {{xref:ARC-05}} | OPTIONAL
- ● API-06: {{xref:API-06}} | OPTIONAL
- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| For each workflow:        | spec         | Yes             |
| ○ wf_id                   | spec         | Yes             |
| ○ name                    | spec         | Yes             |
| ○ type (saga/job/sched... | spec         | Yes             |
| ○ trigger (event/cron/... | spec         | Yes             |
| ○ purpose                 | spec         | Yes             |
| ○ linked_feature_ids      | spec         | Yes             |
| ○ owner_service_id        | spec         | Yes             |
| ○ inputs (events/comma... | spec         | Yes             |
| ○ outputs (events/side... | spec         | Yes             |
| ○ statefulness (statel... | spec         | Yes             |
| ○ criticality (P0/P1/P2)  | spec         | Yes             |

## 5. Optional Fields

● State machine pointer (WFO-02) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- wf_id must be stable and never reused for a different workflow.
- Every workflow must declare triggers and failure posture.
- Any user-impacting workflow must map to an error posture (ERR taxonomy) and UX
- **fallback pointer (DES/CDX).**
- Concurrency posture must align with idempotency/concurrency rules (WFO-03).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Workflow Registry (canonical)`
2. `## w na`
3. `## f me`
4. `## typ`
5. `## trig`
6. `## ger`
7. `## featu`
8. `## re_id`
9. `## ner`
10. `## _se`

## 8. Cross-References

- Upstream: {{xref:ARC-03}} | OPTIONAL, {{xref:API-06}} | OPTIONAL, {{xref:ERR-01}} |
- OPTIONAL
- Downstream: {{xref:WFO-02}}, {{xref:WFO-03}}, {{xref:WFO-05}} | OPTIONAL,
- **{{xref:OBS-*}} | OPTIONAL**
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
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
