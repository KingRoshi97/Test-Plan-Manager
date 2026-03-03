# PAY-09 — Payment Observability (transaction metrics, alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PAY-09                                           |
| Template Type     | Integration / Payments                           |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring payment observability (tr |
| Filled By         | Internal Agent                                   |
| Consumes          | PAY-01, IXS-08, CSec-02                          |
| Produces          | Filled Payment Observability (transaction metrics|

## 2. Purpose

Define the canonical security boundaries for payments, especially PCI scope: what systems touch payment data, tokenization rules, what is prohibited (raw PAN/CVV), required controls, and how SAQ scope is determined/maintained. This template must be consistent with integration security/compliance and client data protection policies.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- PAY-01 Provider Inventory: {{pay.providers}}
- PAY-02 Payment Flow Spec: {{pay.flows}} | OPTIONAL
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- CSec-01 Token Storage Policy: {{csec.token_storage}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| PCI in scope (true/false/ | spec         | No              |
| PCI scope boundary statem | spec         | No              |
| Tokenization rule (provid | spec         | No              |
| Prohibited data rule (no  | spec         | No              |
| Allowed payment identifie | spec         | No              |
| Network and transport req | spec         | No              |
| Secrets handling referenc | spec         | No              |
| Access control requiremen | spec         | No              |
| Logging/redaction require | spec         | No              |
| Vulnerability/patch expec | spec         | No              |
| Telemetry requirements (s | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| SAQ type notes            | spec         | Enrichment only, no new truth  |
| Pen test / ASV scan notes | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Never store raw PAN or CVV.
- If PCI is in scope, scope boundaries and controls MUST be explicit and enforceable.
- Payment identifiers logged must be non-sensitive (token/last4 only).
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Payment Observability (transaction metrics, alerts)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:PAY-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:PAY-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, saq type, hosted fields, optional ban/log
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If pci.in_scope is UNKNOWN → allowed, but MUST be flagged in open_questions.
- If pci.in_scope == true and pci.boundary is UNKNOWN → block Completeness Gate.
- If ban.no_pan_rule is UNKNOWN → block Completeness Gate.
- If token.rule is UNKNOWN → block Completeness Gate.
- If telemetry.security_event_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.PAY
- Pass conditions:
- [ ] required_fields_present == true
- [ ] tokenization_and_prohibited_data_defined == true
- [ ] pci_scope_defined_or_not_in_scope == true
- [ ] least_privilege_and_logging_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] PAY-10
