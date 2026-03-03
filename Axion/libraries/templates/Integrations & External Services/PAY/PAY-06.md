# PAY-06 — Payment Security (PCI scope, tokenization, encryption)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-06                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payment security (pci sco |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-02, PAY-04, ADMIN-02                         |
| Produces          | Filled Payment Security (PCI scope, tokenization,|

## 2. Purpose

Define the canonical policy and operational workflows for refunds, chargebacks, and disputes: what is allowed, who can initiate actions, state transitions, provider interactions, evidence handling, timelines, and auditability. This template must be consistent with payment flows and webhook handling.

## 3. Inputs Required

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

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Refund eligibility rules  | spec         | No              |
| Refund initiation roles ( | spec         | No              |
| Refund types supported (f | spec         | No              |
| Dispute/chargeback lifecy | spec         | No              |
| Provider event handling m | spec         | No              |
| Evidence collection rules | spec         | No              |
| Customer communication po | spec         | No              |
| Fraud escalation hooks (P | spec         | No              |
| Audit logging requirement | spec         | No              |
| Telemetry requirements (r | spec         | No              |
| SLA/timelines (response d | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Self-serve refunds        | spec         | Enrichment only, no new truth  |
| Goodwill credit policy    | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- All refund/dispute actions MUST be permissioned and auditable.
- Evidence storage must comply with PII rules; do not store more than necessary.
- Dispute handling must be consistent with provider webhook events.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Payment Security (PCI scope, tokenization, encryption)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-07}}, {{xref:PAY-10}} | OPTIONAL
- Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, window days, workflow extra steps,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If refund.eligibility_rule is UNKNOWN → block Completeness Gate.
- If refund.who_can_initiate is UNKNOWN → block Completeness Gate.
- If evidence.pii_constraints is UNKNOWN → block Completeness Gate.
- If telemetry.refund_rate_metric is UNKNOWN → block Completeness Gate.
- If audit.required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] refund_policy_defined == true
- [ ] dispute_lifecycle_defined == true
- [ ] evidence_and_comms_defined == true
- [ ] audit_and_telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-07
