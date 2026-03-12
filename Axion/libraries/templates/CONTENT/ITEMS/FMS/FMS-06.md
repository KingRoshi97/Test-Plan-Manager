# FMS-06 — Security & Compliance (PII, malware scanning, encryption)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-06                                             |
| Template Type     | Integration / File & Media Storage                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring security & compliance (pii, malware scanning, encryption)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Security & Compliance (PII, malware scanning, encryption) Document                         |

## 2. Purpose

Define the canonical security and compliance requirements for files/media storage and delivery:
encryption, malware scanning, PII handling, access controls, safe URL issuance, and
auditability. This template must be consistent with file security baseline and integration
compliance rules.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}}
- FMS-02 Upload/Download Spec: {{fms.upload_download}} | OPTIONAL
- FPMP-06 File Security Baseline: {{fpmp.file_security}} | OPTIONAL
- IXS-08 Integration Security Baseline: {{ixs.security_compliance}} | OPTIONAL
- CSec-02 Client Data Protection: {{csec.data_protection}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Encryption in transit rule (TLS)
Encryption at rest rule (bucket encryption)
Malware scanning required (yes/no/UNKNOWN)
Scanning stages/binding (FPMP-06/FPMP-03)
Access control model (public/private/signed)
Signed URL/token rules (TTL, scope)
PII classification for files (what counts)
Retention/deletion binding (FMS-05)
Audit logging requirements (access/download/delete)
Logging/redaction rules (no file contents)
Telemetry requirements (scan failures, access denials)

Optional Fields
Content moderation scanning | OPTIONAL
DLP rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
Files must not be served publicly until required scans pass.
Signed access must be least-privilege (method, path) and short-lived.
Do not log file contents; store metadata only.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Encryption
tls_required: {{crypto.tls_required}}
at_rest_encryption_required: {{crypto.at_rest_required}}
kms_notes: {{crypto.kms_notes}} | OPTIONAL
2. Malware Scanning
scan_required: {{scan.required}}
scan_binding_ref: {{scan.binding_ref}} (expected: {{xref:FPMP-06}}) | OPTIONAL
fail_closed_rule: {{scan.fail_closed_rule}} | OPTIONAL
3. Access Control
access_model: {{access.model}} (public/private/signed/UNKNOWN)
default_private_rule: {{access.default_private_rule}}
public_exceptions: {{access.public_exceptions}} | OPTIONAL
4. Signed Access
signed_supported: {{signed.supported}}
ttl_seconds: {{signed.ttl_seconds}} | OPTIONAL
scope_rule: {{signed.scope_rule}} | OPTIONAL
5. PII Classification
pii_file_types: {{pii.file_types}}
pii_detection_rule: {{pii.detection_rule}} | OPTIONAL
6. Retention / Deletion Binding
retention_ref: {{retention.ref}} (expected: {{xref:FMS-05}}) | OPTIONAL
7. Audit
audit_required: {{audit.required}}
audit_events: {{audit.events}}
audit_fields: {{audit.fields}} | OPTIONAL
8. Logging / Redaction
no_content_logging_rule: {{logs.no_content_logging_rule}}
metadata_allowlist: {{logs.metadata_allowlist}} | OPTIONAL
9. Telemetry
scan_failure_metric: {{telemetry.scan_failure_metric}}
access_denied_metric: {{telemetry.access_denied_metric}} | OPTIONAL

10.References
Upload/download: {{xref:FMS-02}} | OPTIONAL
Retention/lifecycle: {{xref:FMS-05}} | OPTIONAL
File security baseline: {{xref:FPMP-06}} | OPTIONAL
Integration security baseline: {{xref:IXS-08}} | OPTIONAL
Cross-References
Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define access model and tls/at-rest encryption and scan required.
intermediate: Required. Define signed access TTL/scope and audit events and telemetry.
advanced: Required. Add DLP/moderation rules and fail-closed rigor and KMS details.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, kms notes, scan binding/fail-closed,
public exceptions, signed ttl/scope, pii detection, retention ref, audit fields, metadata allowlist,
optional metrics, moderation/dlp, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If crypto.tls_required is UNKNOWN → block Completeness Gate.
If crypto.at_rest_required is UNKNOWN → block Completeness Gate.
If scan.required is UNKNOWN → block Completeness Gate.
If access.default_private_rule is UNKNOWN → block Completeness Gate.
If telemetry.scan_failure_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
encryption_defined == true
scan_and_access_controls_defined == true
audit_and_logging_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

FMS-07

FMS-07 — Access Control Model (ACLs, signed access, tenancy)
Header Block

## 5. Optional Fields

Content moderation scanning | OPTIONAL
DLP rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- **Files must not be served publicly until required scans pass.**
- **Signed access must be least-privilege (method, path) and short-lived.**
- Do not log file contents; store metadata only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Encryption`
2. `## Malware Scanning`
3. `## Access Control`
4. `## Signed Access`
5. `## PII Classification`
6. `## Retention / Deletion Binding`
7. `## Audit`
8. `## Logging / Redaction`
9. `## Telemetry`
10. `## References`

## 8. Cross-References

- **Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:FMS-10}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL

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
