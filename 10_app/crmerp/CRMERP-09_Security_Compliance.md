# CRMERP-09 — Security & Compliance (PII, least privilege, audit)

## Header Block

| Field | Value |
|---|---|
| template_id | CRMERP-09 |
| title | Security & Compliance (PII, least privilege, audit) |
| type | crmerp_security_compliance |
| template_version | 1.0.0 |
| output_path | 10_app/crmerp/CRMERP-09_Security_Compliance.md |
| compliance_gate_id | TMP-05.PRIMARY.CRMERP |
| upstream_dependencies | ["CRMERP-01", "IXS-08", "IXS-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "CRMERP-01", "IXS-08", "IXS-04", "ADMIN-03"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical security and compliance requirements specific to CRM/ERP integrations:
least privilege access, PII/financial data handling, audit requirements, retention/deletion
expectations, and vendor risk controls. This template must be consistent with the general
integration security baseline and must not invent compliance controls not supported by
upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- CRMERP-01 System Inventory: {{crmerp.systems}}
- IXS-08 Integration Security & Compliance: {{ixs.security_compliance}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- ADMIN-03 Audit Trail Spec: {{admin.audit_trail}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- system_id binding
- Data classes handled (PII/financial/etc.)
- Least privilege policy (scopes/roles)
- Credential handling reference (IXS-04)
- Encryption requirements (in transit/at rest)
- Audit requirements (sync writes/reads, admin changes)
- Retention rules (external system storage)
- Deletion propagation (if applicable)
- Vendor risk controls (SLA, breach notification)
- Compliance flags (PCI/PHI/etc. if applicable)

## Optional Fields

- Data residency constraints | OPTIONAL
- DPA/contract references | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- CRM/ERP credentials must be scoped to minimum permissions needed for defined sync
- direction.
- Audit logs must include system_id/object/key for all writes.
- Retention and deletion must be explicit for regulated data.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Data Classes
system_id: {{meta.system_id}}
data_classes: {{data.classes}}
pii_fields_summary: {{data.pii_fields_summary}} | OPTIONAL
2. Least Privilege
access_scopes: {{access.scopes}}
role_model: {{access.role_model}} | OPTIONAL
blocked_permissions: {{access.blocked_permissions}} | OPTIONAL
3. Credential Handling
credential_policy_ref: {{creds.ref}} (expected: {{xref:IXS-04}}) | OPTIONAL
rotation_required: {{creds.rotation_required}} | OPTIONAL
4. Encryption
in_transit: {{crypto.in_transit}}
at_rest: {{crypto.at_rest}} | OPTIONAL
5. Audit
audit_required: {{audit.required}}
audit_fields: {{audit.fields}}
retention_policy: {{audit.retention_policy}} | OPTIONAL
6. Retention / Deletion
retention_policy: {{retention.policy}}
delete_propagation_rule: {{retention.delete_propagation_rule}} | OPTIONAL
7. Vendor Risk
sla_required: {{vendor.sla_required}}
breach_notification_rule: {{vendor.breach_notification_rule}}
security_review_required: {{vendor.security_review_required}} | OPTIONAL
8. Compliance Flags
pci_in_scope: {{compliance.pci_in_scope}} | OPTIONAL
phi_in_scope: {{compliance.phi_in_scope}} | OPTIONAL
other_constraints: {{compliance.other_constraints}} | OPTIONAL

9. References
General integration security: {{xref:IXS-08}} | OPTIONAL
Audit trail baseline: {{xref:ADMIN-03}} | OPTIONAL
Error handling/reconciliation: {{xref:CRMERP-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:CRMERP-01}}, {{xref:IXS-08}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:CRMERP-10}} | OPTIONAL
Standards: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define data classes + encryption in transit + audit required fields.
intermediate: Required. Define least privilege scopes and retention/deletion rules.
advanced: Required. Add data residency/contract references and vendor risk governance rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, pii summary, role model, blocked
permissions, credential ref/rotation, at rest encryption, audit retention, delete propagation,
security review, compliance flags, residency/contract refs, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If data.classes is UNKNOWN → block Completeness Gate.
If access.scopes is UNKNOWN → block Completeness Gate.
If audit.fields is UNKNOWN → block Completeness Gate.
If vendor.breach_notification_rule is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.CRMERP
Pass conditions:
required_fields_present == true
data_classes_defined == true
least_privilege_defined == true
audit_defined == true
retention_defined == true
vendor_risk_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
