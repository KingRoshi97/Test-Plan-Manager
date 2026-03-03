# PAY-02 — Payment Flow Spec (checkout, auth, capture, settle)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-02                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payment flow spec (checko |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-01, API-02, FE-04                            |
| Produces          | Filled Payment Flow Spec (checkout, auth, capture|

## 2. Purpose

Define the canonical payment flows supported by the product (one-time, recurring, invoices): steps, actors, API endpoints involved, UI touchpoints, provider interactions, and failure/retry handling. This template must be consistent with provider inventory and must not invent payment modes/endpoints not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- FE-01 Route Map: {{fe.route_layout}} | OPTIONAL
- FE-04 Data Binding Rules: {{fe.data_binding}} | OPTIONAL
- CER-02 Retry/Recovery Patterns: {{cer.retry_patterns}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| provider_id binding       | spec         | No              |
| Supported flow types list | spec         | No              |
| Flow steps (client → serv | spec         | No              |
| Payment intent/checkout o | spec         | No              |
| Idempotency rules for cre | spec         | No              |
| Sensitive data handling ( | spec         | No              |
| Failure handling (decline | spec         | No              |
| Retry rules (when allowed | spec         | No              |
| UI touchpoints (screen_id | spec         | No              |
| API endpoints used (endpo | spec         | No              |
| Telemetry requirements (s | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Offline/manual invoice fl | spec         | Enrichment only, no new truth  |
| Proration rules (if subsc | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never handle raw card data unless explicitly in PCI scope; prefer provider tokenization.
- All create/confirm operations MUST be idempotent.
- Declines must not be retried blindly; use provider reason codes.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Payment Flow Spec (checkout, auth, capture, settle)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-01}}, {{xref:API-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-04}}, {{xref:PAY-07}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, ui entry, provider objects, optional steps,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If flows.types is UNKNOWN → block Completeness Gate.
- If idem.key_rule is UNKNOWN → block Completeness Gate.
- If security.no_raw_card_rule is UNKNOWN → block Completeness Gate.
- If telemetry.success_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] flows_defined == true
- [ ] idempotency_defined == true
- [ ] sensitive_data_rules_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-03
