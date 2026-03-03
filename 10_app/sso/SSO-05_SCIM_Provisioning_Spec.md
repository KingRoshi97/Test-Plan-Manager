# SSO-05 — SCIM Provisioning Spec (users/groups lifecycle)

## Header Block

| Field | Value |
|---|---|
| template_id | SSO-05 |
| title | SCIM Provisioning Spec (users/groups lifecycle) |
| type | sso_scim_provisioning_spec |
| template_version | 1.0.0 |
| output_path | 10_app/sso/SSO-05_SCIM_Provisioning_Spec.md |
| compliance_gate_id | TMP-05.PRIMARY.SSO |
| upstream_dependencies | ["SSO-01", "SSO-03", "API-02", "API-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "SSO-01", "SSO-03", "API-01", "API-02", "API-04", "IXS-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical SCIM provisioning implementation: supported resources (Users/Groups),
lifecycle operations (create/update/deactivate), attribute mapping, authentication, rate limits,
idempotency, and failure handling. This template must be consistent with role/claim mapping
and AuthZ rules and must not invent endpoints/resources beyond upstream inputs.

## Inputs Required

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

## Required Fields

- provider_id binding
- SCIM enabled (true/false/UNKNOWN)
- Supported resources (Users/Groups)
- Supported operations (POST/PUT/PATCH/DELETE)
- Auth method for SCIM (bearer token/basic/mTLS/UNKNOWN)
- Attribute mapping (SCIM → internal fields)
- Group membership handling rules
- Idempotency rules (externalId, resourceId)
- Deprovisioning rules (disable/delete)
- Rate limit policy (for SCIM endpoints)
- Failure handling (retries, error responses)
- Audit logging requirements (who/what changed)

## Optional Fields

- Multi-tenant partitioning rules | OPTIONAL
- Schema extensions supported | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- SCIM changes MUST be auditable and least-privilege.
- Idempotency MUST be enforced for create/update operations.
- Deprovisioning MUST not orphan privileged access.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. SCIM Enablement
provider_id: {{meta.provider_id}}
scim_enabled: {{scim.enabled}}
base_path: {{scim.base_path}} | OPTIONAL
2. Resources Supported
users_supported: {{resources.users_supported}}
groups_supported: {{resources.groups_supported}} | OPTIONAL
3. Operations Supported
users_ops: {{ops.users_ops}}
groups_ops: {{ops.groups_ops}} | OPTIONAL
4. Auth
auth_method: {{auth.method}}
credential_ref: {{auth.credential_ref}} (expected: {{xref:IXS-04}}) | OPTIONAL
5. Attribute Mapping
user_attribute_map: {{map.user_attributes}}
group_attribute_map: {{map.group_attributes}} | OPTIONAL
6. Group Membership Handling
membership_update_rule: {{groups.membership_update_rule}}
conflict_rule: {{groups.conflict_rule}} | OPTIONAL
7. Idempotency
idempotency_key_rule: {{idem.key_rule}}
external_id_usage: {{idem.external_id_usage}} | OPTIONAL
8. Deprovisioning
deactivate_rule: {{deprov.deactivate_rule}}
delete_rule: {{deprov.delete_rule}} | OPTIONAL

9. Rate Limits
rate_limit_ref: {{limits.ref}} (expected: {{xref:RLIM-02}}) | OPTIONAL
limits_summary: {{limits.summary}} | OPTIONAL
10.Failure Handling
error_response_rules: {{fail.error_response_rules}}
retry_rules: {{fail.retry_rules}} | OPTIONAL
11.Audit Logging
audit_required: {{audit.required}}
audit_fields: {{audit.fields}} | OPTIONAL
12.References
Provider inventory: {{xref:SSO-01}}
Claim/role mapping: {{xref:SSO-03}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Secrets policy: {{xref:IXS-04}} | OPTIONAL
Error handling: {{xref:IXS-06}} | OPTIONAL

## Cross-References

Upstream: {{xref:SSO-01}}, {{xref:API-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define whether SCIM enabled and which resources/ops; use UNKNOWN
for extensions.
intermediate: Required. Define attribute mapping, idempotency, and deprovisioning rules.
advanced: Required. Add multi-tenant partitioning and strict audit/rate-limit bindings.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, base path, groups supported/ops,
credential ref, group attribute map, conflict rule, external id usage, delete rule, rate limit
ref/summary, retry rules, audit fields, extensions/tenant rules, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If scim.enabled is UNKNOWN → block Completeness Gate.
If auth.method is UNKNOWN → block Completeness Gate (when scim.enabled == true).
If idem.key_rule is UNKNOWN → block Completeness Gate (when scim.enabled == true).
If audit.required is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
provider_id_exists_in_SSO_01 == true
scim_enablement_defined == true
if scim_enabled then resources_ops_mapping_defined == true

idempotency_defined == true
audit_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
