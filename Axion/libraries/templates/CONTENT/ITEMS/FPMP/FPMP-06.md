# FPMP-06 — Security & Compliance for Files (PII, retention, malware)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-06                                             |
| Template Type     | Build / File Processing                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security & compliance for files (pii, retention, malware)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security & Compliance for Files (PII, retention, malware) Document                         |

## 2. Purpose

Define the canonical security and compliance rules for file/media handling end-to-end: allowed
content, malware scanning, quarantine, PII classification/redaction, retention/deletion, access
controls, and audit requirements. This template must be consistent with upload/storage/delivery
rules and must not invent compliance obligations not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.pipeline_stages}}
- FPMP-04 Async Status Model: {{fpmp.async_status}} | OPTIONAL
- FPMP-05 CDN/Delivery Rules: {{fpmp.delivery_rules}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Content policy (allowed/disallowed categories)
Malware scanning requirements (required/optional + timing)
Quarantine rules (where stored, who can access)
PII classification rules for files + derived metadata
Redaction rules (logs, previews, extracted text)
Encryption requirements (at rest/in transit)
Access control model (who can upload/view/download/delete)
Retention and deletion policy (default + overrides)
Legal hold / preservation policy (if applicable)
Audit requirements (uploads, downloads, deletes, overrides)
Incident response hooks (what happens on malware/PII violation)

Optional Fields
DLP integration notes | OPTIONAL
Customer data export policy | OPTIONAL
Regional residency rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
If malware scanning is required, content MUST NOT be served until scan passes (unless
explicitly allowed).
PII handling MUST follow {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL
Access control MUST align to {{xref:API-04}} and storage access modes in {{xref:FPMP-02}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Retention/deletion MUST be enforceable (not “best effort”) unless explicitly allowed.
Output Format
1. Content Policy
allowed_content: {{policy.allowed_content}}
disallowed_content: {{policy.disallowed_content}}
file_type_exceptions: {{policy.file_type_exceptions}} | OPTIONAL
2. Malware Scanning
scan_required: {{malware.scan_required}}
scan_timing: {{malware.scan_timing}} (pre_release/post_upload/UNKNOWN)
scanner_type: {{malware.scanner_type}} | OPTIONAL
on_detected_behavior: {{malware.on_detected_behavior}}
(quarantine/delete/block/UNKNOWN)
notification_policy: {{malware.notification_policy}} | OPTIONAL
3. Quarantine Rules
quarantine_supported: {{quarantine.supported}}
quarantine_location: {{quarantine.location}}
who_can_access_quarantine: {{quarantine.who_can_access}} | OPTIONAL
release_conditions: {{quarantine.release_conditions}} | OPTIONAL
4. PII Classification
pii_policy_ref: {{pii.policy_ref}} | OPTIONAL
file_pii_classes: {{pii.file_classes}}
metadata_pii_classes: {{pii.metadata_classes}} | OPTIONAL
derived_data_rules: {{pii.derived_data_rules}} | OPTIONAL
5. Redaction Rules
logs_redaction: {{redaction.logs}}
preview_redaction: {{redaction.preview}} | OPTIONAL
extracted_text_redaction: {{redaction.extracted_text}} | OPTIONAL
6. Encryption Requirements
in_transit_required: {{encryption.in_transit_required}}

at_rest_required: {{encryption.at_rest_required}}
kms_key_ref: {{encryption.kms_key_ref}} | OPTIONAL
7. Access Control Model
upload_authz: {{access.upload_authz}}
download_authz: {{access.download_authz}}
delete_authz: {{access.delete_authz}}
sharing_policy: {{access.sharing_policy}} | OPTIONAL
8. Retention & Deletion
default_retention: {{retention.default}}
retention_overrides: {{retention.overrides}} | OPTIONAL
deletion_policy: {{retention.deletion_policy}}
secure_delete_required: {{retention.secure_delete_required}} | OPTIONAL
legal_hold_supported: {{retention.legal_hold_supported}} | OPTIONAL
9. Audit Requirements
audit_events:
upload_event: {{audit.events.upload}}
download_event: {{audit.events.download}} | OPTIONAL
delete_event: {{audit.events.delete}}
override_event: {{audit.events.override}} | OPTIONAL
audit_fields: {{audit.fields}}
retention: {{audit.retention}} | OPTIONAL
10.Incident Response Hooks
malware_incident_flow: {{ir.malware_flow}}
pii_incident_flow: {{ir.pii_flow}} | OPTIONAL
escalation_contacts: {{ir.escalation_contacts}} | OPTIONAL
11.References
Upload contract: {{xref:FPMP-01}}
Storage strategy: {{xref:FPMP-02}}
Processing stages: {{xref:FPMP-03}}
Async status model: {{xref:FPMP-04}} | OPTIONAL
CDN/delivery rules: {{xref:FPMP-05}} | OPTIONAL
Observability: {{xref:FPMP-07}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Cross-References
Upstream: {{xref:FPMP-01}}, {{xref:FPMP-02}}, {{xref:FPMP-03}}, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:FPMP-07}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL, {{standards.rules[STD-RETENTION]}} |
OPTIONAL

Skill Level Requiredness Rules
beginner: Required. Use UNKNOWN where scanner/quarantine specifics are missing; do not
invent compliance obligations.
intermediate: Required. Define scanning, PII classes, retention/deletion, and access control
rules.
advanced: Required. Add incident response flows, audit rigor, and derived-data redaction policy.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, file type exceptions, scanner_type,
notification_policy, who_can_access_quarantine, release_conditions, policy_ref,
metadata_classes, derived_data_rules, preview/extracted text redaction, kms_key_ref,
sharing_policy, retention_overrides, secure_delete_required, legal_hold_supported, audit
retention, pii incident flow, escalation contacts, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If malware.scan_required is UNKNOWN → flag in Open Questions.
If access control rules are UNKNOWN → block Completeness Gate.
If deletion_policy is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FPMP
Pass conditions:
required_fields_present == true
content_policy_defined == true
access_control_defined == true
retention_deletion_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

FPMP-07

FPMP-07 — Media Observability (latency, failure rates, QoS)
Header Block

## 5. Optional Fields

DLP integration notes | OPTIONAL
Customer data export policy | OPTIONAL
Regional residency rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- If malware scanning is required, content MUST NOT be served until scan passes (unless
- **explicitly allowed).**
- **PII handling MUST follow {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL**
- **Access control MUST align to {{xref:API-04}} and storage access modes in {{xref:FPMP-02}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- **Retention/deletion MUST be enforceable (not “best effort”) unless explicitly allowed.**

## 7. Output Format

### Required Headings (in order)

1. `## Content Policy`
2. `## Malware Scanning`
3. `## (quarantine/delete/block/UNKNOWN)`
4. `## Quarantine Rules`
5. `## PII Classification`
6. `## Redaction Rules`
7. `## Encryption Requirements`
8. `## Access Control Model`
9. `## Retention & Deletion`
10. `## Audit Requirements`

## 8. Cross-References

- **Upstream: {{xref:FPMP-01}}, {{xref:FPMP-02}}, {{xref:FPMP-03}}, {{xref:SPEC_INDEX}} |**
- OPTIONAL
- **Downstream: {{xref:FPMP-07}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL**
- **Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL, {{standards.rules[STD-RETENTION]}} |
- OPTIONAL
- Skill Level Requiredness Rules
- **beginner: Required. Use UNKNOWN where scanner/quarantine specifics are missing; do not**
- invent compliance obligations.
- **intermediate: Required. Define scanning, PII classes, retention/deletion, and access control**
- rules.
- **advanced: Required. Add incident response flows, audit rigor, and derived-data redaction policy.**
- Unknown Handling
- **UNKNOWN_ALLOWED: domain.map, glossary.terms, file type exceptions, scanner_type,**
- notification_policy, who_can_access_quarantine, release_conditions, policy_ref,
- metadata_classes, derived_data_rules, preview/extracted text redaction, kms_key_ref,
- sharing_policy, retention_overrides, secure_delete_required, legal_hold_supported, audit
- retention, pii incident flow, escalation contacts, open_questions
- **If any Required Field is UNKNOWN, allow only if:**
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If malware.scan_required is UNKNOWN → flag in Open Questions.
- If access control rules are UNKNOWN → block

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
