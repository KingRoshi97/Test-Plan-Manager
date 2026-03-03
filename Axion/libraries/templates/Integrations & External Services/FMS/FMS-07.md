# FMS-07 — Retention & Lifecycle Policy (archive, delete, compliance)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | FMS-07                                           |
| Template Type     | Integration / File Management                    |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring retention & lifecycle pol |
| Filled By         | Internal Agent                                   |
| Consumes          | FMS-02, API-04, CSec-05                          |
| Produces          | Filled Retention & Lifecycle Policy (archive, del|

## 2. Purpose

Define the canonical access control model for files/media: tenancy boundaries, ACL semantics, signed access rules, who can read/write/delete, and how authorization is enforced across API, storage, and CDN. This template must be consistent with AuthZ rules and secure deep link handling.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}} | OPTIONAL
- FMS-02 Upload/Download Spec: {{fms.upload_download}}
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- CSec-05 Secure Link Handling: {{csec.deep_link_security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Tenancy model (single/ten | spec         | No              |
| Object ownership rule (wh | spec         | No              |
| Access modes (private/pub | spec         | No              |
| ACL model (owner, shared, | spec         | No              |
| Read permission rule (who | spec         | No              |
| Write permission rule (wh | spec         | No              |
| Delete permission rule (w | spec         | No              |
| Signed access issuance ru | spec         | No              |
| Signed token TTL and scop | spec         | No              |
| Cross-tenant access preve | spec         | No              |
| Audit requirements (acces | spec         | No              |
| Telemetry requirements (a | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Share links (time-bound)  | spec         | Enrichment only, no new truth  |
| Admin override rules      | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Cross-tenant access must be impossible by default.
- Signed access must be scoped and short-lived; never grant blanket bucket access.
- ACL changes must be auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Retention & Lifecycle Policy (archive, delete, compliance)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:FMS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, acl fields, admin override, token
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If tenant.cross_tenant_block_rule is UNKNOWN → block Completeness Gate.
- If perm.read_rule is UNKNOWN → block Completeness Gate.
- If perm.write_rule is UNKNOWN → block Completeness Gate.
- If signed.ttl_seconds is UNKNOWN → block Completeness Gate.
- If telemetry.access_denied_metric is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.FMS
- Pass conditions:
- [ ] required_fields_present == true
- [ ] tenancy_and_permissions_defined == true
- [ ] signed_access_defined == true
- [ ] cross_tenant_prevention_defined == true
- [ ] audit_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] FMS-08
