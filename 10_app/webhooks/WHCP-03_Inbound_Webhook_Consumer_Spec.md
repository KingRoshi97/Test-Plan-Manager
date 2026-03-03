# WHCP-03 — Inbound Webhook Consumer Spec (verification, idempotency)

## Header Block

| Field | Value |
|---|---|
| template_id | WHCP-03 |
| title | Inbound Webhook Consumer Spec (verification, idempotency) |
| type | webhook_inbound_consumer_spec |
| template_version | 1.0.0 |
| output_path | 10_app/webhooks/WHCP-03_Inbound_Webhook_Consumer_Spec.md |
| compliance_gate_id | TMP-05.PRIMARY.WHCP |
| upstream_dependencies | ["WHCP-01", "WHCP-05", "API-02", "IXS-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "WHCP-01", "WHCP-04", "WHCP-05", "WHCP-06", "API-01", "API-02", "IXS-04", "IXS-06"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical inbound webhook consumer behavior: endpoint contract, signature
verification, allowlists, idempotency/deduplication, parsing/validation, acknowledgement rules,
and failure handling (DLQ/quarantine/replay). This template must be consistent with webhook
catalog and security rules and must not invent endpoints or secrets beyond upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Event Catalog: {{whcp.catalog}}
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-05 Security Rules: {{whcp.security_rules}}
- WHCP-06 Registration/Management: {{whcp.registration}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- IXS-06 Error Handling & Recovery: {{ixs.error_recovery}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Inbound endpoint registry (endpoint_id or path list)
- Which webhook_ids accepted per endpoint
- Verification required (yes/no/UNKNOWN)
- Verification scheme (HMAC/JWS/mTLS/UNKNOWN)
- Secret/cert reference (IXS-04)
- Allowlist rules (IP allowlist if supported)
- Payload parsing rules (schema validation)
- Idempotency key rules (event_id/delivery_id)
- Ack rules (2xx on accept vs after processing)
- Backpressure rules (queueing)
- Failure handling (DLQ/quarantine)
- Telemetry requirements (accepted/rejected/invalid sig)

## Optional Fields

- Async processing model (job queue) | OPTIONAL
- Replay endpoint support | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never process unverified webhooks when verification is required.
- Idempotency MUST be enforced; inbound duplicates must not cause repeated side effects.
- Ack behavior must be explicit and consistent with delivery semantics.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Inbound Endpoints
Endpoint
endpoint_id: {{endpoints[0].endpoint_id}} | OPTIONAL
path: {{endpoints[0].path}} | OPTIONAL
accepted_webhook_ids: {{endpoints[0].accepted_webhook_ids}}
notes: {{endpoints[0].notes}} | OPTIONAL
(Repeat per endpoint.)
2. Verification
verification_required: {{verify.required}}
scheme: {{verify.scheme}}
secret_or_cert_ref: {{verify.secret_or_cert_ref}} (expected: {{xref:IXS-04}}) | OPTIONAL
signature_header_rule: {{verify.signature_header_rule}} | OPTIONAL
3. Allowlists
ip_allowlist_supported: {{allow.ip_allowlist_supported}} | OPTIONAL
ip_allowlist: {{allow.ip_allowlist}} | OPTIONAL
4. Parsing / Validation
schema_ref_rule: {{parse.schema_ref_rule}} (expected:
{{xref:WHCP-09}}/{{xref:EVT-02}}) | OPTIONAL
on_parse_fail: {{parse.on_parse_fail}}
validation_error_response: {{parse.validation_error_response}} | OPTIONAL
5. Idempotency
idempotency_required: {{idem.required}}
idempotency_key_rule: {{idem.key_rule}}
dedupe_window: {{idem.dedupe_window}} | OPTIONAL

6. Ack Rules
ack_model: {{ack.model}} (ack_on_accept/ack_on_processed/UNKNOWN)
response_codes: {{ack.response_codes}} | OPTIONAL
7. Backpressure / Queueing
async_processing: {{queue.async_processing}} | OPTIONAL
queue_ref: {{queue.queue_ref}} | OPTIONAL
max_inflight: {{queue.max_inflight}} | OPTIONAL
8. Failure Handling
dlq_supported: {{fail.dlq_supported}}
dlq_trigger_rule: {{fail.dlq_trigger_rule}}
replay_policy_ref: {{fail.replay_policy_ref}} (expected: {{xref:WHCP-07}}) | OPTIONAL
9. Telemetry
accepted_metric: {{telemetry.accepted_metric}}
rejected_metric: {{telemetry.rejected_metric}} | OPTIONAL
invalid_signature_metric: {{telemetry.invalid_signature_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
10.References
Webhook catalog: {{xref:WHCP-01}}
Delivery semantics: {{xref:WHCP-04}} | OPTIONAL
Security rules: {{xref:WHCP-05}}
Endpoint registration: {{xref:WHCP-06}} | OPTIONAL
Failure handling: {{xref:WHCP-07}} | OPTIONAL
Observability: {{xref:WHCP-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:WHCP-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-07}}, {{xref:WHCP-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define accepted webhook_ids + verification required + idempotency key
rule.
intermediate: Required. Define ack model, parsing failure response, and DLQ trigger rule.
advanced: Required. Add async processing details, IP allowlists, and telemetry field rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, endpoint id/path, notes, secret ref,
signature header, ip allowlist, schema ref rule, validation response, dedupe window, response
codes, queue details, replay policy ref, telemetry fields, replay endpoint, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If verify.required is UNKNOWN → block Completeness Gate.
If verify.scheme is UNKNOWN → block Completeness Gate (when verify.required == true).
If idem.key_rule is UNKNOWN → block Completeness Gate.

If ack.model is UNKNOWN → block Completeness Gate.
If telemetry.accepted_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
endpoints_defined == true
verification_and_idempotency_defined == true
ack_and_failure_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
