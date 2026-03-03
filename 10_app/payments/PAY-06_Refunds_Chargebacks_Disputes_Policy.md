# PAY-06 — Refunds, Chargebacks & Disputes Policy

## Header Block

| Field | Value |
|---|---|
| template_id | PAY-06 |
| title | Refunds, Chargebacks & Disputes Policy |
| type | payments_refunds_chargebacks_disputes |
| template_version | 1.0.0 |
| output_path | 10_app/payments/PAY-06_Refunds_Chargebacks_Disputes_Policy.md |
| compliance_gate_id | TMP-05.PRIMARY.PAY |
| upstream_dependencies | ["PAY-02", "PAY-04", "ADMIN-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "PAY-01", "PAY-02", "PAY-04", "API-04", "ADMIN-02", "ADMIN-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical policy and operational workflows for refunds, chargebacks, and disputes:
what is allowed, who can initiate actions, state transitions, provider interactions, evidence
handling, timelines, and auditability. This template must be consistent with payment flows and
webhook handling.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flows: {{pay.flows}} | OPTIONAL
- PAY-04 Payment Webhook Handling: {{pay.webhooks}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-02 Support/Moderation Tools: {{admin.support_tools}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Refund eligibility rules (time window, product types)
- Refund initiation roles (who can refund)
- Refund types supported (full/partial)
- Dispute/chargeback lifecycle states
- Provider event handling mapping (dispute opened/won/lost)
- Evidence collection rules (what stored, PII constraints)
- Customer communication policy (who notifies)
- Fraud escalation hooks (PAY-08)
- Audit logging requirements (refund/dispute actions)
- Telemetry requirements (refund rate, dispute rate)
- SLA/timelines (response deadlines)

## Optional Fields

- Self-serve refunds | OPTIONAL
- Goodwill credit policy | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- All refund/dispute actions MUST be permissioned and auditable.
- Evidence storage must comply with PII rules; do not store more than necessary.
- Dispute handling must be consistent with provider webhook events.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Refund Policy
eligibility_rule: {{refund.eligibility_rule}}
window_days: {{refund.window_days}} | OPTIONAL
types_supported: {{refund.types_supported}} (full/partial/UNKNOWN)
who_can_initiate: {{refund.who_can_initiate}}
2. Refund Workflow
steps:
{{refund.steps[0]}}
{{refund.steps[1]}} | OPTIONAL
provider_actions: {{refund.provider_actions}} | OPTIONAL
3. Disputes / Chargebacks Lifecycle
states: {{dispute.states}}
state_transitions: {{dispute.transitions}} | OPTIONAL
4. Provider Event Mapping
event_map: {{dispute.provider_event_map}}
5. Evidence Handling
evidence_required: {{evidence.required}}
allowed_artifacts: {{evidence.allowed_artifacts}} | OPTIONAL
pii_constraints: {{evidence.pii_constraints}}
6. Customer Communications
notify_customer_rule: {{comms.notify_customer_rule}}
comms_owner: {{comms.owner}} | OPTIONAL
7. Fraud Escalation
escalate_to_fraud: {{fraud.escalate}}
fraud_policy_ref: {{fraud.policy_ref}} (expected: {{xref:PAY-08}}) | OPTIONAL
8. Audit / Telemetry
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
refund_rate_metric: {{telemetry.refund_rate_metric}}
dispute_rate_metric: {{telemetry.dispute_rate_metric}} | OPTIONAL

9. Timelines
response_deadline_rule: {{sla.response_deadline_rule}}
refund_processing_time_rule: {{sla.refund_processing_time_rule}} | OPTIONAL
10.References
Provider inventory: {{xref:PAY-01}}
Payment flows: {{xref:PAY-02}} | OPTIONAL
Webhook handling: {{xref:PAY-04}} | OPTIONAL
Fraud controls: {{xref:PAY-08}} | OPTIONAL
Admin tools: {{xref:ADMIN-02}} | OPTIONAL
Audit trail: {{xref:ADMIN-03}} | OPTIONAL

## Cross-References

Upstream: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define eligibility + who can refund + basic dispute states; use UNKNOWN
for self-serve.
intermediate: Required. Define provider event map, evidence rules, and audit/telemetry.
advanced: Required. Add SLAs/timelines rigor and fraud escalation and comms ownership.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, window days, workflow extra steps,
provider actions, transitions, allowed artifacts, comms owner, fraud policy ref, audit fields,
dispute rate metric, refund processing time, self-serve/goodwill, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If refund.eligibility_rule is UNKNOWN → block Completeness Gate.
If refund.who_can_initiate is UNKNOWN → block Completeness Gate.
If evidence.pii_constraints is UNKNOWN → block Completeness Gate.
If telemetry.refund_rate_metric is UNKNOWN → block Completeness Gate.
If audit.required is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.PAY
Pass conditions:
required_fields_present == true
refund_policy_defined == true
dispute_lifecycle_defined == true
evidence_and_comms_defined == true
audit_and_telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
