# FPMP-02 — Storage Strategy (buckets, paths, access modes)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-02                                          |
| Template Type     | Build / File Processing                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring storage strategy (buckets |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-01                                          |
| Produces          | Filled Storage Strategy (buckets, paths, access m|

## 2. Purpose

Define the canonical storage strategy for uploaded files/media, including bucket/container layout, object key/path conventions, access modes, signed URL policies, encryption, retention, and lifecycle rules. This template must be consistent with the upload contract and must not invent storage capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Storage provider/surface  | spec         | No              |
| Bucket/container inventor | spec         | No              |
| Path/key naming conventio | spec         | No              |
| Tenant scoping in paths ( | spec         | No              |
| Access modes (private/pub | spec         | No              |
| Signed URL policy (who ca | spec         | No              |
| Encryption policy (at res | spec         | No              |
| Retention and lifecycle r | spec         | No              |
| Metadata model (what meta | spec         | No              |
| Versioning policy (overwr | spec         | No              |
| Audit requirements for ac | spec         | No              |
| Observability requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Multi-region replication  | spec         | Enrichment only, no new truth  |
| CDN integration pointer   | spec         | Enrichment only, no new truth  |
| Cold storage tiers        | spec         | Enrichment only, no new truth  |
| Legal hold policy         | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Paths MUST include tenant scope identifiers if multi-tenant.
- Access MUST default to private unless explicitly allowed.
- Signed URL minting MUST obey AuthZ policy ({{xref:API-04}}) | OPTIONAL
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not store secrets; store references only.

## 7. Output Format

### Required Headings (in order)

1. `## Storage Strategy (buckets, paths, access modes)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FPMP-01}}, {{xref:SPEC_INDEX}} | OPTIONAL, {{xref:STANDARDS_INDEX}} |
- OPTIONAL
- **Downstream**: {{xref:FPMP-03}}, {{xref:FPMP-05}}, {{xref:FPMP-06}}, {{xref:FPMP-07}} |
- OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECRETS]}} | OPTIONAL, {{standards.rules[STD-SECURITY]}} |
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, region, encryption, versioning,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If paths.object_key_template is UNKNOWN → block Completeness Gate.
- If access.default is UNKNOWN → block Completeness Gate.
- If signed_urls_supported == true and signed.ttl_seconds is UNKNOWN → block Completeness

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FPMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] bucket_inventory_defined == true
- [ ] path_convention_defined == true
- [ ] access_policy_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FPMP-03
