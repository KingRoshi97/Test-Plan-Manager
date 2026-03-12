# API-02 — Endpoint Spec (per endpoint:

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-02                                             |
| Template Type     | Build / API                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring endpoint spec (per endpoint:    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Endpoint Spec (per endpoint: Document                         |

## 2. Purpose

Provide the authoritative per-endpoint contract: request/response shape, auth requirements,
validation rules, error cases with reason codes, pagination/filtering rules (if list), and side effects.
This is what the build and tests implement.

## 3. Inputs Required

- ● API-01: {{xref:API-01}} | OPTIONAL
- ● APIG-01: {{xref:APIG-01}} | OPTIONAL
- ● APIG-02: {{xref:APIG-02}} | OPTIONAL
- ● PMAD-04: {{xref:PMAD-04}} | OPTIONAL
- ● ERR-03: {{xref:ERR-03}} | OPTIONAL
- ● PFS-01: {{xref:PFS-01}} | OPTIONAL
- ● DATA-01: {{xref:DATA-01}} | OPTIONAL
- ● DATA-06: {{xref:DATA-06}} | OPTIONAL
- ● STANDARDS_INDEX: {{standards.index}} | OPTIONAL

## 4. Required Fields

For each endpoint spec block:
● endpoint_id (must exist in API-01)
● method + path
● purpose
● feature_id(s)
● auth:
○ authn required (yes/no + scheme)
○ authz policy ref (PMAD policy_id)
● request contract:
○ headers (required/optional)
○ path params (types)
○ query params (types) + PFS rules if list/search
○ body schema (fields/types) OR schema ref (DATA-06)

● response contract:
○ success status code(s)
○ response schema (fields/types)
○ pagination envelope (if list)
● side effects:
○ entities touched (reads/writes)
○ events emitted (EVT ids) | OPTIONAL
○ background jobs triggered (WFO/JBS ids) | OPTIONAL
● error cases:
○ list of failure conditions
○ http_status
○ reason_code (ERR-02)
○ retryability posture (ERR-05) | OPTIONAL
● rate limits class (RLIM) | OPTIONAL
● idempotency requirements (WFO-03/ERR-05) for writes | OPTIONAL
● observability requirements (required log fields) | OPTIONAL
● test requirements (contract tests) | OPTIONAL

## 5. Optional Fields

● Examples (request/response) | OPTIONAL
● Notes | OPTIONAL

## 6. Rules

- Must comply with ERR-03 error payload shape.
- Must comply with APIG-01 naming + envelope standards.
- List endpoints must specify PFS rules: filters/sorts/pagination.
- Auth must be explicit; “protected” is not a spec.
- Every error case must map to a reason_code (or explicit fallback policy).

## 7. Output Format

### Required Headings (in order)

1. `## Endpoint Spec Blocks (repeat; one per endpoint_id)`
2. `## Auth`
3. `## Request`
4. `## Body fields (if inline):`
5. `## field`
6. `## type`
7. `## required`
8. `## st.body_fields[0] est.body_fields[`
9. `## .name}}`
10. `## 0].type}}`

## 8. Cross-References

- Upstream: {{xref:API-01}} | OPTIONAL, {{xref:PMAD-04}} | OPTIONAL, {{xref:ERR-03}} |
- **OPTIONAL, {{xref:PFS-01}} | OPTIONAL**
- Downstream: {{xref:QA-02}} | OPTIONAL, {{xref:APIG-05}} | OPTIONAL,
- **{{xref:RLIM-02}} | OPTIONAL**
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
