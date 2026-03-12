# DQV-02 — Data Quality Checks Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DQV-02                                             |
| Template Type     | Data / Quality                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data quality checks catalog    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Quality Checks Catalog Document                         |

## 2. Purpose

Define the catalog of data quality checks that continuously validate correctness, completeness,
and integrity of stored data. These checks detect drift, corruption, and broken invariants over
time.

## 3. Inputs Required

- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DATA-03: {{xref:DATA-03}} | OPTIONAL
- ● DQV-01: {{xref:DQV-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● OBS-02: {{xref:OBS-02}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

● Applicability (true/false). If false, mark N/A.
● DQ check catalog (minimum 25 checks)
● For each check:
○ dq_id
○ entity_id/dataset_id
○ check_type (completeness/validity/uniqueness/referential/freshness)
○ rule description (predicate)
○ threshold (allowed failure rate)
○ schedule (cron/streaming/on-write)
○ owner
○ alerting severity
○ failure action (alert/quarantine/stop pipeline)
○ reason_code (if user-impacting) | OPTIONAL
○ metric name (for tracking)
● Reporting format (DQ report contents)

## 5. Optional Fields

● Auto-repair strategies | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Each check must be measurable and produce a metric.
- Thresholds must be explicit; “should be good” is not allowed.
- Any “stop pipeline” action must have an escalation path.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) DQ Checks Catalog (canonical)`
3. `## target`
4. `## chec`
5. `## k_typ`
6. `## rule`
7. `## thresh`
8. `## old`
9. `## schedu`
10. `## owner`

## 8. Cross-References

- Upstream: {{xref:DQV-01}} | OPTIONAL, {{xref:DATA-03}} | OPTIONAL
- Downstream: {{xref:DQV-04}}, {{xref:DQV-05}}, {{xref:ALRT-*}} | OPTIONAL
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
