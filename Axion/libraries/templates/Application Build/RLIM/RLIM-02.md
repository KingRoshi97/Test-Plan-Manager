# RLIM-02 — Rate Limit Catalog

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-02                                          |
| Template Type     | Build / Rate Limits                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring rate limit catalog        |
| Filled By         | Internal Agent                                   |
| Consumes          | RLIM-01, API-01                                  |
| Produces          | Filled Rate Limit Catalog                        |

## 2. Purpose

Create the canonical catalog of concrete rate limits applied across surfaces and endpoints, including scope keys, units, burst settings, and enforcement actions. This document must be consistent with the global rate limit policy and the endpoint catalog and must not invent endpoint IDs or limit classes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Catalog index (list of limit entries) | spec | No |
| limit_id (stable identifier) | spec | No |
| surface (api/ws/webhook/jobs/admin) | spec | No |
| target binding (endpoint_id / route pattern / consumer_id / producer_id) | spec | Yes |
| scope (per_ip/per_user/per_org/per_project/per_token/etc.) | spec | No |
| unit (req/min, req/sec, bytes/min, concurrent, etc.) | spec | No |
| limit value (number) | spec | No |
| burst configuration (capacity/refill) or pointer to RLIM-01 defaults | spec | Yes |
| enforcement action (reject/throttle/slow/ban) | spec | No |
| error mapping (status + error_code pointer to API-03) | spec | Yes |
| exemptions reference (allowlist) | spec | Yes |
| observability tags (labels to attach) | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Time-window overrides | spec | OPTIONAL |
| Environment overrides (dev/stage/prod) | spec | OPTIONAL |
| Per-tenant overrides | spec | OPTIONAL |
| Feature flag gating | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not invent endpoint_id; bindings MUST reference API-01 (or be UNKNOWN flagged).
- Limit behavior MUST be consistent with RLIM-01 (scopes, units, headers, enforcement).
- Error mapping MUST follow {{xref:API-03}} | OPTIONAL
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Each limit_id MUST be unique.

## 7. Cross-References

- **Upstream**: {{xref:RLIM-01}}, {{xref:API-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RLIM-03}}, {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN for targets if missing; do not invent endpoint IDs. | Required. Populate limits with concrete scopes/units/values consistent with RLIM-01. | Required. Add env/tenant overrides and observability tags with controlled cardinality. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, target_type, target_ref (only if binding is missing), burst_capacity, refill_rate, error_code, status_code, headers_policy, env_overrides, tenant_overrides, exemptions_ref, feature_flag, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If limit_id is UNKNOWN → block Completeness Gate.
- If surface is UNKNOWN → block Completeness Gate.
- If target_type == endpoint_id and target_ref is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.RLIM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] all limit_ids are unique
  - [ ] all endpoint_id targets exist in API-01 (no new IDs introduced)
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

