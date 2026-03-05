# ERR-05 — Retryability & Idempotency

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ERR-05                                             |
| Template Type     | Architecture / Error Model                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring retryability & idempotency    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Retryability & Idempotency Document                         |

## 2. Purpose

Define deterministic retryability rules across the system: which error classes/reason codes are
retryable, under what conditions, what backoff is used, and what idempotency guarantees are
required to safely retry without duplicating side effects.

## 3. Inputs Required

- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● WFO-03: {{xref:WFO-03}} | OPTIONAL
- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● SIC-05: {{xref:SIC-05}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Retryability rules by ... | spec         | Yes             |
| Reason-code overrides ... | spec         | Yes             |
| Idempotency requirements: | spec         | Yes             |
| ○ which operations mus... | spec         | Yes             |
| ○ idempotency key format  | spec         | Yes             |
| ○ key scope (subject/r... | spec         | Yes             |
| ○ storage/ttl rules (h... | spec         | Yes             |
| Backoff rules:            | spec         | Yes             |
| ○ base delay              | spec         | Yes             |
| ○ multiplier              | spec         | Yes             |
| ○ max delay               | spec         | Yes             |
| ○ jitter                  | spec         | Yes             |

## 5. Optional Fields

● UI retry behavior pointer (DES-07) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Never retry non-idempotent operations unless an idempotency key is enforced.
- Client retries must be bounded; avoid retry storms.
- Server retries (jobs/webhooks) must use DLQ/quarantine after max attempts.
- Retry behavior must be consistent across endpoints; overrides must be explicit.
- Any retryable reason_code must specify whether retry is automatic or user-initiated.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Defaults (required)`
2. `## 2) Retryability by Error Class (required)`
3. `## error_class`
4. `## default_retryable`
5. `## notes`
6. `## validation`
7. `## false`
8. `## domain_rule`
9. `## false`
10. `## authz`

## 8. Cross-References

- Upstream: {{xref:WFO-03}} | OPTIONAL, {{xref:APIG-01}} | OPTIONAL, {{xref:SIC-05}} |
- OPTIONAL
- Downstream: {{xref:DES-07}} | OPTIONAL, {{xref:WFO-05}} | OPTIONAL, {{xref:QA-04}}
- | OPTIONAL
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
