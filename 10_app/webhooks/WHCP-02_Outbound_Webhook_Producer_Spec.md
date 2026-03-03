# WHCP-02 — Outbound Webhook Producer Spec (signing, retries, dedupe)

## Header Block

| Field | Value |
|---|---|
| template_id | WHCP-02 |
| title | Outbound Webhook Producer Spec (signing, retries, dedupe) |
| type | webhook_outbound_producer_spec |
| template_version | 1.0.0 |
| output_path | 10_app/webhooks/WHCP-02_Outbound_Webhook_Producer_Spec.md |
| compliance_gate_id | TMP-05.PRIMARY.WHCP |
| upstream_dependencies | ["WHCP-01", "EVT-02", "IXS-03", "IXS-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "WHCP-01", "EVT-02", "WHCP-04", "WHCP-05", "WHCP-06", "IXS-03", "IXS-04", "RLIM-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical outbound webhook producer behavior: how events are selected and
serialized, signature/signing rules, endpoint targeting/subscriptions, retries/backoff,
deduplication/idempotency, and failure handling. This template must be consistent with webhook
catalog, delivery semantics, and security rules.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Event Catalog: {{whcp.catalog}}
- EVT-02 Event Schema Spec: {{evt.schema_spec}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-05 Security Rules: {{whcp.security_rules}} | OPTIONAL
- WHCP-06 Registration/Management: {{whcp.registration}} | OPTIONAL
- IXS-03 Connectivity Policy: {{ixs.network_policy}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- RLIM-01 Rate Limit Policy: {{rlim.policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Producer identity (service/component)
- Outbound webhook selection rules (which webhook_ids emitted)
- Payload schema versioning rule
- Target resolution (subscription lookup)
- HTTP method/headers policy
- Signing supported (yes/no/UNKNOWN)
- Signing scheme (HMAC/JWS/UNKNOWN)
- Signature header fields
- Retries supported + backoff rules
- Max attempts and dead-letter/quarantine behavior
- Deduplication/idempotency strategy (event_id + delivery_id)
- Rate caps (per subscriber)
- Telemetry requirements (delivered/failed, latency)

## Optional Fields

- Batching support | OPTIONAL
- Compression support | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Do not send PII unless explicitly allowed by schema/security policies.
- Retries must be bounded; dedupe must prevent duplicate side effects.
- Signing secrets must be handled per {{xref:IXS-04}}; never log them.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Producer Identity
producer_name: {{producer.name}}
service_owner: {{producer.owner}} | OPTIONAL
2. Emitted Webhooks
webhook_ids_emitted: {{emit.webhook_ids}}
selection_rules: {{emit.selection_rules}} | OPTIONAL
3. Payload Versioning
schema_ref: {{payload.schema_ref}} (expected: {{xref:EVT-02}}/{{xref:WHCP-09}}) |
OPTIONAL
version_field: {{payload.version_field}} | OPTIONAL
4. Target Resolution
subscription_lookup_rule: {{targets.lookup_rule}}
endpoint_fields: {{targets.endpoint_fields}} | OPTIONAL
5. HTTP Policy
method: {{http.method}}
required_headers: {{http.required_headers}}
timeout_ref: {{http.timeout_ref}} (expected: {{xref:IXS-03}}) | OPTIONAL
6. Signing
signing_supported: {{sign.supported}}
scheme: {{sign.scheme}} | OPTIONAL
signature_headers: {{sign.signature_headers}} | OPTIONAL
canonical_string_rule: {{sign.canonical_string_rule}} | OPTIONAL
secret_ref: {{sign.secret_ref}} (expected: {{xref:IXS-04}}) | OPTIONAL
7. Retries / Backoff
retry_supported: {{retry.supported}}

backoff_policy: {{retry.backoff_policy}}
max_attempts: {{retry.max_attempts}}
retryable_status_codes: {{retry.retryable_status_codes}} | OPTIONAL
8. Dedupe / Idempotency
delivery_id_rule: {{dedupe.delivery_id_rule}}
dedupe_key_rule: {{dedupe.key_rule}}
dedupe_window: {{dedupe.window}} | OPTIONAL
9. DLQ / Quarantine
dlq_supported: {{dlq.supported}}
dlq_trigger_rule: {{dlq.trigger_rule}}
replay_policy_ref: {{dlq.replay_policy_ref}} (expected: {{xref:WHCP-07}}) | OPTIONAL
10.Rate Caps
per_subscriber_caps: {{caps.per_subscriber_caps}}
enforcement_ref: {{caps.enforcement_ref}} (expected: {{xref:RLIM-01}}) | OPTIONAL
11.Telemetry
delivery_success_metric: {{telemetry.success_metric}}
delivery_failure_metric: {{telemetry.failure_metric}} | OPTIONAL
latency_metric: {{telemetry.latency_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
12.References
Webhook catalog: {{xref:WHCP-01}}
Delivery semantics: {{xref:WHCP-04}} | OPTIONAL
Security rules: {{xref:WHCP-05}} | OPTIONAL
Registration/management: {{xref:WHCP-06}} | OPTIONAL
Failure handling: {{xref:WHCP-07}} | OPTIONAL
Observability: {{xref:WHCP-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:WHCP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-07}}, {{xref:WHCP-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define emitted webhook_ids + retries + max attempts; use UNKNOWN for
signing scheme if not used.
intermediate: Required. Define signing fields (if supported), dedupe keys, and DLQ rules.
advanced: Required. Add batching/compression, subscriber caps, and telemetry fields rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, owner, selection rules, schema
ref/version field, endpoint fields, timeout ref, signing scheme/headers/canonical rule/secret ref,
retryable status codes, dedupe window, replay policy ref, enforcement ref, telemetry fields,
batching/compression, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If emit.webhook_ids is UNKNOWN → block Completeness Gate.
If retry.max_attempts is UNKNOWN → block Completeness Gate.
If dedupe.key_rule is UNKNOWN → block Completeness Gate.
If sign.supported is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
emitted_webhooks_defined == true
bounded_retry_defined == true
dedupe_defined == true
dlq_policy_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
