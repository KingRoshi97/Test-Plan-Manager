# PAY-04 — Webhook Handling for Payments (events, idempotency, retries)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-04                                             |
| Template Type     | Integration / Payments                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring webhook handling for payments (events, idempotency, retries)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Webhook Handling for Payments (events, idempotency, retries) Document                         |

## 2. Purpose

Define the canonical handling of payment provider webhooks: which events are consumed,
verification rules, idempotency/deduplication, state transitions (payment/subscription/invoice),
retries, and failure recovery. This template must be consistent with webhook consumer/security
semantics and internal ledger/reconciliation rules.

## 3. Inputs Required

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

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| provider_id binding       | spec         | Yes             |
| Webhook endpoint/path ... | spec         | Yes             |
| Signature verification... | spec         | Yes             |
| Idempotency key rule (... | spec         | Yes             |
| State transition rules... | spec         | Yes             |
| Ordering expectations ... | spec         | Yes             |
| Retry/ack rules (ack o... | spec         | Yes             |
| Failure handling (DLQ/... | spec         | Yes             |
| Fraud/abuse handling h... | spec         | Yes             |
| Audit requirements (fi... | spec         | Yes             |

## 5. Optional Fields

Test mode handling | OPTIONAL
Multi-account/tenant routing | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Never trust webhook payload without verification.**
- **Webhook processing MUST be idempotent and safe to replay.**
- **State transitions must be consistent with ledger source-of-truth rules.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Endpoint Binding`
2. `## Consumed Events`
3. `## Event`
4. `## (Repeat per event.)`
5. `## Verification`
6. `## State Transitions`
7. `## Ack / Retry`
8. `## OPTIONAL`
9. `## Failure Handling`
10. `## Fraud / Abuse Hooks`

## 8. Cross-References

- **Upstream: {{xref:PAY-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL**
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
