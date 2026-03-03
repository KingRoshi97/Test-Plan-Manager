# API-01 — Endpoint Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-01                                             |
| Template Type     | Build / API                                        |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring a backend API surface       |
| Filled By         | Internal Agent                                     |
| Consumes          | PRD-04, MAP-02, APIG-01, PMAD-02, ERR-02, ERR-03, DATA-01, PFS-01, Standards Index |
| Produces          | Filled Endpoint Catalog                            |

## 2. Purpose

Define the canonical inventory of backend endpoints (HTTP + internal-only surfaces if applicable): what exists, what feature it supports, what auth applies, what entities it touches, and what contract docs must exist for it. This is the source list used to generate per-endpoint specs, tests, and mapping.

## 3. Inputs Required

- PRD-04: `{{xref:PRD-04}}` | OPTIONAL
- MAP-02: `{{xref:MAP-02}}` | OPTIONAL
- APIG-01: `{{xref:APIG-01}}` | OPTIONAL
- PMAD-02: `{{xref:PMAD-02}}` | OPTIONAL
- ERR-02: `{{xref:ERR-02}}` | OPTIONAL
- ERR-03: `{{xref:ERR-03}}` | OPTIONAL
- DATA-01: `{{xref:DATA-01}}` | OPTIONAL
- PFS-01: `{{xref:PFS-01}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                          | Source         | UNKNOWN Allowed |
|-------------------------------------|----------------|-----------------|
| Endpoint list (min 20 or justified) | spec/arch      | No              |
| endpoint_id (stable)                | spec           | No              |
| method                              | spec           | No              |
| path                                | spec           | No              |
| title                               | spec           | No              |
| purpose                             | spec           | No              |
| feature_id(s) served                | PRD-04         | No              |
| endpoint_kind                       | spec           | No              |
| authn required                      | spec           | No              |
| authz policy_id                     | PMAD           | No (if authn)   |
| request_schema_ref                  | API-02/DATA-06 | Yes             |
| response_schema_ref                 | API-02         | Yes             |
| entities_read                       | DATA           | Yes             |
| entities_written                    | DATA           | Yes             |
| list/query capable                  | spec           | No              |
| pfs_profile_ref                     | PFS            | Yes (if not list)|
| idempotency_required                | spec           | Yes             |
| rate_limit_ref                      | RLIM           | Yes             |
| error_contract                      | ERR-03         | No              |
| owner_boundary                      | SBDT           | Yes             |
| versioning                          | APIG-02        | Yes             |

## 5. Optional Fields

| Field Name            | Source | Notes                             |
|-----------------------|--------|-----------------------------------|
| Deprecation status    | spec   | active/deprecated/sunset date     |
| Notes                 | agent  | Enrichment only, no new truth     |

## 6. Rules

- Must comply with APIG-01 naming/envelope and ERR-03 error payload.
- If endpoint_kind == admin, it must also appear in ADMIN-05.
- If list/query capable == true, PFS contract binding is required (PFS-01/02/03/04).
- Any state mutation endpoint must have an idempotency stance (required or explicitly not supported with rationale).
- Do not duplicate semantics via multiple endpoints with minor differences; use query contracts or versioning.

## 7. Output Format

### Required Headings (in order)

1. `## Endpoint Catalog` — Table with columns: endpoint_id, kind, method, path, title, feature_ids, authn, policy_id, entities_read, entities_written, list_query, pfs_ref, idem_required, rate_ref, err_contract, owner, version, deprecation, notes
2. `## Coverage Checks` — endpoint_ids unique, method+path unique, feature mapping complete, authz refs complete, pfs bound for list endpoints, idempotency stance for mutation endpoints

## 8. Cross-References

- **Upstream**: APIG-01, PMAD-02, ERR-03
- **Downstream**: API-02 (per endpoint spec), API-05 (rate binding), QA-02 (contract tests)
- **Standards**: STD-NAMING, STD-SECURITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| kind/method/path/title     | Required  | Required     | Required |
| policy_id + entities       | Optional  | Required     | Required |
| PFS + idempotency + coverage| Optional | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: pfs_profile_ref (only if list_query == false), rate_limit_ref, owner_boundary, versioning, deprecation_status, notes
- If authn required and policy_id is UNKNOWN → block Completeness Gate.
- If list_query == true and pfs_ref is UNKNOWN → block Completeness Gate.
- If endpoint is mutation and idem_required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] endpoints_count >= 20 (or justified)
- [ ] unique_method_path == true
- [ ] feature_mapping_complete == true
- [ ] policy_complete == true
- [ ] pfs_bound == true
- [ ] idem_stance_present == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
