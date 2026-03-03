# API-02 — Endpoint Spec (per endpoint: request/response/auth/errors)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-02                                             |
| Template Type     | Build / API                                        |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with backend API endpoints            |
| Filled By         | Internal Agent                                     |
| Consumes          | API-01, APIG-01, APIG-02, PMAD-04, ERR-03, PFS-01, DATA-01, DATA-06, Standards Index |
| Produces          | Filled Per-Endpoint Spec                           |

## 2. Purpose

Provide the authoritative per-endpoint contract: request/response shape, auth requirements, validation rules, error cases with reason codes, pagination/filtering rules (if list), and side effects. This is what the build and tests implement.

## 3. Inputs Required

- API-01: `{{xref:API-01}}` | OPTIONAL
- APIG-01: `{{xref:APIG-01}}` | OPTIONAL
- APIG-02: `{{xref:APIG-02}}` | OPTIONAL
- PMAD-04: `{{xref:PMAD-04}}` | OPTIONAL
- ERR-03: `{{xref:ERR-03}}` | OPTIONAL
- PFS-01: `{{xref:PFS-01}}` | OPTIONAL
- DATA-01: `{{xref:DATA-01}}` | OPTIONAL
- DATA-06: `{{xref:DATA-06}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source       | UNKNOWN Allowed |
|-------------------------------------|--------------|-----------------|
| endpoint_id (must exist in API-01)  | API-01       | No              |
| method + path                       | API-01       | No              |
| purpose                             | spec         | No              |
| feature_id(s)                       | PRD          | No              |
| authn required + scheme             | spec         | No              |
| authz policy ref (PMAD)             | PMAD         | No              |
| request headers                     | spec         | Yes             |
| path params                         | spec         | Yes             |
| query params + PFS rules            | spec/PFS     | Yes             |
| body schema                         | DATA-06      | Yes             |
| success status code(s)              | spec         | No              |
| response schema                     | spec         | No              |
| pagination envelope (if list)       | spec         | Yes             |
| entities touched (reads/writes)     | DATA         | Yes             |
| events emitted                      | EVT          | Yes             |
| jobs triggered                      | JBS          | Yes             |
| error cases with reason_code        | ERR-02       | No              |
| rate limits class                   | RLIM         | Yes             |
| idempotency requirements            | WFO-03       | Yes             |
| observability fields                | spec         | Yes             |
| test requirements                   | spec         | Yes             |

## 5. Optional Fields

| Field Name | Source | Notes                          |
|------------|--------|--------------------------------|
| Examples   | spec   | Request/response examples      |
| Notes      | agent  | Enrichment only, no new truth  |

## 6. Rules

- Must comply with ERR-03 error payload shape.
- Must comply with APIG-01 naming + envelope standards.
- List endpoints must specify PFS rules: filters/sorts/pagination.
- Auth must be explicit; "protected" is not a spec.
- Every error case must map to a reason_code (or explicit fallback policy).

## 7. Output Format

### Required Headings (in order)

1. `## Endpoint Identity` — endpoint_id, method/path, purpose, feature IDs, owner, version
2. `## Auth` — authn scheme, authz policy ref
3. `## Request` — headers, path params, query params, PFS rules, body schema
4. `## Response` — success status, response schema, pagination envelope
5. `## Side Effects` — entities read/written, events emitted, jobs triggered
6. `## Error Cases` — Table: condition, http_status, reason_code, retryable, notes
7. `## Operational Controls` — rate limit class, idempotency
8. `## Observability` — required log fields, metrics
9. `## Tests` — contract tests, negative cases

## 8. Cross-References

- **Upstream**: API-01, PMAD-04, ERR-03, PFS-01
- **Downstream**: QA-02, APIG-05, RLIM-02
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                            | Beginner  | Intermediate | Expert   |
|------------------------------------|-----------|--------------|----------|
| Auth + request/response + errors   | Required  | Required     | Required |
| Side effects + PFS rules           | Optional  | Required     | Required |
| Idempotency + observability + tests| Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: examples, notes, events_emitted, jobs_triggered, rate_class, observability, tests
- If endpoint_id not found in API-01 → block Completeness Gate.
- If any error case lacks reason_code → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] all_endpoint_ids_exist_in_API_01 == true
- [ ] auth_present == true
- [ ] error_cases_have_reason_codes == true
- [ ] list_endpoints_have_PFS_rules == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
