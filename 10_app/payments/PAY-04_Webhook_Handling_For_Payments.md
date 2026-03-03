# PAY-04 — Webhook Handling for Payments (events, idempotency, retries)

## Header Block

| Field | Value |
|---|---|
| template_id | PAY-04 |
| title | Webhook Handling for Payments (events, idempotency, retries) |
| type | payments_webhook_handling |
| template_version | 1.0.0 |
| output_path | 10_app/payments/PAY-04_Webhook_Handling_For_Payments.md |
| compliance_gate_id | TMP-05.PRIMARY.PAY |
| upstream_dependencies | ["PAY-01", "WHCP-03", "WHCP-05", "PAY-07"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "PAY-01", "PAY-02", "WHCP-03", "WHCP-05", "WHCP-04", "PAY-07", "API-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical handling of payment provider webhooks: which events are consumed,
verification rules, idempotency/deduplication, state transitions (payment/subscription/invoice),
retries, and failure recovery. This template must be consistent with webhook consumer/security
semantics and internal ledger/reconciliation rules.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- WHCP-03 Inbound Webhook Consumer Spec: {{whcp.inbound}} | OPTIONAL
- WHCP-04 Delivery Semantics: {{whcp.delivery_semantics}} | OPTIONAL
- WHCP-05 Webhook Security Rules: {{whcp.security_rules}} | OPTIONAL
- PAY-07 Ledger & Reconciliation Rules: {{pay.ledger_rules}} | OPTIONAL
- API-03 Error Policy: {{api.error_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- provider_id binding
- Webhook endpoint/path binding (endpoint_id/path)
- Consumed event list (provider event types → internal event_id)
- Signature verification rule (bind to WHCP-05)
- Idempotency key rule (provider event id)
- State transition rules (what updates what)
- Ordering expectations and handling out-of-order events
- Retry/ack rules (ack on accept vs processed)
- Failure handling (DLQ/quarantine + replay)
- Fraud/abuse handling hooks (if any)
- Telemetry requirements (webhook received/processed, failures)
- Audit requirements (financial events)

## Optional Fields

- Test mode handling | OPTIONAL
- Multi-account/tenant routing | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never trust webhook payload without verification.
- Webhook processing MUST be idempotent and safe to replay.
- State transitions must be consistent with ledger source-of-truth rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Endpoint Binding
provider_id: {{meta.provider_id}}
endpoint_id_or_path: {{endpoint.binding}}
2. Consumed Events
Event
provider_event_type: {{events[0].provider_event_type}}
internal_event_id: {{events[0].internal_event_id}} | OPTIONAL
handler_action: {{events[0].handler_action}}
notes: {{events[0].notes}} | OPTIONAL
(Repeat per event.)
3. Verification
security_ref: {{verify.security_ref}} (expected: {{xref:WHCP-05}}) | OPTIONAL
verification_required: {{verify.required}}
idempotency_key_rule: {{verify.idempotency_key_rule}}
4. State Transitions
object_updated: {{state.object_updated}}
transition_rules: {{state.transition_rules}}
out_of_order_rule: {{state.out_of_order_rule}} | OPTIONAL
5. Ack / Retry
ack_model: {{ack.model}} (ack_on_accept/ack_on_processed/UNKNOWN)
retry_semantics_ref: {{ack.retry_semantics_ref}} (expected: {{xref:WHCP-04}}) |
OPTIONAL
6. Failure Handling
dlq_supported: {{fail.dlq_supported}}

dlq_trigger_rule: {{fail.dlq_trigger_rule}}
replay_policy_ref: {{fail.replay_policy_ref}} (expected: {{xref:WHCP-07}}) | OPTIONAL
7. Fraud / Abuse Hooks
fraud_flags_handling: {{fraud.flags_handling}} | OPTIONAL
velocity_limit_ref: {{fraud.velocity_limit_ref}} | OPTIONAL
8. Telemetry
webhook_received_metric: {{telemetry.received_metric}}
webhook_processed_metric: {{telemetry.processed_metric}} | OPTIONAL
webhook_failed_metric: {{telemetry.failed_metric}} | OPTIONAL
fields: {{telemetry.fields}} | OPTIONAL
9. Audit
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
10.References
Provider inventory: {{xref:PAY-01}}
Payment flows: {{xref:PAY-02}} | OPTIONAL
Ledger/reconciliation: {{xref:PAY-07}} | OPTIONAL
Webhook consumer spec: {{xref:WHCP-03}} | OPTIONAL
Webhook security: {{xref:WHCP-05}} | OPTIONAL
Webhook error handling: {{xref:WHCP-07}} | OPTIONAL

## Cross-References

Upstream: {{xref:PAY-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define consumed events + verification required + idempotency key rule.
intermediate: Required. Define state transitions, ack model, DLQ trigger, and telemetry.
advanced: Required. Add out-of-order handling, fraud hooks, and audit rigor for financial events.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, internal event id, notes, security ref, out
of order rule, retry semantics ref, replay policy ref, fraud fields, telemetry fields, audit fields, test
mode/tenant routing, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If endpoint.binding is UNKNOWN → block Completeness Gate.
If verify.required is UNKNOWN → block Completeness Gate.
If verify.idempotency_key_rule is UNKNOWN → block Completeness Gate.
If ack.model is UNKNOWN → block Completeness Gate.
If telemetry.received_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.PAY

Pass conditions:
required_fields_present == true
events_defined == true
verification_and_idempotency_defined == true
ack_and_failure_handling_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
