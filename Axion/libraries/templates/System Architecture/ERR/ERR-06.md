# ERR-06 — Observability Requirements for

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ERR-06                                             |
| Template Type     | Architecture / Error Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring observability requirements for    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Observability Requirements for Document                         |

## 2. Purpose

Define the required observability fields and metrics for errors so failures can be diagnosed and
tracked consistently across services and boundaries. This covers log field schema, metric
dimensions, trace linkage, and redaction requirements.

## 3. Inputs Required

- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● OBS-01: {{xref:OBS-01}} | OPTIONAL
- ● OBS-02: {{xref:OBS-02}} | OPTIONAL
- ● OBS-03: {{xref:OBS-03}} | OPTIONAL
- ● DGP-01: {{xref:DGP-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Required log fields fo... | spec         | Yes             |
| Required metric events... | spec         | Yes             |
| Required trace linkage... | spec         | Yes             |
| Dimension/tag policy:     | spec         | Yes             |
| Redaction rules (PII)     | spec         | Yes             |
| Sampling/retention pol... | spec         | Yes             |
| Coverage checks (every... | spec         | Yes             |

## 5. Optional Fields

● Dashboard requirements | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Error logs must include reason_code + correlation_id at minimum.
- Do not emit high-cardinality identifiers as metric tags.
- PII must be redacted or omitted per DGP.
- Traces must link error occurrences to spans consistently.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Required Log Fields (required)`
2. `## field`
3. `## required`
4. `## description`
5. `## redaction_rule`
6. `## timestamp`
7. `## true`
8. `## service`
9. `## true`
10. `## endpoint_or_op true`

## 8. Cross-References

- Upstream: {{xref:OBS-01}} | OPTIONAL, {{xref:OBS-03}} | OPTIONAL, {{xref:DGP-01}} |
- OPTIONAL
- Downstream: {{xref:OBS-05}} | OPTIONAL, {{xref:ALRT-}} | OPTIONAL, {{xref:PERF-}} |
- OPTIONAL
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
