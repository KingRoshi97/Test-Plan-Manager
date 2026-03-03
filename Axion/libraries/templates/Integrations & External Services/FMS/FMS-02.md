# FMS-02 — Upload Spec (size limits, types, auth, virus scanning)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-02                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring upload spec (size limits, |
| Filled By         | Internal Agent                                   |
| Consumes          | FMS-01, FPMP-01, API-02                          |
| Produces          | Filled Upload Spec (size limits, types, auth, vir|

## 2. Purpose

Define the canonical integration spec for uploading and downloading files/media: signed URL issuance, auth requirements, size/type limits, storage paths, and download access controls. This template must be consistent with upload contract and storage strategy and must not invent API endpoints or access modes beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Provider Inventory: {{fms.storage_inventory}}
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- CSec-01 Token Storage Policy (client): {{csec.token_storage}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Upload flow model (direct | spec         | No              |
| Signed URL supported (yes | spec         | No              |
| Signed URL issuance endpo | spec         | No              |
| Signed URL TTL rule       | spec         | No              |
| Auth required to request  | spec         | No              |
| Upload constraints (max s | spec         | No              |
| Path/key construction rul | spec         | No              |
| Download access model (pu | spec         | No              |
| Authorization checks for  | spec         | No              |
| Virus/malware scanning bi | spec         | No              |
| Telemetry requirements (u | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Multipart upload rules    | spec         | Enrichment only, no new truth  |
| Resume/retry guidance     | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- If signed URLs are used, TTL must be bounded and least-privilege (method/path).
- Download access must enforce AuthZ for private objects.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Upload Spec (size limits, types, auth, virus scanning)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FMS-01}}, {{xref:FPMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FMS-03}}, {{xref:FMS-06}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, authz ref, rate limit ref, naming rule,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If upload.model is UNKNOWN → block Completeness Gate.
- If constraints.max_size_bytes is UNKNOWN → block Completeness Gate.
- If download.access_model is UNKNOWN → block Completeness Gate.
- If telemetry.upload_success_metric is UNKNOWN → block Completeness Gate.
- If scan.required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] upload_and_download_models_defined == true
- [ ] constraints_defined == true
- [ ] path_rules_defined == true
- [ ] scanning_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-03
