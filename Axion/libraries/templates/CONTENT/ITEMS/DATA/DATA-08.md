# DATA-08 — Data Access Patterns

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | DATA-08                                             |
| Template Type     | Data / Architecture                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring data access patterns    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Data Access Patterns Document                         |

## 2. Purpose

Define the allowed data access patterns: transaction boundaries, isolation levels, query shape
rules, read/write separation, and how services should access data consistently and safely
(especially under concurrency and caching).

## 3. Inputs Required

- ● DATA-03: {{xref:DATA-03}} | OPTIONAL
- ● BPLAT-04: {{xref:BPLAT-04}} | OPTIONAL
- ● CACHE-03: {{xref:CACHE-03}} | OPTIONAL
- ● WFO-03: {{xref:WFO-03}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Transaction policy:       | spec         | Yes             |
| ○ when to open transac... | spec         | Yes             |
| ○ max duration rule       | spec         | Yes             |
| ○ nesting policy          | spec         | Yes             |
| Isolation policy:         | spec         | Yes             |
| ○ default isolation level | spec         | Yes             |
| ○ when to elevate isol... | spec         | Yes             |
| ○ phantom/read anomali... | spec         | Yes             |
| Query boundary rules:     | spec         | Yes             |
| ○ service owns its DB ... | spec         | Yes             |
| ○ allowed join depth      | spec         | Yes             |
| ○ N+1 avoidance policy    | spec         | Yes             |

## 5. Optional Fields

● ORM-specific conventions | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Transaction boundaries must align with idempotency/concurrency rules (WFO-03).
- No cross-service DB reads unless explicitly approved and documented.
- Retry within transactions must be careful; define safe retry policy.
- Isolation elevation must be justified and limited.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Transaction Policy (required)`
2. `## 2) Isolation Policy (required)`
3. `## 3) Query Boundary Rules (required)`
4. `## 4) Write Patterns (required)`
5. `## 5) Read Patterns (required)`
6. `## 6) Error/Retry Alignment (required)`
7. `## 7) Verification Checklist (required)`

## 8. Cross-References

- Upstream: {{xref:WFO-03}} | OPTIONAL, {{xref:CACHE-03}} | OPTIONAL
- Downstream: {{xref:API-02}} | OPTIONAL, {{xref:BPLAT-01}} | OPTIONAL, {{xref:QA-03}}
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
