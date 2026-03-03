# IXS-08 — Integration Observability

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-08                                           |
| Template Type     | Integration / Core                               |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring integration observability |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, IXS-02, IXS-04, CSec-02, FPMP-06         |
| Produces          | Filled Integration Observability                 |

## 2. Purpose

Define the canonical security and compliance requirements for integrations: data classification, PII handling, retention/deletion expectations, vendor risk controls, encryption requirements, and auditability. This template must be consistent with client/server data protection policies and must not invent compliance guarantees beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}`
- IXS-02 Integration Specs: `{{ixs.integration_specs}}`
- IXS-04 Secrets & Credential Handling: `{{ixs.secrets_policy}}` | OPTIONAL
- CSec-02 Client Data Protection: `{{csec.data_protection}}` | OPTIONAL
- FPMP-06 Security & Compliance for Files: `{{fpmp.file_security}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Data classification model | What classes exist |
| Per-integration data classification | integration_id → classes |
| PII handling rules | Minimize, redact, encrypt |
| Retention rules | Data stored externally, for how long |
| Deletion/right-to-delete handling | If applicable |
| Encryption requirements | In transit/at rest |
| Access control requirements | Least privilege |
| Vendor risk checklist | SLA, breach notification, sub-processors |
| Audit logging requirements | Access, sends/receives |
| Compliance constraints | PCI/PHI/etc. if applicable |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Data residency constraints | OPTIONAL |
| DPA/contract references | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- No integration may transmit/store sensitive data classes unless explicitly approved and documented.
- PII must be minimized; only necessary fields may be sent.
- Retention must be explicit (do not leave "forever").
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}`, `{{xref:IXS-02}}`, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:IXS-10}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-PII-REDACTION]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Define classification + per-integration mapping; use UNKNOWN for contract refs.
- **intermediate**: Required. Define PII handling + retention/deletion + vendor checklist.
- **advanced**: Required. Add data residency, encryption/key management detail, and audit rigor.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, definitions, pii fields, notes, encryption at rest, key mgmt notes, credential policy ref, subprocessor/security review, audit fields/retention, compliance flags, residency/contract refs, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `class.model` is UNKNOWN → block Completeness Gate.
- If `pii.redaction_rule` is UNKNOWN → block Completeness Gate.
- If `retention.policy` is UNKNOWN → block Completeness Gate.
- If `vendor.breach_notification_rule` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.IXS
- [ ] required_fields_present == true
- [ ] classification_defined == true
- [ ] per_integration_mapping_defined == true
- [ ] pii_and_retention_defined == true
- [ ] vendor_risk_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

