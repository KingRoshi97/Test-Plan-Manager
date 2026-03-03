# PAY-05 — Refund & Dispute Handling (chargeback, partial refund)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-05                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring refund & dispute handling |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-03, PRD-06, IXS-08                           |
| Produces          | Filled Refund & Dispute Handling (chargeback, par|

## 2. Purpose

Define the canonical tax/VAT handling rules for payments: whether taxes apply, how jurisdiction is determined, how taxes are calculated/collected/remitted (or delegated to provider), what user/business data is required, and compliance constraints. This template must not invent tax obligations; unknowns must be explicitly marked UNKNOWN.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}} | OPTIONAL
- PAY-03 Pricing & Plan Mapping: {{pay.plans}} | OPTIONAL
- PRD-06 NFRs / Legal constraints: {{prd.nfrs}} | OPTIONAL
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Tax handling enabled (tru | spec         | No              |
| Tax model (provider-manag | spec         | No              |
| Supported jurisdictions l | spec         | No              |
| Jurisdiction determinatio | spec         | No              |
| Tax-exempt handling rules | spec         | No              |
| Invoice/receipt tax line  | spec         | No              |
| Stored tax data fields po | spec         | No              |
| Compliance notes (VAT IDs | spec         | No              |
| Audit/retention policy fo | spec         | No              |
| Telemetry requirements (t | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Product tax category mapp | spec         | Enrichment only, no new truth  |
| EU OSS/IOSS notes         | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not provide legal conclusions; use upstream/legal inputs.
- Minimize stored tax PII; store only what is needed for compliance/audit.
- If taxes are enabled, the model MUST be explicit and implementable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Refund & Dispute Handling (chargeback, partial refund)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PRD-06}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, exempt rules, rounding rule, compliance
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If tax.enabled is UNKNOWN → allowed, but MUST add to open_questions.
- If tax.model is UNKNOWN and tax.enabled == true → block Completeness Gate.
- If jurisdictions.determination_rule is UNKNOWN and tax.enabled == true → block Completeness
- If telemetry.tax_calc_failure_metric is UNKNOWN → block Completeness Gate (when

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] if tax_enabled then model_and_jurisdiction_rules_defined == true
- [ ] data_handling_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-06
