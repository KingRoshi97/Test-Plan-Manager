# FMS-05 — File Processing Pipeline (thumbnails, transcoding, OCR)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-05                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring file processing pipeline  |
| Filled By         | Internal Agent                                   |
| Consumes          | FMS-01, FMS-06, FPMP-06                          |
| Produces          | Filled File Processing Pipeline (thumbnails, tran|

## 2. Purpose

Define the canonical retention, lifecycle, and deletion rules for stored files/media: TTLs by class, archival policies, deletion propagation, and legal/PII constraints. This template must be consistent with file security/compliance rules and must not invent retention obligations without upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Provider Inventory: {{fms.storage_inventory}}
- FMS-02 Upload/Download Spec: {{fms.upload_download}} | OPTIONAL
- FMS-06 Security/Compliance for Files: {{fms.security}} | OPTIONAL
- FPMP-06 Security & Compliance for Files: {{fpmp.file_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| File classification model | spec         | No              |
| Retention policy per clas | spec         | No              |
| Archival policy (when/how | spec         | No              |
| Deletion policy (who can  | spec         | No              |
| Deletion propagation rule | spec         | No              |
| Legal hold rule (if appli | spec         | No              |
| Secure delete expectation | spec         | No              |
| Telemetry requirements (s | spec         | No              |
| Audit requirements (delet | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Per-bucket overrides      | spec         | Enrichment only, no new truth  |
| User export/download poli | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Retention must be explicit; avoid “forever” unless justified.
- Deletion must propagate to derived variants and caches per rule.
- Legal holds must override deletion/TTL when enabled.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## File Processing Pipeline (thumbnails, transcoding, OCR)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FMS-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, definitions, archive after days, notes,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If class.model is UNKNOWN → block Completeness Gate.
- If delete.propagation_rule is UNKNOWN → block Completeness Gate.
- If telemetry.storage_growth_metric is UNKNOWN → block Completeness Gate.
- If audit.required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] classification_and_ttls_defined == true
- [ ] deletion_and_propagation_defined == true
- [ ] telemetry_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-06
