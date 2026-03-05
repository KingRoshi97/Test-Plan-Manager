# EVT-05 — Webhook Producer Spec (outbound webhooks)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | EVT-05                                             |
| Template Type     | Build / Events                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring webhook producer spec (outbound webhooks)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Webhook Producer Spec (outbound webhooks) Document                         |

## 2. Purpose

Define the canonical specification format for outbound webhooks produced by the system,
including subscription model, delivery/auth/signing, retries, dedupe, rate limiting, payload
binding to EVT schemas, and observability. This template must be consistent with the Event
Catalog/Schema specs and must not invent webhook event_ids or capabilities not present in
upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- EVT-01 Event Catalog: {{evt.catalog}}
- EVT-02 Event Schema Specs: {{evt.schemas}}
- EVT-04 Delivery Semantics: {{evt.delivery_semantics}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Webhook surface scope (which events can be delivered as webhooks)
Subscription model (static endpoints vs per-tenant subscriptions)
Webhook endpoint configuration fields (url, secrets, headers)
Auth/signing model (HMAC/signature headers/timestamps)
Delivery method (POST/PUT) and content type
Payload format (envelope + schema binding to EVT-02)
Delivery semantics (retries, backoff, max attempts, timeouts)
Deduplication/idempotency guidance for receivers
Ordering guarantees (if any)
Failure handling (disable rules, DLQ, dead endpoint behavior)
Rate limiting / abuse controls for outbound delivery
Security constraints (SSRF protections, allowlists, TLS requirements)
Observability requirements (delivery success rate, latency, retry counts)

Optional Fields
Webhook event filtering rules | OPTIONAL
Batching policy | OPTIONAL
Compression policy | OPTIONAL
Tenant-specific signing keys | OPTIONAL
Custom headers policy | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Do not introduce new event_ids; use only those in {{xref:EVT-01}}.
Every webhook payload MUST reference a schema_ref from {{xref:EVT-02}} (or be
UNKNOWN).
Signing/auth model MUST be explicit; if unknown, mark UNKNOWN and flag.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Outbound delivery MUST follow delivery semantics in {{xref:EVT-04}} unless explicitly
overridden.
If overrides exist, they must be documented and justified (or marked UNKNOWN).
Output Format
1. Webhook Scope
enabled: {{webhooks.enabled}}
supported_event_ids: {{webhooks.supported_event_ids}} (must come from
{{xref:EVT-01}})
subscription_model: {{webhooks.subscription_model}} (static/per_tenant/UNKNOWN)
notes: {{webhooks.notes}} | OPTIONAL
2. Subscription & Endpoint Configuration
Config fields:
url: {{webhook.config.url}}
secret_ref: {{webhook.config.secret_ref}} | OPTIONAL
custom_headers: {{webhook.config.custom_headers}} | OPTIONAL
event_filters: {{webhook.config.event_filters}} | OPTIONAL
enabled_flag: {{webhook.config.enabled_flag}} | OPTIONAL
validation_rules: {{webhook.config.validation_rules}}
3. Authentication / Signing
signing_enabled: {{signing.enabled}}
signing_type: {{signing.type}} (hmac/rs256/UNKNOWN)
signature_header: {{signing.signature_header}} | OPTIONAL
timestamp_header: {{signing.timestamp_header}} | OPTIONAL
tolerance_seconds: {{signing.tolerance_seconds}} | OPTIONAL
replay_protection: {{signing.replay_protection}} | OPTIONAL
4. Delivery Request Format
http_method: {{delivery.http_method}} (POST/UNKNOWN)

content_type: {{delivery.content_type}} (application/json/UNKNOWN)
timeout_ms: {{delivery.timeout_ms}}
tls_required: {{delivery.tls_required}}
redirect_policy: {{delivery.redirect_policy}} | OPTIONAL
5. Payload Binding (to EVT-02)
envelope_fields: {{payload.envelope_fields}}
schema_ref: {{payload.schema_ref}} (expected: {{xref:EVT-02}})
payload_ref: {{payload.payload_ref}} | OPTIONAL
pii_policy: {{payload.pii_policy}} | OPTIONAL
6. Delivery Semantics (Retries/Dedupe/Ordering)
retry_policy_ref: {{delivery.retry_policy_ref}} (expected: {{xref:EVT-04}})
backoff_strategy: {{delivery.backoff_strategy}}
max_attempts: {{delivery.max_attempts}}
dedupe_key: {{delivery.dedupe_key}} | OPTIONAL
ordering_guarantee: {{delivery.ordering_guarantee}} | OPTIONAL
7. Failure Handling
disable_on_fail: {{failure.disable_on_fail}}
disable_threshold: {{failure.disable_threshold}} | OPTIONAL
dead_endpoint_behavior: {{failure.dead_endpoint_behavior}}
dlq_supported: {{failure.dlq_supported}} | OPTIONAL
dlq_ref: {{failure.dlq_ref}} | OPTIONAL
8. Rate Limits & Abuse Controls
outbound_ratelimit_policy: {{abuse.ratelimit_policy}} | OPTIONAL
per_destination_limits: {{abuse.per_destination_limits}} | OPTIONAL
spike_protection: {{abuse.spike_protection}} | OPTIONAL
9. Security Constraints
ssrf_protections: {{security.ssrf_protections}}
allowlist_policy: {{security.allowlist_policy}} | OPTIONAL
tls_min_version: {{security.tls_min_version}} | OPTIONAL
secret_storage_policy: {{security.secret_storage_policy}} | OPTIONAL
10.Observability Requirements
metrics:
delivery_success_rate: {{obs.metrics.delivery_success_rate}}
delivery_latency: {{obs.metrics.delivery_latency}}
retry_count: {{obs.metrics.retry_count}}
failure_count: {{obs.metrics.failure_count}}
logs_required_fields: {{obs.logs_required_fields}}
trace_attrs: {{obs.trace_attrs}} | OPTIONAL
alerts: {{obs.alerts}} | OPTIONAL
11.References
Event catalog: {{xref:EVT-01}}
Schema specs: {{xref:EVT-02}}
Delivery semantics: {{xref:EVT-04}}
Failure handling: {{xref:EVT-07}} | OPTIONAL

Observability: {{xref:EVT-08}} | OPTIONAL
Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
Cross-References
Upstream: {{xref:EVT-01}}, {{xref:EVT-02}}, {{xref:EVT-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:EVT-06}} | OPTIONAL, {{xref:EVT-07}} | OPTIONAL, {{xref:EVT-08}} |
OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where signing/delivery details are not specified by inputs;
do not invent event_ids.
intermediate: Required. Bind payloads to EVT-02 and define retries/backoff/timeouts.
advanced: Required. Add SSRF protections, allowlist policy, and full observability/alerting.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, secret_ref, custom_headers,
event_filters, enabled_flag, signature_header, timestamp_header, tolerance_seconds,
replay_protection, redirect_policy, payload_ref, pii_policy, dedupe_key, ordering_guarantee,
disable_threshold, dlq_supported, dlq_ref, ratelimit_policy, per_destination_limits,
spike_protection, allowlist_policy, tls_min_version, secret_storage_policy, trace_attrs, alerts,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If signing_enabled is UNKNOWN → flag in Open Questions.
If tls_required is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.EVENTING
Pass conditions:
required_fields_present == true
all webhook event_ids exist in EVT-01 (no new IDs introduced)
payload_schema_ref_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

EVT-06

EVT-06 — Webhook Consumer Spec (inbound webhooks)
Header Block

## 5. Optional Fields

Webhook event filtering rules | OPTIONAL
Batching policy | OPTIONAL
Compression policy | OPTIONAL
Tenant-specific signing keys | OPTIONAL
Custom headers policy | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new event_ids; use only those in {{xref:EVT-01}}.
- **Every webhook payload MUST reference a schema_ref from {{xref:EVT-02}} (or be**
- **UNKNOWN).**
- **Signing/auth model MUST be explicit; if unknown, mark UNKNOWN and flag.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Outbound delivery MUST follow delivery semantics in {{xref:EVT-04}} unless explicitly**
- **overridden.**
- If overrides exist, they must be documented and justified (or marked UNKNOWN).

## 7. Output Format

### Required Headings (in order)

1. `## Webhook Scope`
2. `## Subscription & Endpoint Configuration`
3. `## Config fields:`
4. `## Authentication / Signing`
5. `## Delivery Request Format`
6. `## Payload Binding (to EVT-02)`
7. `## Delivery Semantics (Retries/Dedupe/Ordering)`
8. `## Failure Handling`
9. `## Rate Limits & Abuse Controls`
10. `## Security Constraints`

## 8. Cross-References

- **Upstream: {{xref:EVT-01}}, {{xref:EVT-02}}, {{xref:EVT-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:EVT-06}} | OPTIONAL, {{xref:EVT-07}} | OPTIONAL, {{xref:EVT-08}} |**
- OPTIONAL
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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
