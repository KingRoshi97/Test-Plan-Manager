# FMS-07 — Access Control Model (ACLs, signed access, tenancy)

## Header Block

| Field | Value |
|---|---|
| template_id | FMS-07 |
| title | Access Control Model (ACLs, signed access, tenancy) |
| type | files_media_access_control_model |
| template_version | 1.0.0 |
| output_path | 10_app/files_media/FMS-07_Access_Control_Model.md |
| compliance_gate_id | TMP-05.PRIMARY.FMS |
| upstream_dependencies | ["FMS-02", "API-04", "CSec-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "FMS-01", "FMS-02", "FMS-06", "API-04", "ROUTE-04", "CSec-05"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical access control model for files/media: tenancy boundaries, ACL semantics,
signed access rules, who can read/write/delete, and how authorization is enforced across API,
storage, and CDN. This template must be consistent with AuthZ rules and secure deep link
handling.

## Inputs Required

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

## Required Fields

- Tenancy model (single/tenant_id/UNKNOWN)
- Object ownership rule (who owns a file)
- Access modes (private/public/signed) allowed
- ACL model (owner, shared, role-based)
- Read permission rule (who can read)
- Write permission rule (who can upload/replace)
- Delete permission rule (who can delete)
- Signed access issuance rule (who can request)
- Signed token TTL and scope rule
- Cross-tenant access prevention rule
- Audit requirements (access, delete)
- Telemetry requirements (access denied, signed url issued)

## Optional Fields

- Share links (time-bound) | OPTIONAL
- Admin override rules | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Cross-tenant access must be impossible by default.
- Signed access must be scoped and short-lived; never grant blanket bucket access.
- ACL changes must be auditable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Tenancy & Ownership
tenancy_model: {{tenant.model}} (single/tenant_id/UNKNOWN)
ownership_rule: {{owner.rule}}
2. Access Modes
allowed_modes: {{modes.allowed}}
default_mode: {{modes.default}}
3. ACL Model
acl_model: {{acl.model}} (owner_only/shared/role_based/UNKNOWN)
acl_fields: {{acl.fields}} | OPTIONAL
4. Permissions
read_rule: {{perm.read_rule}}
write_rule: {{perm.write_rule}}
delete_rule: {{perm.delete_rule}}
admin_override: {{perm.admin_override}} | OPTIONAL
5. Signed Access
who_can_request_signed: {{signed.who_can_request}}
ttl_seconds: {{signed.ttl_seconds}}
scope_rule: {{signed.scope_rule}}
token_validation_rule: {{signed.token_validation_rule}} | OPTIONAL
6. Cross-Tenant Prevention
cross_tenant_block_rule: {{tenant.cross_tenant_block_rule}}
resource_id_validation_rule: {{tenant.resource_id_validation_rule}} | OPTIONAL
7. Audit
audit_required: {{audit.required}}
audit_events: {{audit.events}}
audit_fields: {{audit.fields}} | OPTIONAL

8. Telemetry
access_denied_metric: {{telemetry.access_denied_metric}}
signed_url_issued_metric: {{telemetry.signed_url_issued_metric}} | OPTIONAL
9. References
Upload/download spec: {{xref:FMS-02}}
Security/compliance: {{xref:FMS-06}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Secure links: {{xref:CSec-05}} | OPTIONAL
Retention/lifecycle: {{xref:FMS-05}} | OPTIONAL

## Cross-References

Upstream: {{xref:FMS-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define tenancy model, read/write/delete rules, and signed TTL.
intermediate: Required. Define ACL model, cross-tenant block rule, and audit events.
advanced: Required. Add share links and admin overrides and token validation rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, acl fields, admin override, token
validation, resource id validation, audit fields, signed url issued metric, share links,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If tenant.cross_tenant_block_rule is UNKNOWN → block Completeness Gate.
If perm.read_rule is UNKNOWN → block Completeness Gate.
If perm.write_rule is UNKNOWN → block Completeness Gate.
If signed.ttl_seconds is UNKNOWN → block Completeness Gate.
If telemetry.access_denied_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
tenancy_and_permissions_defined == true
signed_access_defined == true
cross_tenant_prevention_defined == true
audit_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
