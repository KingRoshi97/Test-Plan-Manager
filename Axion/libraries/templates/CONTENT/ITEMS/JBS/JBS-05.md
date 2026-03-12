# JBS-05 — Idempotency & Concurrency for

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | JBS-05                                             |
| Template Type     | Build / Background Jobs                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring idempotency & concurrency for    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Idempotency & Concurrency for Document                         |

## 2. Purpose

Define job-specific idempotency keys, concurrency limits, locking scopes, and dedupe rules so
retries and parallel workers do not cause duplicate side effects or data corruption.

## 3. Inputs Required

- ● WFO-03: {{xref:WFO-03}} | OPTIONAL
- ● JBS-01: {{xref:JBS-01}} | OPTIONAL
- ● ERR-05: {{xref:ERR-05}} | OPTIONAL
- ● DATA-08: {{xref:DATA-08}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Job idempotency key po... | spec         | Yes             |
| ○ when required (all w... | spec         | Yes             |
| ○ key derivation rules    | spec         | Yes             |
| ○ TTL policy for keys     | spec         | Yes             |
| Job concurrency posture:  | spec         | Yes             |
| ○ default concurrency ... | spec         | Yes             |
| ○ per-job concurrency ... | spec         | Yes             |
| ○ per-entity/tenant pa... | spec         | Yes             |
| Locking rules:            | spec         | Yes             |
| ○ lock scope (entity_i... | spec         | Yes             |
| ○ lock timeout policy     | spec         | Yes             |
| Dedupe rules:             | spec         | Yes             |

## 5. Optional Fields

● Exactly-once disclaimer | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- No claims of exactly-once without proven semantics; default at-least-once with dedupe.
- Keys must be deterministic and stable for the job’s logical unit of work.
- Partition keys must align with data isolation rules (tenant boundaries).
- Locking must be minimal and avoid global locks unless justified.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Global Policy (required)`
2. `## 2) Job Concurrency & Idempotency Map (canonical)`
3. `## job_id`
4. `## idem`
5. `## _key_`
6. `## def`
7. `## key_`
8. `## ttl`
9. `## partitio`
10. `## n_key`

## 8. Cross-References

- Upstream: {{xref:WFO-03}} | OPTIONAL, {{xref:ERR-05}} | OPTIONAL
- Downstream: {{xref:JBS-06}} | OPTIONAL, {{xref:QA-03}} | OPTIONAL
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
