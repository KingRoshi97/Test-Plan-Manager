# FPMP-06 — Security & Compliance for Files (PII, retention, malware)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-06                                          |
| Template Type     | Build / File Processing                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring security & compliance for |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-01, FPMP-02, FPMP-03, FPMP-04, FPMP-05      |
| Produces          | Filled Security & Compliance for Files (PII, rete|

## 2. Purpose

Define the canonical security and compliance rules for file/media handling end-to-end: allowed content, malware scanning, quarantine, PII classification/redaction, retention/deletion, access controls, and audit requirements. This template must be consistent with upload/storage/delivery rules and must not invent compliance obligations not present in upstream inputs.

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

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Content policy (allowed/d | spec         | No              |
| Malware scanning requirem | spec         | No              |
| Quarantine rules (where s | spec         | No              |
| PII classification rules  | spec         | No              |
| Redaction rules (logs, pr | spec         | No              |
| Encryption requirements ( | spec         | No              |
| Access control model (who | spec         | No              |
| Retention and deletion po | spec         | No              |
| Legal hold / preservation | spec         | No              |
| Audit requirements (uploa | spec         | No              |
| Incident response hooks ( | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| DLP integration notes     | spec         | Enrichment only, no new truth  |
| Customer data export poli | spec         | Enrichment only, no new truth  |
| Regional residency rules  | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- If malware scanning is required, content MUST NOT be served until scan passes (unless
- explicitly allowed).
- PII handling MUST follow {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL
- Access control MUST align to {{xref:API-04}} and storage access modes in {{xref:FPMP-02}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Retention/deletion MUST be enforceable (not “best effort”) unless explicitly allowed.

## 7. Output Format

### Required Headings (in order)

1. `## Security & Compliance for Files (PII, retention, malware)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FPMP-01}}, {{xref:FPMP-02}}, {{xref:FPMP-03}}, {{xref:SPEC_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:FPMP-07}} | OPTIONAL, {{xref:ADMIN-03}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-PII-CLASSIFICATION]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL, {{standards.rules[STD-RETENTION]}} |
- OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, file type exceptions, scanner_type,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If malware.scan_required is UNKNOWN → flag in Open Questions.
- If access control rules are UNKNOWN → block Completeness Gate.
- If deletion_policy is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FPMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] content_policy_defined == true
- [ ] access_control_defined == true
- [ ] retention_deletion_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FPMP-07
