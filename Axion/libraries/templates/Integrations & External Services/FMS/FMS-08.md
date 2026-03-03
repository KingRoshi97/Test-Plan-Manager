# FMS-08 — File Metadata & Search (indexing, tags, full-text)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-08                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring file metadata & search (i |
| Filled By         | Internal Agent                                   |
| Consumes          | FMS-02, DATA-06, PFS-01                          |
| Produces          | Filled File Metadata & Search (indexing, tags, fu|

## 2. Purpose

Define the canonical metadata model for files/media and how that metadata is indexed/searchable: tag fields, searchable facets, EXIF extraction/stripping policy, and privacy constraints. This template must be consistent with canonical schemas and query contracts.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-02 Upload/Download Spec: {{fms.upload_download}}
- DATA-06 Canonical Schemas (file metadata): {{data.schemas}} | OPTIONAL
- PFS-01 Query Contract (filters/sorts): {{pfs.query_contract}} | OPTIONAL
- FPMP-03 Processing Stages (metadata extraction): {{fpmp.stages}} | OPTIONAL
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Metadata entity/schema re | spec         | No              |
| Core metadata fields list | spec         | No              |
| Tagging model (user tags/ | spec         | No              |
| Search/index fields list  | spec         | No              |
| EXIF policy (strip/retain | spec         | No              |
| Derived metadata extracti | spec         | No              |
| PII policy for metadata ( | spec         | No              |
| Index update rules (on up | spec         | No              |
| Telemetry requirements (i | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Full-text search support  | spec         | Enrichment only, no new truth  |
| Versioning of metadata sc | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- EXIF and other embedded metadata must be handled explicitly; default to stripping sensitive
- fields unless approved.
- Only allow filtering/sorting on indexed fields per PFS contract; reject unsupported queries.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## File Metadata & Search (indexing, tags, full-text)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FMS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FMS-09}}, {{xref:FMS-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, schema ref, allowed tag fields, sortable
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If fields.core is UNKNOWN → block Completeness Gate.
- If index.fields is UNKNOWN → block Completeness Gate.
- If exif.policy is UNKNOWN → block Completeness Gate.
- If update.on_delete is UNKNOWN → block Completeness Gate.
- If telemetry.index_lag_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] core_fields_defined == true
- [ ] index_fields_defined == true
- [ ] exif_and_pii_policies_defined == true
- [ ] update_rules_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-09
