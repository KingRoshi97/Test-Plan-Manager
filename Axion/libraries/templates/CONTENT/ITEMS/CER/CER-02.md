# CER-02 — Retry & Recovery Patterns (per error class)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CER-02                                             |
| Template Type     | Build / Client Error Recovery                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring retry & recovery patterns (per error class)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Retry & Recovery Patterns (per error class) Document                         |

## 2. Purpose

Define the canonical retry and recovery patterns used by the client, mapped per error class
(network, 5xx, 429, timeouts, auth expiry, conflicts). Includes backoff rules, retry limits, user
prompts, and safe recovery actions. This template must be consistent with API error policy and
rate limit guidance and must not invent retry behaviors not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- API-03 Error & Status Code Policy: {{api.error_policy}} | OPTIONAL
- FE-07 Error UX: {{fe.error_ux}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Retry eligibility rule... | spec         | Yes             |
| Backoff policy (expone... | spec         | Yes             |
| Max retry attempts (by... | spec         | Yes             |
| Retry-after handling (... | spec         | Yes             |
| User prompt rules (whe... | spec         | Yes             |
| Recovery actions (re-a... | spec         | Yes             |
| Circuit breaker rules ... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Per-endpoint overrides | OPTIONAL
Background retry rules | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Rate limit handling MUST follow {{xref:RLIM-01}} guidance.
Auth expiry handling MUST bind to {{xref:CER-04}} when present.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Error Classes
classes:
network: {{classes.network}}
timeout: {{classes.timeout}}
server_5xx: {{classes.server_5xx}}
rate_limit_429: {{classes.rate_limit_429}}
auth_401: {{classes.auth_401}}
forbidden_403: {{classes.forbidden_403}}
conflict_409: {{classes.conflict_409}}
2. Retry Eligibility
retryable_classes: {{retry.retryable_classes}}
non_retryable_classes: {{retry.non_retryable_classes}} | OPTIONAL
retry_conditions: {{retry.conditions}} | OPTIONAL
3. Backoff Policy
policy: {{backoff.policy}} (exponential/jitter/UNKNOWN)
base_delay_ms: {{backoff.base_delay_ms}} | OPTIONAL
max_delay_ms: {{backoff.max_delay_ms}} | OPTIONAL
4. Max Attempts (by Class)
network_max_attempts: {{attempts.network}}
timeout_max_attempts: {{attempts.timeout}} | OPTIONAL
server_5xx_max_attempts: {{attempts.server_5xx}}
rate_limit_429_max_attempts: {{attempts.rate_limit_429}}
auth_401_max_attempts: {{attempts.auth_401}} | OPTIONAL
5. 429 Retry-After Handling
retry_after_respected: {{rate.retry_after_respected}}
header_name: {{rate.header_name}} | OPTIONAL
fallback_delay_ms: {{rate.fallback_delay_ms}} | OPTIONAL
6. User Prompts
auto_retry_rule: {{ux.auto_retry_rule}}
show_retry_cta_rule: {{ux.show_retry_cta_rule}}
show_offline_ui_rule: {{ux.show_offline_ui_rule}} | OPTIONAL
7. Recovery Actions
re_auth_action: {{recovery.re_auth_action}}
refresh_action: {{recovery.refresh_action}} | OPTIONAL
navigate_away_action: {{recovery.navigate_away_action}} | OPTIONAL

8. Circuit Breaker
breaker_supported: {{breaker.supported}}
breaker_trigger: {{breaker.trigger}} | OPTIONAL
cooldown_ms: {{breaker.cooldown_ms}} | OPTIONAL
9. Telemetry
retry_attempt_metric: {{telemetry.retry_attempt_metric}}
recovery_outcome_metric: {{telemetry.recovery_outcome_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
10.References
API error policy: {{xref:API-03}} | OPTIONAL
Error UX: {{xref:FE-07}} | OPTIONAL
Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
Session expiry handling: {{xref:CER-04}} | OPTIONAL
Cross-References
Upstream: {{xref:API-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:CER-03}}, {{xref:CER-04}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define retryable classes and max attempts; use UNKNOWN for backoff
numeric values.
intermediate: Required. Define backoff policy and UX prompt rules including 429 handling.
advanced: Required. Add circuit breaker and per-endpoint override strategy.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, retry conditions, base/max delay,
timeout/auth attempts, 429 header name/fallback delay, offline UI rule, refresh/navigate actions,
breaker details, telemetry fields, overrides/background rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If backoff.policy is UNKNOWN → block Completeness Gate.
If attempts.network is UNKNOWN → block Completeness Gate.
If rate.retry_after_respected is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.CER
Pass conditions:
required_fields_present == true
retry_and_backoff_defined == true
attempt_limits_defined == true
rate_limit_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

CER-03

CER-03 — Offline/Error Mode UX (degraded experiences)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Rate limit handling MUST follow {{xref:RLIM-01}} guidance.**
- **Auth expiry handling MUST bind to {{xref:CER-04}} when present.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Error Classes`
2. `## classes:`
3. `## Retry Eligibility`
4. `## Backoff Policy`
5. `## Max Attempts (by Class)`
6. `## 429 Retry-After Handling`
7. `## User Prompts`
8. `## Recovery Actions`
9. `## Circuit Breaker`
10. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:API-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:CER-03}}, {{xref:CER-04}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
