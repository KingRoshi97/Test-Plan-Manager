# SBDT-04 — Scaling Model

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SBDT-04                                             |
| Template Type     | Architecture / Deployment                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring scaling model    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Scaling Model Document                         |

## 2. Purpose

Define the scaling strategy and capacity assumptions: how each major component scales, what
bottlenecks exist, what capacity targets are assumed, and what triggers scaling or
re-architecture decisions.

## 3. Inputs Required

- ● SBDT-02: {{xref:SBDT-02}} | OPTIONAL
- ● PERF-02: {{xref:PERF-02}} | OPTIONAL
- ● LOAD-01: {{xref:LOAD-01}} | OPTIONAL
- ● COST-01: {{xref:COST-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Scaling assumptions:      | spec         | Yes             |
| ○ peak concurrent users   | spec         | Yes             |
| ○ request rate            | spec         | Yes             |
| ○ message rate (if rea... | spec         | Yes             |
| ○ storage growth          | spec         | Yes             |
| Component scaling plan... | spec         | Yes             |
| ○ scaling axis (CPU/me... | spec         | Yes             |
| ○ horizontal vs vertic... | spec         | Yes             |
| ○ known bottlenecks       | spec         | Yes             |
| ○ caching strategy tou... | spec         | Yes             |
| Trigger thresholds (wh... | spec         | Yes             |

## 5. Optional Fields

● Future multi-region scaling notes | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Assumptions must be explicitly stated; “unknown” must include a plan to measure.
- Scaling triggers must be measurable (p95 latency, queue depth, CPU, error rate).
- Bottlenecks must map to mitigation actions (cache, partition, queue, optimize).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Capacity Assumptions (required if applies)`
3. `## 3) Component Scaling Plan (required if applies)`
4. `## compon`
5. `## ent_id`
6. `## scaling_`
7. `## axis`
8. `## strategy`
9. `## (H/V)`
10. `## bottlenecks`

## 8. Cross-References

- Upstream: {{xref:SBDT-02}} | OPTIONAL, {{xref:PERF-02}} | OPTIONAL,
- **{{xref:COST-01}} | OPTIONAL**
- Downstream: {{xref:PERF-05}} | OPTIONAL, {{xref:RELIA-02}} | OPTIONAL,
- **{{xref:OPS-05}} | OPTIONAL**
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
