# CRMERP-09 — CRM/ERP Observability (sync lag, failure rates, alerts)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | CRMERP-09                                        |
| Template Type     | Integration / CRM-ERP                            |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring crm/erp observability (sy |
| Filled By         | Internal Agent                                   |
| Consumes          | CRMERP-01, IXS-08, IXS-04                        |
| Produces          | Filled CRM/ERP Observability (sync lag, failure r|

## 2. Purpose

Define the canonical security and compliance requirements specific to CRM/ERP integrations: least privilege access, PII/financial data handling, audit requirements, retention/deletion expectations, and vendor risk controls. This template must be consistent with the general integration security baseline and must not invent compliance controls not supported by upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| system_id binding         | spec         | No              |
| Data classes handled (PII | spec         | No              |
| Least privilege policy (s | spec         | No              |
| Credential handling refer | spec         | No              |
| Encryption requirements ( | spec         | No              |
| Audit requirements (sync  | spec         | No              |
| Retention rules (external | spec         | No              |
| Deletion propagation (if  | spec         | No              |
| Vendor risk controls (SLA | spec         | No              |
| Compliance flags (PCI/PHI | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Data residency constraint | spec         | Enrichment only, no new truth  |
| DPA/contract references   | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- CRM/ERP credentials must be scoped to minimum permissions needed for defined sync
- direction.
- Audit logs must include system_id/object/key for all writes.
- Retention and deletion must be explicit for regulated data.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## CRM/ERP Observability (sync lag, failure rates, alerts)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:CRMERP-01}}, {{xref:IXS-08}} | OPTIONAL, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:CRMERP-10}} | OPTIONAL
- Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, pii summary, role model, blocked
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If data.classes is UNKNOWN → block Completeness Gate.
- If access.scopes is UNKNOWN → block Completeness Gate.
- If audit.fields is UNKNOWN → block Completeness Gate.
- If vendor.breach_notification_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.CRMERP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] data_classes_defined == true
- [ ] least_privilege_defined == true
- [ ] audit_defined == true
- [ ] retention_defined == true
- [ ] vendor_risk_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] CRMERP-10
