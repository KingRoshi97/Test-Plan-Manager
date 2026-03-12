# IXS-08 — Security & Compliance (PII, retention, vendor risk)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | IXS-08                                             |
| Template Type     | Integration / External Systems                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security & compliance (pii, retention, vendor risk)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security & Compliance (PII, retention, vendor risk) Document                         |

## 2. Purpose

Define the canonical security and compliance requirements for integrations: data classification,
PII handling, retention/deletion expectations, vendor risk controls, encryption requirements, and
auditability. This template must be consistent with client/server data protection policies and must
not invent compliance guarantees beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- IXS-02 Integration Specs: {{ixs.integration_specs}}
- IXS-04 Secrets & Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- FPMP-06 Security & Compliance for Files: {{fpmp.file_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Data classification model (what classes exist)
Per-integration data classification (integration_id → classes)
PII handling rules (minimize, redact, encrypt)
Retention rules (data stored externally, for how long)
Deletion/right-to-delete handling (if applicable)
Encryption requirements (in transit/at rest)
Access control requirements (least privilege)
Vendor risk checklist (SLA, breach notification, sub-processors)
Audit logging requirements (access, sends/receives)
Compliance constraints (PCI/PHI/etc. if applicable)

Optional Fields
Data residency constraints | OPTIONAL
DPA/contract references | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
No integration may transmit/store sensitive data classes unless explicitly approved and
documented.
PII must be minimized; only necessary fields may be sent.
Retention must be explicit (do not leave “forever”).
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Output Format
1. Data Classification Model
classes: {{class.model}}
definitions: {{class.definitions}} | OPTIONAL
2. Per-Integration Classification
Classification
integration_id: {{per[0].integration_id}}
data_classes: {{per[0].data_classes}}
pii_fields: {{per[0].pii_fields}} | OPTIONAL
notes: {{per[0].notes}} | OPTIONAL
(Repeat per integration_id.)
3. PII Handling Rules
minimize_rule: {{pii.minimize_rule}}
redaction_rule: {{pii.redaction_rule}}
encryption_rule: {{pii.encryption_rule}} | OPTIONAL
4. Retention & Deletion
retention_policy: {{retention.policy}}
delete_propagation_rule: {{retention.delete_propagation_rule}} | OPTIONAL
right_to_delete_supported: {{retention.rtd_supported}} | OPTIONAL
5. Encryption Requirements
in_transit: {{crypto.in_transit}}
at_rest: {{crypto.at_rest}} | OPTIONAL
key_management_notes: {{crypto.key_mgmt_notes}} | OPTIONAL
6. Access Control
least_privilege_rule: {{access.least_privilege_rule}}
credential_policy_ref: {{access.credential_policy_ref}} (expected: {{xref:IXS-04}}) |
OPTIONAL

7. Vendor Risk Checklist
sla_required: {{vendor.sla_required}}
breach_notification_rule: {{vendor.breach_notification_rule}}
subprocessor_policy: {{vendor.subprocessor_policy}} | OPTIONAL
security_review_required: {{vendor.security_review_required}} | OPTIONAL
8. Audit Logging
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
retention_policy: {{audit.retention_policy}} | OPTIONAL
9. Compliance Constraints
pci_in_scope: {{compliance.pci_in_scope}} | OPTIONAL
phi_in_scope: {{compliance.phi_in_scope}} | OPTIONAL
other_constraints: {{compliance.other_constraints}} | OPTIONAL
10.References
Integration inventory: {{xref:IXS-01}}
Integration specs: {{xref:IXS-02}}
Secrets policy: {{xref:IXS-04}} | OPTIONAL
Client data protection: {{xref:CSec-02}} | OPTIONAL
File security: {{xref:FPMP-06}} | OPTIONAL
Cross-References
Upstream: {{xref:IXS-01}}, {{xref:IXS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-10}} | OPTIONAL
Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define classification + per-integration mapping; use UNKNOWN for
contract refs.
intermediate: Required. Define PII handling + retention/deletion + vendor checklist.
advanced: Required. Add data residency, encryption/key management detail, and audit rigor.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, pii fields, notes, encryption at
rest, key mgmt notes, credential policy ref, subprocessor/security review, audit fields/retention,
compliance flags, residency/contract refs, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If class.model is UNKNOWN → block Completeness Gate.
If pii.redaction_rule is UNKNOWN → block Completeness Gate.
If retention.policy is UNKNOWN → block Completeness Gate.
If vendor.breach_notification_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.IXS

Pass conditions:
required_fields_present == true
classification_defined == true
per_integration_mapping_defined == true
pii_and_retention_defined == true
vendor_risk_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

IXS-09

IXS-09 — Sandbox/Test Environment Strategy (stubs, mocks, fixtures)
Header Block

## 5. Optional Fields

Data residency constraints | OPTIONAL
DPA/contract references | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **No integration may transmit/store sensitive data classes unless explicitly approved and**
- **documented.**
- **PII must be minimized; only necessary fields may be sent.**
- **Retention must be explicit (do not leave “forever”).**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## Data Classification Model`
2. `## Per-Integration Classification`
3. `## Classification`
4. `## (Repeat per integration_id.)`
5. `## PII Handling Rules`
6. `## Retention & Deletion`
7. `## Encryption Requirements`
8. `## Access Control`
9. `## OPTIONAL`
10. `## Vendor Risk Checklist`

## 8. Cross-References

- **Upstream: {{xref:IXS-01}}, {{xref:IXS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:IXS-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

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
