# WHCP-06 — Endpoint Registration & Management (subscriptions, secrets)

## Header Block

| Field | Value |
|---|---|
| template_id | WHCP-06 |
| title | Endpoint Registration & Management (subscriptions, secrets) |
| type | webhook_endpoint_registration_management |
| template_version | 1.0.0 |
| output_path | 10_app/webhooks/WHCP-06_Endpoint_Registration_Management.md |
| compliance_gate_id | TMP-05.PRIMARY.WHCP |
| upstream_dependencies | ["WHCP-01", "WHCP-05", "ADMIN-01"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "WHCP-01", "WHCP-05", "IXS-04", "API-04", "ADMIN-01"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical subscription/endpoint registration and lifecycle management for webhooks:
how consumers register endpoints, choose events, manage secrets, rotate credentials, and how
admins operate and audit these subscriptions. This template must be consistent with webhook
security rules and AuthZ/admin capability controls.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- WHCP-01 Webhook Catalog: {{whcp.catalog}}
- WHCP-05 Security Rules: {{whcp.security_rules}}
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- ADMIN-01 Admin Capabilities Matrix: {{admin.capabilities}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Subscription entity model (subscription_id, owner)
- Registration flow (API/UI/admin)
- Endpoint URL validation rules (https only, allowlist)
- Event selection rules (which webhook_ids can subscribe)
- Secret management rules (create/rotate/revoke)
- Verification handshake rules (challenge/response) if used
- Pause/resume rules
- Deletion/unsubscribe rules
- Access control rules (who can manage subscriptions)
- Audit logging requirements (create/update/rotate/delete)
- Telemetry requirements (active subs, failures by sub)

## Optional Fields

- Test delivery (“send test webhook”) | OPTIONAL
- Per-tenant subscription limits | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Registration MUST validate endpoint URLs and must not permit open redirects or non-HTTPS
- endpoints (unless explicitly allowed).
- Secrets MUST be handled per {{xref:IXS-04}} and rotated safely.
- Access control MUST be enforced server-side per {{xref:API-04}}.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Subscription Model
subscription_id_field: {{model.subscription_id_field}}
owner_field: {{model.owner_field}}
tenant_field: {{model.tenant_field}} | OPTIONAL
status_field: {{model.status_field}} | OPTIONAL
2. Registration Flow
supported_surfaces: {{reg.surfaces}} (api/ui/admin/UNKNOWN)
registration_steps: {{reg.steps}}
verification_handshake: {{reg.verification_handshake}} | OPTIONAL
3. Endpoint URL Validation
https_required: {{url.https_required}}
allowed_domains_rule: {{url.allowed_domains_rule}} | OPTIONAL
url_normalization_rule: {{url.normalization_rule}} | OPTIONAL
4. Event Selection
allowed_webhook_ids: {{events.allowed_webhook_ids}}
default_enabled_webhook_ids: {{events.default_enabled}} | OPTIONAL
5. Secrets Management
secret_created_on_register: {{secrets.created_on_register}}
rotation_supported: {{secrets.rotation_supported}}
rotation_process: {{secrets.rotation_process}} | OPTIONAL
secret_ref_policy: {{secrets.secret_ref_policy}} (expected: {{xref:IXS-04}}) | OPTIONAL
6. Pause / Resume / Delete
pause_supported: {{lifecycle.pause_supported}}
resume_supported: {{lifecycle.resume_supported}} | OPTIONAL
delete_supported: {{lifecycle.delete_supported}}
delete_behavior: {{lifecycle.delete_behavior}} | OPTIONAL
7. Access Control
who_can_register: {{access.who_can_register}}

who_can_manage: {{access.who_can_manage}}
admin_override_supported: {{access.admin_override_supported}} | OPTIONAL
8. Audit Logging
audit_required: {{audit.required}}
audit_events: {{audit.events}}
audit_fields: {{audit.fields}} | OPTIONAL
9. Telemetry
active_subscriptions_metric: {{telemetry.active_subscriptions_metric}}
delivery_failures_by_sub_metric: {{telemetry.failures_by_sub_metric}} | OPTIONAL
10.References
Webhook catalog: {{xref:WHCP-01}}
Security rules: {{xref:WHCP-05}}
Secrets policy: {{xref:IXS-04}} | OPTIONAL
AuthZ rules: {{xref:API-04}} | OPTIONAL
Admin capabilities: {{xref:ADMIN-01}} | OPTIONAL

## Cross-References

Upstream: {{xref:WHCP-01}}, {{xref:WHCP-05}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:WHCP-07}}, {{xref:WHCP-08}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define subscription model + url validation + allowed webhook ids.
intermediate: Required. Define secrets rotation + pause/delete + access control + audit events.
advanced: Required. Add verification handshake, subscription limits, and test delivery and
telemetry rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, tenant/status fields, handshake, allowed
domains, normalization, defaults, rotation process, secret ref policy, resume/delete behavior,
admin override, audit fields, optional telemetry metrics, test delivery, limits, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If reg.steps is UNKNOWN → block Completeness Gate.
If url.https_required is UNKNOWN → block Completeness Gate.
If events.allowed_webhook_ids is UNKNOWN → block Completeness Gate.
If audit.required is UNKNOWN → block Completeness Gate.
If telemetry.active_subscriptions_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.WHCP
Pass conditions:
required_fields_present == true
registration_and_url_validation_defined == true
event_selection_defined == true

access_control_and_audit_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
