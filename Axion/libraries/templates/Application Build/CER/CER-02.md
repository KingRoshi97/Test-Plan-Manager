# CER-02 — Error Display Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-02                                           |
| Template Type     | Build / Error Handling                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring error display rules       |
| Filled By         | Internal Agent                                   |
| Consumes          | API-03, FE-07, RLIM-01                           |
| Produces          | Filled Error Display Rules                       |

## 2. Purpose

Define the canonical retry and recovery patterns used by the client, mapped per error class (network, 5xx, 429, timeouts, auth expiry, conflicts). Includes backoff rules, retry limits, user prompts, and safe recovery actions. This template must be consistent with API error policy and rate limit guidance and must not invent retry behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- API-03 Error & Status Code Policy: `{{api.error_policy}}` | OPTIONAL
- FE-07 Error UX: `{{fe.error_ux}}` | OPTIONAL
- RLIM-01 Rate Limit Policy: `{{rlim.policy}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Error classes covered | network, timeout, 5xx, 429, 401, 403, 409 |
| Retry eligibility rules | Which errors retry |
| Backoff policy | exponential/jitter/UNKNOWN |
| Max retry attempts | By class |
| Retry-after handling (429) | Rate limit compliance |
| User prompt rules | When to show retry vs auto |
| Recovery actions | Re-auth, refresh, navigate away |
| Circuit breaker rules | Stop retrying |
| Telemetry requirements | Retry counts, recovery outcomes |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| Per-endpoint overrides | OPTIONAL |
| Background retry rules | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Rate limit handling MUST follow `{{xref:RLIM-01}}` guidance.
- Auth expiry handling MUST bind to `{{xref:CER-04}}` when present.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:API-03}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:CER-03}}`, `{{xref:CER-04}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define retryable classes and max attempts; use UNKNOWN for backoff numeric values. |
| intermediate | Required. Define backoff policy and UX prompt rules including 429 handling. |
| advanced | Required. Add circuit breaker and per-endpoint override strategy. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, retry conditions, base/max delay, timeout/auth attempts, 429 header name/fallback delay, offline UI rule, refresh/navigate actions, breaker details, telemetry fields, overrides/background rules, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If backoff.policy is UNKNOWN → block Completeness Gate.
- If attempts.network is UNKNOWN → block Completeness Gate.
- If rate.retry_after_respected is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.CER
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] retry_and_backoff_defined == true
- [ ] attempt_limits_defined == true
- [ ] rate_limit_handling_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

