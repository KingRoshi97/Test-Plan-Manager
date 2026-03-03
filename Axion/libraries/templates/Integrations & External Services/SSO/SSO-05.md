# SSO-05 — MFA Integration Spec (factors, fallback, enrollment)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-05                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring mfa integration spec (fac |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-01, SSO-03, API-02, API-04                   |
| Produces          | Filled MFA Integration Spec (factors, fallback, e|

## 2. Purpose

Define the canonical SCIM provisioning implementation: supported resources (Users/Groups), lifecycle operations (create/update/deactivate), attribute mapping, authentication, rate limits, idempotency, and failure handling. This template must be consistent with role/claim mapping and AuthZ rules and must not invent endpoints/resources beyond upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-03 Claim/Role Mapping: {{sso.claim_mapping}} | OPTIONAL
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- IXS-04 Secrets/Credentials Policy: {{ixs.secrets_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| provider_id binding       | spec         | No              |
| SCIM enabled (true/false/ | spec         | No              |
| Supported resources (User | spec         | No              |
| Supported operations (POS | spec         | No              |
| Auth method for SCIM (bea | spec         | No              |
| Attribute mapping (SCIM → | spec         | No              |
| Group membership handling | spec         | No              |
| Idempotency rules (extern | spec         | No              |
| Deprovisioning rules (dis | spec         | No              |
| Rate limit policy (for SC | spec         | No              |
| Failure handling (retries | spec         | No              |
| Audit logging requirement | spec         | No              |

## 5. Optional Fields

| Field Name                | Source       | Notes                          |
|---------------------------|--------------|--------------------------------|
| Multi-tenant partitioning | spec         | Enrichment only, no new truth  |
| Schema extensions support | spec         | Enrichment only, no new truth  |
| Open questions            | spec         | Enrichment only, no new truth  |

## 6. Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- SCIM changes MUST be auditable and least-privilege.
- Idempotency MUST be enforced for create/update operations.
- Deprovisioning MUST not orphan privileged access.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## 7. Output Format

### Required Headings (in order)

1. `## MFA Integration Spec (factors, fallback, enrollment)`
2. `## Configuration`
3. `## Dependencies`
4. `## Unknowns & Open Questions`

## 8. Cross-References

- **Upstream**: {{xref:SSO-01}}, {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
- **Downstream**: {{xref:SSO-10}} | OPTIONAL
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

- UNKNOWN_ALLOWED: domain.map, glossary.terms, base path, groups supported/ops,
- If any Required Field is UNKNOWN, allow only if:
- {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
- If scim.enabled is UNKNOWN → block Completeness Gate.
- If auth.method is UNKNOWN → block Completeness Gate (when scim.enabled == true).
- If idem.key_rule is UNKNOWN → block Completeness Gate (when scim.enabled == true).
- If audit.required is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- Gate ID: TMP-05.PRIMARY.SSO
- Pass conditions:
- [ ] required_fields_present == true
- [ ] provider_id_exists_in_SSO_01 == true
- [ ] scim_enablement_defined == true
- [ ] if scim_enabled then resources_ops_mapping_defined == true
- [ ] idempotency_defined == true
- [ ] audit_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
- [ ] SSO-06
