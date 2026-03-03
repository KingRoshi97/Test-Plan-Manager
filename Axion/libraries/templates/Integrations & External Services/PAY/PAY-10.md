# PAY-10 — Payment Compliance & Audit (PCI-DSS, receipts, logs)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-10                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payment compliance & audi |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-04, PAY-06, PAY-07, IXS-07                   |
| Produces          | Filled Payment Compliance & Audit (PCI-DSS, recei|

## 2. Purpose

Define the canonical observability and support runbooks for billing/payments: dashboards, alerts, triage workflows, operator actions (refunds, dispute handling, entitlement fixes), and incident response procedures. This template must be consistent with payment webhook, ledger, and dispute policies and must not introduce unsafe support actions.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-04 Payment Webhook Handling: {{pay.webhooks}} | OPTIONAL
- PAY-06 Refunds/Disputes Policy: {{pay.disputes}} | OPTIONAL
- PAY-07 Ledger/Reconciliation Rules: {{pay.ledger}} | OPTIONAL
- IXS-07 Integration Observability: {{ixs.observability}} | OPTIONAL
- ADMIN-02 Support Tools Spec: {{admin.support_tools}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Dashboards minimum panels | spec         | No              |
| Key metrics list (success | spec         | No              |
| Alert definitions (paymen | spec         | No              |
| Alert routing policy (onc | spec         | No              |
| Runbook location and form | spec         | No              |
| Triage flows (by incident | spec         | No              |
| Operator actions list (re | spec         | No              |
| Permissioning requirement | spec         | No              |
| Audit requirements (all f | spec         | No              |
| Customer comms policy (bi | spec         | No              |
| Post-incident review requ | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-provider dashboards   | spec         | Enrichment only, no new truth  |
| SLOs for billing pipeline | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Operator actions affecting money or entitlements MUST be permissioned and auditable.
- Alerts must be actionable and link to runbook steps.
- Do not expose sensitive payment details in logs/dashboards.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Payment Compliance & Audit (PCI-DSS, receipts, logs)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:ADMIN-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, panel list, optional tools, runbook format,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If dash.minimum_panels is UNKNOWN → block Completeness Gate.
- If metrics.list is UNKNOWN → block Completeness Gate.
- If alerts list is UNKNOWN → block Completeness Gate.
- If ops list is UNKNOWN → block Completeness Gate.
- If audit.required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] dashboards_and_alerts_defined == true
- [ ] triage_and_operator_actions_defined == true
- [ ] audit_and_comms_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] Notifications & Comms (NOTIF)
- [ ] NOTIF-01
