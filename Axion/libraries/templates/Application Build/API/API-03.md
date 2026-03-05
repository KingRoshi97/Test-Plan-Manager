# API-03 — Error & Status Code Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-03                                             |
| Template Type     | Build / API                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring error & status code policy    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Error & Status Code Policy Document                         |

## 2. Purpose

Define the enforceable policy for HTTP status codes and API error behavior: which statuses are
allowed, how status maps to error_class and reason_code, what clients may rely on, and what
must never be returned (leak prevention).

## 3. Inputs Required

- ● ERR-01: {{xref:ERR-01}} | OPTIONAL
- ● ERR-02: {{xref:ERR-02}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● APIG-06: {{xref:APIG-06}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Allowed success status... | spec         | Yes             |
| ○ GET (200)               | spec         | Yes             |
| ○ POST (201/200)          | spec         | Yes             |
| ○ PUT/PATCH (200/204)     | spec         | Yes             |
| ○ DELETE (200/204)        | spec         | Yes             |
| Allowed error status c... | spec         | Yes             |
| ○ 400/422 validation      | spec         | Yes             |
| ○ 401 unauthenticated     | spec         | Yes             |
| ○ 403 unauthorized        | spec         | Yes             |
| ○ 404 not found           | spec         | Yes             |
| ○ 409 conflict            | spec         | Yes             |
| ○ 429 rate limited        | spec         | Yes             |

## 5. Optional Fields

● Non-HTTP transports mapping (WS) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Must conform to ERR-03 payload contract for all non-2xx.
- Avoid 404 vs 403 leakage: policy must specify concealment stance.
- 422 vs 400 must be consistent (pick one for validation; define both only with rules).
- 5xx classification must be consistent with error taxonomy.
- Status codes must not be “chosen per endpoint” outside defined override policy.

## 7. Output Format

### Required Headings (in order)

1. `## 1) Success Codes by Method (required)`
2. `## method`
3. `## allowed_success_cod`
4. `## notes`
5. `## GET`
6. `## POST`
7. `## PUT`
8. `## PATCH`
9. `## DELETE`
10. `## 2) Error Status Codes Policy (required)`

## 8. Cross-References

- Upstream: {{xref:ERR-03}} | OPTIONAL, {{xref:ERR-01}} | OPTIONAL
- Downstream: {{xref:API-02}} | OPTIONAL, {{xref:API-07}} | OPTIONAL
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
