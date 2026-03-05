# SRCH-03 — Index Update Strategy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SRCH-03                                             |
| Template Type     | Data / Search                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring index update strategy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Index Update Strategy Document                         |

## 2. Purpose

Define how search indexes are updated and kept consistent: synchronous vs asynchronous
updates, event-driven indexing, reindex procedures, failure handling, and verification. This
prevents stale search, index drift, and undefined reindex behavior.

## 3. Inputs Required

- ● SRCH-01: {{xref:SRCH-01}} | OPTIONAL
- ● DGL-02: {{xref:DGL-02}} | OPTIONAL
- ● WFO-01: {{xref:WFO-01}} | OPTIONAL
- ● EVT-01: {{xref:EVT-01}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Index inventory (minim... | spec         | Yes             |
| For each index:           | spec         | Yes             |
| ○ index_id                | spec         | Yes             |
| ○ entity types covered    | spec         | Yes             |
| ○ update mode (sync/as... | spec         | Yes             |
| ○ triggers (write even... | spec         | Yes             |
| ○ pipeline steps (extr... | spec         | Yes             |
| ○ freshness target (se... | spec         | Yes             |
| ○ failure posture (ret... | spec         | Yes             |
| ○ idempotency/dedupe rule | spec         | Yes             |
| ○ permissions enforcem... | spec         | Yes             |
| ○ observability signal... | spec         | Yes             |

## 5. Optional Fields

● Blue/green index swap strategy | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Any async indexing must specify freshness targets and lag monitoring.
- Updates must be idempotent and deduped.
- Permissions must be enforced at index time or query time (explicit choice).
- Reindex must be safe and verifiable; no “rebuild it and hope.”

## 7. Output Format

### Required Headings (in order)

1. `## 1) Index Inventory (canonical)`
2. `## ind`
3. `## ex_i`
4. `## entities`
5. `## update`
6. `## _mode`
7. `## trigger`
8. `## freshne`
9. `## ss_targ`
10. `## failure`

## 8. Cross-References

- Upstream: {{xref:DGL-02}} | OPTIONAL, {{xref:WFO-01}} | OPTIONAL, {{xref:ERR-05}} |
- OPTIONAL
- Downstream: {{xref:SRCH-04}}, {{xref:SRCH-06}} | OPTIONAL, {{xref:OBS-04}} |
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
