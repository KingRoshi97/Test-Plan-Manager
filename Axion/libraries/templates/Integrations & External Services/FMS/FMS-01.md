# FMS-01 — File Storage Provider Inventory (S3, GCS, Azure, local)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-01                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring file storage provider inv |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, FPMP-02                                  |
| Produces          | Filled File Storage Provider Inventory (S3, GCS, |

## 2. Purpose

Create the single, canonical inventory of file/media storage providers and storage targets (buckets/containers), indexed by provider_id and bucket_id, including environment scoping, access modes, and security/compliance flags. This document must not invent provider/bucket IDs beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Provider registry (provid | spec         | No              |
| Bucket/target registry (b | spec         | No              |
| provider_id (stable ident | spec         | No              |
| bucket_id (stable identif | spec         | No              |
| provider/vendor name      | spec         | No              |
| integration_id binding (I | spec         | No              |
| env scope (dev/stage/prod | spec         | No              |
| region/location (if appli | spec         | No              |
| access mode (public/priva | spec         | No              |
| path prefix rules (naming | spec         | No              |
| encryption flags (at rest | spec         | No              |
| retention/lifecycle polic | spec         | No              |
| observability/cost tracki | spec         | No              |
| credential reference (IXS | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| CDN binding (FMS-04)      | spec         | Enrichment only, no new truth  |
| Replication/DR notes      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Buckets/targets must be environment-scoped and least-privilege.
- Do not list secret values; reference credential policies only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## File Storage Provider Inventory (S3, GCS, Azure, local)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FMS-02}}, {{xref:FMS-05}}, {{xref:FMS-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, provider notes, region,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If providers[].provider_id is UNKNOWN → block Completeness Gate.
- If buckets[].bucket_id is UNKNOWN → block Completeness Gate.
- If buckets[].access_mode is UNKNOWN → block Completeness Gate.
- If buckets[].path_prefix_rule is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] provider_ids_unique == true
- [ ] bucket_ids_unique == true
- [ ] env_scoping_defined == true
- [ ] access_modes_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-02
