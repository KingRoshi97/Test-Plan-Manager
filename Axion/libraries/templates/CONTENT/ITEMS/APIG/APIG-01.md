# APIG-01 — API Standards (naming,

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | APIG-01                                             |
| Template Type     | Architecture / API Governance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring api standards (naming,    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled API Standards (naming, Document                         |

## 2. Purpose

Define the enforceable API standards for all endpoints: naming conventions, resource modeling,
request/response consistency, pagination/filtering/sorting rules, envelope patterns, error
handling shape, and compatibility expectations.

## 3. Inputs Required

- ● DMG-01: {{xref:DMG-01}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● APIG-02: {{xref:APIG-02}} | OPTIONAL
- ● PFS-01: {{xref:PFS-01}} | OPTIONAL
- ● RLIM-01: {{xref:RLIM-01}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Naming conventions:       | spec         | Yes             |
| ○ endpoint paths          | spec         | Yes             |
| ○ resource naming (sin... | spec         | Yes             |
| ○ query parameter naming  | spec         | Yes             |
| ○ header naming           | spec         | Yes             |
| Request/response stand... | spec         | Yes             |
| ○ envelope policy (yes... | spec         | Yes             |
| ○ consistent field nam... | spec         | Yes             |
| ○ timestamps format (ISO) | spec         | Yes             |
| ○ id fields naming        | spec         | Yes             |
| Pagination standard:      | spec         | Yes             |
| ○ cursor vs offset        | spec         | Yes             |

## 5. Optional Fields

● GraphQL standards | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Every endpoint must comply with naming and pagination standards if list returns.
- Error payload must comply with ERR-03.
- Filtering/sorting must be deterministic and documented.
- No breaking changes without versioning policy compliance (APIG-02/APIG-03).

## 7. Output Format

### Required Headings (in order)

1. `## 1) Naming Conventions (required)`
2. `## 2) Request/Response Standards (required)`
3. `## 3) Pagination Standard (required)`
4. `## 4) Filtering/Sorting Standard (required)`
5. `## 5) Error + Retry + Rate Limit Standards (required)`
6. `## 6) Compatibility Statement (required)`

## 8. Cross-References

- Upstream: {{xref:DMG-01}} | OPTIONAL, {{xref:ERR-03}} | OPTIONAL
- Downstream: {{xref:API-02}} | OPTIONAL, {{xref:APIG-04}} | OPTIONAL,
- **{{xref:APIG-05}} | OPTIONAL**
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
