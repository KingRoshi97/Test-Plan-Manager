# IXS-03 — Authentication & Credential Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-03                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring authentication & credenti |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, IXS-02, API-05                           |
| Produces          | Filled Authentication & Credential Spec          |

## 2. Purpose

Define the canonical connectivity and network policy for integrations: allowed destinations, network timeouts, retry/backoff behavior, DNS/TLS requirements, and handling for degraded connectivity. This template must be consistent with integration specs and must not invent external destinations not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}`
- IXS-02 Integration Specs: `{{ixs.integration_specs}}` | OPTIONAL
- API-05 Rate Limit & Abuse Controls: `{{api.rate_limits}}` | OPTIONAL
- CER-02 Retry & Recovery Patterns: `{{cer.retry_patterns}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Destination allowlist policy | Domains/IPs |
| TLS requirements | Min version, cert validation |
| Timeout policy | Connect/read/total |
| Retry policy | Retryable failures, backoff |
| Circuit breaker policy | Stop trying |
| Concurrency limits | Per integration |
| Outbound proxy/VPC egress notes | If applicable |
| Inbound connectivity requirements | Webhook exposure, IP allowlist |
| DNS policy | Caching, failover |
| Telemetry requirements | Latency, failures by destination |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Regional routing policy | OPTIONAL |
| Pinned certs / mTLS notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- No outbound connectivity to non-allowlisted destinations.
- Retries MUST not amplify incidents; use backoff and circuit breaker rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}`, `{{xref:IXS-02}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-06}}`, `{{xref:IXS-07}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Define allowlist + timeouts + basic retry; use UNKNOWN for mTLS/regional routing.
- **intermediate**: Required. Define backoff, breaker, concurrency, and inbound webhook exposure rules.
- **advanced**: Required. Add per-integration overrides, DNS failover specifics, and telemetry fields rigor.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, ips, per-integration overrides, mTLS/pins, read timeout, max attempts, breaker details, per-integration limits, inbound options, dns failover, telemetry fields, regional routing, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `allowlist.domains` is UNKNOWN → block Completeness Gate.
- If `timeouts.total_ms` is UNKNOWN → block Completeness Gate.
- If `retry.backoff_policy` is UNKNOWN → block Completeness Gate.
- If `telemetry.failure_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] allowlist_defined == true
- [ ] timeouts_defined == true
- [ ] retry_and_breaker_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

