# DQV-04 — Consistency & Integrity

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DQV-04                                             |
| Template Type     | Data / Quality                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring consistency & integrity    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Consistency & Integrity Document                         |

## 2. Purpose

Define how the system monitors data consistency and integrity over time: drift detection,
anomaly detection, referential integrity monitoring, and alerting/escalation when data quality
degrades.

## 3. Inputs Required

- ● DQV-02: {{xref:DQV-02}} | OPTIONAL
- ● OBS-02: {{xref:OBS-02}} | OPTIONAL
- ● ALRT-01: {{xref:ALRT-01}} | OPTIONAL
- ● RELIA-01: {{xref:RELIA-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Monitoring signals cat... | spec         | Yes             |
| For each signal:          | spec         | Yes             |
| ○ signal_id               | spec         | Yes             |
| ○ target entity/dataset   | spec         | Yes             |
| ○ signal type (drift/a... | spec         | Yes             |
| ○ metric definition       | spec         | Yes             |
| ○ baseline expectation    | spec         | Yes             |
| ○ thresholds (warning/... | spec         | Yes             |
| ○ window                  | spec         | Yes             |
| ○ detection frequency     | spec         | Yes             |
| ○ alert routing (who g... | spec         | Yes             |

## 5. Optional Fields

● Statistical methods notes | OPTIONAL

● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Thresholds must be explicit; no “alert if bad.”
- Signals must map to alert routes and actions.
- Monitoring must avoid high-cardinality metrics that explode cost.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Monitoring Signals (canonical)`
3. `## targe`
4. `## type`
5. `## metri`
6. `## baseli`
7. `## warn`
8. `## critic`
9. `## windo`
10. `## freq`

## 8. Cross-References

- Upstream: {{xref:DQV-02}} | OPTIONAL, {{xref:OBS-02}} | OPTIONAL
- Downstream: {{xref:DQV-05}} | OPTIONAL, {{xref:PIPE-04}} | OPTIONAL, {{xref:IRP-*}} |
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
