# PAY-07 — Currency & Localization Rules (multi-currency, formatting)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-07                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring currency & localization r |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-02, PAY-04, DATA-06, ADMIN-03                |
| Produces          | Filled Currency & Localization Rules (multi-curre|

## 2. Purpose

Define the canonical internal ledger model and reconciliation rules for payments: what the source of truth is for financial state, how provider events map to ledger entries, how reconciliation is performed, what counts as mismatch, and what audits/controls exist. This template must be consistent with payment flows and webhook handling and must not invent financial fields beyond upstream schemas.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- PAY-04 Webhook Handling: {{pay.webhooks}} | OPTIONAL
- DATA-06 Canonical Data Schemas (ledger): {{data.schemas}} | OPTIONAL
- DQV-03 Data Validation Rules: {{dqv.rules}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Ledger source of truth st | spec         | No              |
| Ledger entities/records ( | spec         | No              |
| Event → ledger mapping ru | spec         | No              |
| Idempotency rules for led | spec         | No              |
| Reconciliation cadence (d | spec         | No              |
| Reconciliation inputs (pr | spec         | No              |
| Mismatch detection rules  | spec         | No              |
| Mismatch handling (hold,  | spec         | No              |
| Audit controls (append-on | spec         | No              |
| Retention policy for ledg | spec         | No              |
| Telemetry requirements (m | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Multi-currency handling   | spec         | Enrichment only, no new truth  |
| Accounting export rules   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Ledger writes MUST be idempotent and append-only where possible.
- Reconciliation must be repeatable and produce artifacts (reports).
- Mismatches must not silently self-resolve; must be surfaced.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Currency & Localization Rules (multi-currency, formatting)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, rationale, schema ref, notes, report
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If sot.source_of_truth is UNKNOWN → block Completeness Gate.
- If ledger.entry_types is UNKNOWN → block Completeness Gate.
- If idem.key_rule is UNKNOWN → block Completeness Gate.
- If recon.cadence is UNKNOWN → block Completeness Gate.
- If telemetry.recon_success_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] source_of_truth_defined == true
- [ ] ledger_model_defined == true
- [ ] idempotency_defined == true
- [ ] reconciliation_defined == true
- [ ] audit_controls_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-08
