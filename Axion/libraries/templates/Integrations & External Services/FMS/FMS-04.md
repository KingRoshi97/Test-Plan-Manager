# FMS-04 — Access Control Spec (signed URLs, ACLs, expiry)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-04                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring access control spec (sign |
| Filled By         | Internal Agent                                   |
| Consumes          | FMS-01, FPMP-05, FMS-05                          |
| Produces          | Filled Access Control Spec (signed URLs, ACLs, ex|

## 2. Purpose

Define the canonical CDN and delivery policy for files/media: cache headers, access models, variants (sizes/bitrates), purge/invalidation rules, and how signed access is enforced at the edge. This template must be consistent with storage access modes and security/retention constraints.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}}
- FPMP-05 CDN/Delivery Rules: {{fpmp.cdn_rules}} | OPTIONAL
- FMS-02 Upload/Download Spec: {{fms.upload_download}} | OPTIONAL
- FMS-05 Retention/Lifecycle: {{fms.retention}} | OPTIONAL
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| CDN enabled (true/false/U | spec         | No              |
| CDN provider/edge binding | spec         | No              |
| Delivery domains/URLs pol | spec         | No              |
| Cache policy (public/priv | spec         | No              |
| Signed delivery supported | spec         | No              |
| Signed URL/token TTL rule | spec         | No              |
| Variant strategy (image s | spec         | No              |
| Cache key strategy (inclu | spec         | No              |
| Purge/invalidation rules  | spec         | No              |
| Access control enforcemen | spec         | No              |
| Telemetry requirements (e | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Regional edge strategy    | spec         | Enrichment only, no new truth  |
| Origin shielding rules    | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Private media must not be cacheable publicly.
- If signed delivery is used, TTL must be bounded and tied to object/variant.
- Purge rules must not leak private URLs or identifiers.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Access Control Spec (signed URLs, ACLs, expiry)`
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, provider id, url pattern, max age, ttl,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If cdn.enabled is UNKNOWN → block Completeness Gate.
- If cache.public_cache_rule is UNKNOWN → block Completeness Gate.
- If cache.private_cache_rule is UNKNOWN → block Completeness Gate.
- If cachekey.rule is UNKNOWN → block Completeness Gate.
- If telemetry.hit_rate_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] cache_policy_defined == true
- [ ] cdn_and_signed_delivery_defined == true
- [ ] purge_and_cachekey_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-05
