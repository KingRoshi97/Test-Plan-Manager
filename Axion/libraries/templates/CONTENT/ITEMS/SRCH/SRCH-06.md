# SRCH-06 — Search Observability (metrics,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SRCH-06                                             |
| Template Type     | Data / Search                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring search observability (metrics,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Search Observability (metrics, Document                         |

## 2. Purpose

Define the required observability and evaluation signals for search: query metrics, latency, index
lag, relevance evaluation, logging fields (redacted), dashboards, and alerting thresholds.

## 3. Inputs Required

- ● SRCH-03: {{xref:SRCH-03}} | OPTIONAL
- ● SRCH-04: {{xref:SRCH-04}} | OPTIONAL
- ● OBS-01: {{xref:OBS-01}} | OPTIONAL
- ● OBS-02: {{xref:OBS-02}} | OPTIONAL
- ● OBS-05: {{xref:OBS-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Applicability (true/fa... | spec         | Yes             |
| Metrics catalog (minim... | spec         | Yes             |
| ○ query_count             | spec         | Yes             |
| ○ p50/p95 latency         | spec         | Yes             |
| ○ zero_results_rate       | spec         | Yes             |
| ○ clickthrough/engagem... | spec         | Yes             |
| ○ index_lag               | spec         | Yes             |
| ○ reindex_failures        | spec         | Yes             |
| ○ dedupe_rate             | spec         | Yes             |
| ○ abuse blocks            | spec         | Yes             |
| Logging field schema:     | spec         | Yes             |
| ○ query_id                | spec         | Yes             |

## 5. Optional Fields

● Experimentation hooks pointer | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- If applies == false, include 00_NA block only.
- Do not log raw PII queries; define redaction/hashing.
- Metrics tags must avoid high-cardinality identifiers.
- Alerts must be tied to thresholds and routed.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Applicability`
2. `## 2) Metrics Catalog (canonical)`
3. `## metric`
4. `## type`
5. `## definition`
6. `## tags_allowed`
7. `## target`
8. `## notes`
9. `## search_querie`
10. `## s_total`

## 8. Cross-References

- Upstream: {{xref:SRCH-04}} | OPTIONAL, {{xref:OBS-01}} | OPTIONAL
- Downstream: {{xref:ALRT-}} | OPTIONAL, {{xref:EXPER-}} | OPTIONAL
- Standards: {{standards.rules[STD-PRIVACY]}} | OPTIONAL,
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
