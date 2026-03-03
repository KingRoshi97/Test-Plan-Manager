# PAY-04 — Subscription & Recurring Billing Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-04                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring subscription & recurring  |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-01, WHCP-03, WHCP-05, PAY-07                 |
| Produces          | Filled Subscription & Recurring Billing Spec     |

## 2. Purpose

Define the canonical handling of payment provider webhooks: which events are consumed, verification rules, idempotency/deduplication, state transitions (payment/subscription/invoice), retries, and failure recovery. This template must be consistent with webhook consumer/security semantics and internal ledger/reconciliation rules.

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
| provider_id binding       | spec         | No              |
| Webhook endpoint/path bin | spec         | No              |
| Consumed event list (prov | spec         | No              |
| Signature verification ru | spec         | No              |
| Idempotency key rule (pro | spec         | No              |
| State transition rules (w | spec         | No              |
| Ordering expectations and | spec         | No              |
| Retry/ack rules (ack on a | spec         | No              |
| Failure handling (DLQ/qua | spec         | No              |
| Fraud/abuse handling hook | spec         | No              |
| Telemetry requirements (w | spec         | No              |
| Audit requirements (finan | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Test mode handling        | spec         | Enrichment only, no new truth  |
| Multi-account/tenant rout | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never trust webhook payload without verification.
- Webhook processing MUST be idempotent and safe to replay.
- State transitions must be consistent with ledger source-of-truth rules.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Subscription & Recurring Billing Spec`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Core Fields                | Required  | Required     | Required |
| Extended Fields             | Optional  | Required     | Required |
| Coverage Checks            | Optional  | Optional     | Required |

## 10. Unknown Handling

Unknowns must be written in the following format:

```
UNKNOWN-<NNN>: [Area] <summary>
Impact: Low|Med|High
Blocking: Yes|No
Needs: <what input resolves it>
Refs: <spec_id/entity_id/field_path>
```

- UNKNOWN_ALLOWED: domain.map, glossary.terms, internal event id, notes, security ref, out
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If endpoint.binding is UNKNOWN → block Completeness Gate.
- If verify.required is UNKNOWN → block Completeness Gate.
- If verify.idempotency_key_rule is UNKNOWN → block Completeness Gate.
- If ack.model is UNKNOWN → block Completeness Gate.
- If telemetry.received_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] events_defined == true
- [ ] verification_and_idempotency_defined == true
- [ ] ack_and_failure_handling_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-05
