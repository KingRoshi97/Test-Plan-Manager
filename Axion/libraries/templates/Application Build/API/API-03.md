# API-03 — Error & Status Code Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | API-03                                             |
| Template Type     | Build / API                                        |
| Template Version  | 1.0.0                                              |
| Applies           | All projects with backend API endpoints            |
| Filled By         | Internal Agent                                     |
| Consumes          | ERR-01, ERR-02, ERR-03, APIG-01, APIG-06, Standards Index |
| Produces          | Filled Error & Status Code Policy                  |

## 2. Purpose

Define the enforceable policy for HTTP status codes and API error behavior: which statuses are allowed, how status maps to error_class and reason_code, what clients may rely on, and what must never be returned (leak prevention).

## 3. Inputs Required

- ERR-01: `{{xref:ERR-01}}` | OPTIONAL
- ERR-02: `{{xref:ERR-02}}` | OPTIONAL
- ERR-03: `{{xref:ERR-03}}` | OPTIONAL
- APIG-01: `{{xref:APIG-01}}` | OPTIONAL
- APIG-06: `{{xref:APIG-06}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name                             | Source  | UNKNOWN Allowed |
|----------------------------------------|---------|-----------------|
| Success status codes by method         | spec    | No              |
| Error status codes and when used       | spec    | No              |
| Status mapping table                   | ERR     | No              |
| Reason-code override policy            | ERR-02  | No              |
| "Never return" list                    | spec    | No              |
| Client contract statements             | spec    | No              |
| Verification checklist                 | spec    | No              |

## 5. Optional Fields

| Field Name                  | Source | Notes                            |
|-----------------------------|--------|----------------------------------|
| Non-HTTP transports (WS)    | spec   | WebSocket status mapping         |
| Notes                       | agent  | Enrichment only, no new truth    |

## 6. Rules

- Must conform to ERR-03 payload contract for all non-2xx.
- Avoid 404 vs 403 leakage: policy must specify concealment stance.
- 422 vs 400 must be consistent (pick one for validation; define both only with rules).
- 5xx classification must be consistent with error taxonomy.
- Status codes must not be "chosen per endpoint" outside defined override policy.

## 7. Output Format

### Required Headings (in order)

1. `## Success Codes by Method` — Table: method, allowed_success_codes, notes
2. `## Error Status Codes Policy` — Table: status, when_used, error_class, notes
3. `## Status Mapping Table` — Table: error_class, default_status, allowed_overrides, notes
4. `## Reason-Code Override Policy` — overrides allowed when, documentation, guardrails
5. `## Never Return` — list of forbidden responses
6. `## Client Contract Statements` — stable guarantees, non-guarantees
7. `## Verification Checklist` — validation checks

## 8. Cross-References

- **Upstream**: ERR-03, ERR-01
- **Downstream**: API-02, API-07
- **Standards**: STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section                              | Beginner  | Intermediate | Expert   |
|--------------------------------------|-----------|--------------|----------|
| Success codes + basic error statuses | Required  | Required     | Required |
| Mapping table + never-return         | Optional  | Required     | Required |
| Override policy + client contract    | Optional  | Optional     | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: ws_mapping, notes
- If status mapping table is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] success_codes_defined == true
- [ ] error_codes_policy_defined == true
- [ ] mapping_table_present == true
- [ ] payload_contract_compliance == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
