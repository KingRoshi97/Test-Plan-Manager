# FPMP-05 — CDN/Delivery Rules (cache headers, variants)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FPMP-05                                          |
| Template Type     | Build / File Processing                          |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring cdn/delivery rules (cache |
| Filled By         | Internal Agent                                   |
| Consumes          | FPMP-02, FPMP-03                                 |
| Produces          | Filled CDN/Delivery Rules (cache headers, variant|

## 2. Purpose

Define the canonical rules for delivering stored files/media to clients, including CDN integration, cache headers, access patterns (signed URLs vs proxy), content variants (sizes/transcodes), and invalidation rules. This template must be consistent with storage strategy and processing pipelines and must not invent delivery capabilities not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}}
- FPMP-03 Processing Pipeline Stages: {{fpmp.pipeline_stages}}
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Delivery surface (direct  | spec         | No              |
| Public vs private deliver | spec         | No              |
| Signed URL delivery rules | spec         | No              |
| Cache header policy (cach | spec         | No              |
| Variant model (original v | spec         | No              |
| Variant selection rules ( | spec         | No              |
| URL/path rules for varian | spec         | No              |
| Invalidation/purge policy | spec         | No              |
| Range requests support (m | spec         | No              |
| Rate limiting/abuse contr | spec         | No              |
| Observability requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Watermarking rules        | spec         | Enrichment only, no new truth  |
| Hotlink protection        | spec         | Enrichment only, no new truth  |
| Compression rules         | spec         | Enrichment only, no new truth  |
| Cross-region delivery not | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Private content MUST not be cacheable in shared caches unless explicitly allowed.
- Variant naming MUST be deterministic and must not collide.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Delivery access control MUST align to {{xref:FPMP-02}} and {{xref:API-04}} | OPTIONAL.

## 7. Output Format

### Required Headings (in order)

1. `## CDN/Delivery Rules (cache headers, variants)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FPMP-02}}, {{xref:FPMP-03}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:FPMP-06}}, {{xref:FPMP-07}} | OPTIONAL
- Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, cdn_provider, base_url,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If delivery.mode is UNKNOWN → block Completeness Gate.
- If cache_control_private is UNKNOWN → block Completeness Gate.
- If variants.selection_rules is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FPMP
- Pass conditions:
- [ ] required_fields_present == true
- [ ] delivery_mode_defined == true
- [ ] cache_policy_defined == true
- [ ] variant_model_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FPMP-06
