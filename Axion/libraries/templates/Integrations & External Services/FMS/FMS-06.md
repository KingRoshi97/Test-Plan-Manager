# FMS-06 — CDN & Delivery Spec (caching, edge, variants)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-06                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring cdn & delivery spec (cach |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-06, IXS-08, FMS-02                          |
| Produces          | Filled CDN & Delivery Spec (caching, edge, varian|

## 2. Purpose

Define the canonical security and compliance requirements for files/media storage and delivery: encryption, malware scanning, PII handling, access controls, safe URL issuance, and auditability. This template must be consistent with file security baseline and integration compliance rules.

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

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Encryption in transit rul | spec         | No              |
| Encryption at rest rule ( | spec         | No              |
| Malware scanning required | spec         | No              |
| Scanning stages/binding ( | spec         | No              |
| Access control model (pub | spec         | No              |
| Signed URL/token rules (T | spec         | No              |
| PII classification for fi | spec         | No              |
| Retention/deletion bindin | spec         | No              |
| Audit logging requirement | spec         | No              |
| Logging/redaction rules ( | spec         | No              |
| Telemetry requirements (s | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Content moderation scanni | spec         | Enrichment only, no new truth  |
| DLP rules                 | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Files must not be served publicly until required scans pass.
- Signed access must be least-privilege (method, path) and short-lived.
- Do not log file contents; store metadata only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## CDN & Delivery Spec (caching, edge, variants)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FMS-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, kms notes, scan binding/fail-closed,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If crypto.tls_required is UNKNOWN → block Completeness Gate.
- If crypto.at_rest_required is UNKNOWN → block Completeness Gate.
- If scan.required is UNKNOWN → block Completeness Gate.
- If access.default_private_rule is UNKNOWN → block Completeness Gate.
- If telemetry.scan_failure_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] encryption_defined == true
- [ ] scan_and_access_controls_defined == true
- [ ] audit_and_logging_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-07
