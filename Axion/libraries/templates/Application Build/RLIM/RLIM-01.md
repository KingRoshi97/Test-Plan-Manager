# RLIM-01 — Rate Limit Policy

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | RLIM-01                                          |
| Template Type     | Build / Rate Limits                              |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring rate limit policy         |
| Filled By         | Internal Agent                                   |
| Consumes          |                                                  |
| Produces          | Filled Rate Limit Policy                         |

## 2. Purpose

Define the single, canonical global rate limit policy: what surfaces are rate-limited, what scopes exist, how limits are computed and enforced, how bursts are handled, and how rate-limit decisions map to errors/status. This template must be consistent with standards and must not invent enforcement capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Rate-limited surfaces (API, WS, webhooks, jobs triggers, admin) | spec | No |
| Scope model (per IP / per user / per token / per org / per project / per route / per endpoint class) | spec | No |
| Identity keys used for enforcement (client identifiers) | spec | No |
| Limit units (req/sec, req/min, tokens/min, bytes/min, concurrent) | spec | No |
| Burst handling model (token bucket/leaky bucket/UNKNOWN) | spec | Yes |
| Enforcement actions (throttle, reject, slow, ban) | spec | No |
| Response behavior (headers + error mapping) | spec | No |
| Exemptions model (allowlists, internal services, admin) | spec | Yes |
| Override policy (who can change limits, audit requirements) | spec | No |
| Observability requirements (metrics, logs, dashboards, alerts) | spec | No |
| Abuse escalation linkage (bind to RLIM-03/RLIM-04 if present) | spec | Yes |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Per-surface default limits | spec | OPTIONAL |
| Geo-based policies | spec | OPTIONAL |
| Cost-based throttling | spec | OPTIONAL |
| Dynamic limit adjustments | spec | OPTIONAL |
| Open questions | spec | OPTIONAL |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not enumerate per-endpoint limits here; those belong in RLIM-02.
- Rate limit errors MUST map to: {{xref:API-03}} | OPTIONAL
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- If exemptions exist, they MUST be explicit and auditable.

## 7. Cross-References

- **Upstream**: {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} | OPTIONAL
- **Downstream**: {{xref:RLIM-02}}, {{xref:RLIM-03}}, {{xref:RLIM-04}}, {{xref:RLIM-06}} | OPTIONAL
- **Standards**: {{standards.rules[STD-NAMING]}} | OPTIONAL, {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL, {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 8. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Advanced |
|---|---|---|---|
| All sections | Required. Use UNKNOWN where enforcement details are missing; define scope model and 429 mapping. | Required. Define algorithm, headers, exemptions, and observability requirements. | Required. Add change control rigor and abuse escalation linkages. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, applies_in_envs, per_token, per_org, per_project, per_route, per_endpoint_class, token_rate, byte_rate, concurrency, burst_capacity, refill_rate, smoothing, throttle_behavior, ban_policy_ref, headers, body_policy, exempt_principals, exempt_routes, allowlist_policy, audit_required, audit_policy, rollout_rules, dashboards, alerts, signals_ref, actions_matrix_ref, open_questions
- If any Required Field is UNKNOWN, allow only if: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If scope.identity_key_rules is UNKNOWN → block Completeness Gate.
- If responses.status_code is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.RLIM
- **Pass conditions**:
  - [ ] required_fields_present == true
  - [ ] scope_model_defined == true
  - [ ] error_mapping_defined == true
  - [ ] placeholder_resolution == true
  - [ ] no_unapproved_unknowns == true

## 11. Output Format

