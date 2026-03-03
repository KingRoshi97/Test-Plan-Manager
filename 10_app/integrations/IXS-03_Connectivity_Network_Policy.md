# IXS-03 — Connectivity & Network Policy (timeouts, retries, allowlists)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-03 |
| title | Connectivity & Network Policy (timeouts, retries, allowlists) |
| type | integration_connectivity_network_policy |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-03_Connectivity_Network_Policy.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["IXS-01", "IXS-02", "API-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "IXS-02", "API-05", "CER-02"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical connectivity and network policy for integrations: allowed destinations,
network timeouts, retry/backoff behavior, DNS/TLS requirements, and handling for degraded
connectivity. This template must be consistent with integration specs and must not invent
external destinations not present in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}} | OPTIONAL
- API-05 Rate Limit & Abuse Controls: {{api.rate_limits}} | OPTIONAL
- CER-02 Retry & Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Destination allowlist policy (domains/IPs)
- TLS requirements (min version, cert validation)
- Timeout policy (connect/read/total)
- Retry policy (retryable failures, backoff)
- Circuit breaker policy (stop trying)
- Concurrency limits (per integration)
- Outbound proxy/VPC egress notes (if applicable)
- Inbound connectivity requirements (webhook exposure, IP allowlist)
- DNS policy (caching, failover)
- Telemetry requirements (latency, failures by destination)

## Optional Fields

- Regional routing policy | OPTIONAL
- Pinned certs / mTLS notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- No outbound connectivity to non-allowlisted destinations.
- Retries MUST not amplify incidents; use backoff and circuit breaker rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Destination Allowlist
allowlist_model: {{allowlist.model}} (exact/wildcard/UNKNOWN)
domains: {{allowlist.domains}}
ips: {{allowlist.ips}} | OPTIONAL
per_integration_overrides: {{allowlist.per_integration_overrides}} | OPTIONAL
2. TLS / Transport Security
tls_min_version: {{tls.min_version}}
cert_validation_rule: {{tls.cert_validation_rule}}
mtls_supported: {{tls.mtls_supported}} | OPTIONAL
pinned_certs: {{tls.pinned_certs}} | OPTIONAL
3. Timeouts
connect_timeout_ms: {{timeouts.connect_ms}}
read_timeout_ms: {{timeouts.read_ms}} | OPTIONAL
total_timeout_ms: {{timeouts.total_ms}}
4. Retries
retry_supported: {{retry.supported}}
retryable_failures: {{retry.retryable_failures}}
backoff_policy: {{retry.backoff_policy}} (exponential/jitter/UNKNOWN)
max_attempts: {{retry.max_attempts}} | OPTIONAL
5. Circuit Breaker
breaker_supported: {{breaker.supported}}
breaker_trigger: {{breaker.trigger}} | OPTIONAL
cooldown_ms: {{breaker.cooldown_ms}} | OPTIONAL
6. Concurrency Limits
max_concurrent_requests: {{conc.max_concurrent_requests}}
per_integration_limits: {{conc.per_integration_limits}} | OPTIONAL
7. Inbound Connectivity (Webhooks)
public_endpoint_required: {{inbound.public_endpoint_required}} | OPTIONAL
ip_allowlist_supported: {{inbound.ip_allowlist_supported}} | OPTIONAL
inbound_allowlist: {{inbound.allowlist}} | OPTIONAL
8. DNS
dns_cache_policy: {{dns.cache_policy}}
failover_policy: {{dns.failover_policy}} | OPTIONAL

9. Telemetry
latency_metric: {{telemetry.latency_metric}}
failure_metric: {{telemetry.failure_metric}}
fields: {{telemetry.fields}} | OPTIONAL
10.References
Integration inventory: {{xref:IXS-01}}
Integration specs: {{xref:IXS-02}} | OPTIONAL
Error handling: {{xref:IXS-06}} | OPTIONAL
Observability: {{xref:IXS-07}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}}, {{xref:IXS-02}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-06}}, {{xref:IXS-07}} | OPTIONAL
Standards: {{standards.rules[STD-SECURITY]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define allowlist + timeouts + basic retry; use UNKNOWN for mTLS/regional
routing.
intermediate: Required. Define backoff, breaker, concurrency, and inbound webhook exposure
rules.
advanced: Required. Add per-integration overrides, DNS failover specifics, and telemetry fields
rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, ips, per-integration overrides,
mTLS/pins, read timeout, max attempts, breaker details, per-integration limits, inbound options,
dns failover, telemetry fields, regional routing, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If allowlist.domains is UNKNOWN → block Completeness Gate.
If timeouts.total_ms is UNKNOWN → block Completeness Gate.
If retry.backoff_policy is UNKNOWN → block Completeness Gate.
If telemetry.failure_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
allowlist_defined == true
timeouts_defined == true
retry_and_breaker_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
