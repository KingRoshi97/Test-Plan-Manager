# SSO-02 — SSO Flow Spec (OIDC/SAML, redirects, state/nonce)

## Header Block

| Field | Value |
|---|---|
| template_id | SSO-02 |
| title | SSO Flow Spec (OIDC/SAML, redirects, state/nonce) |
| type | sso_flow_spec |
| template_version | 1.0.0 |
| output_path | 10_app/sso/SSO-02_SSO_Flow_Spec.md |
| compliance_gate_id | TMP-05.PRIMARY.SSO |
| upstream_dependencies | ["SSO-01", "ROUTE-03", "CSec-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "SSO-01", "ROUTE-03", "ROUTE-04", "CSec-05", "CER-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical SSO login flow(s) per provider and protocol (OIDC/SAML): endpoints,
redirects/callbacks, state/nonce handling, PKCE rules (if applicable), session creation, and
failure cases. This template must align with secure deep link handling and route guard rules and
must not invent providers or callback routes not present in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- ROUTE-03 Deep Link Map (callback routing): {{route.deep_link_map}} | OPTIONAL
- ROUTE-04 Guard Rules: {{route.guard_rules}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}} | OPTIONAL
- CER-04 Session Expiry Handling: {{cer.session_expiry}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- provider_id binding (must exist)
- protocol (OIDC/SAML)
- entrypoint routes (login start)
- callback routes (redirect URI / ACS endpoint)
- state handling rule (CSRF protection)
- nonce handling rule (OIDC)
- PKCE rules (if OIDC public clients)
- token/assertion validation rules (signature, issuer, audience)
- session creation rules (what claims stored)
- error cases and UX handling
- logout flow behavior (SP-initiated/logout redirect)
- telemetry requirements (success/fail, error classes)

## Optional Fields

- Multi-tenant discovery rules | OPTIONAL
- IdP-initiated SAML behavior | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Callback routes MUST be allowlisted and validated; no open redirects.
- State MUST be required for all redirect-based flows.
- Token/assertion signatures MUST be validated; do not skip verification.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Flow Registry (per provider_id)
Flow
provider_id: {{flows[0].provider_id}}
protocol: {{flows[0].protocol}}
login_entry_route: {{flows[0].login_entry_route}}
callback_route: {{flows[0].callback_route}}
logout_route: {{flows[0].logout_route}} | OPTIONAL
2. Redirect / Callback Details
redirect_uri: {{flows[0].redirect_uri}} | OPTIONAL
acs_url: {{flows[0].acs_url}} | OPTIONAL
allowed_redirects: {{flows[0].allowed_redirects}} | OPTIONAL
3. State / Nonce / PKCE
state_rule: {{flows[0].state_rule}}
nonce_rule: {{flows[0].nonce_rule}} | OPTIONAL
pkce_supported: {{flows[0].pkce_supported}} | OPTIONAL
pkce_rule: {{flows[0].pkce_rule}} | OPTIONAL
4. Validation
issuer_rule: {{flows[0].validate.issuer_rule}}
audience_rule: {{flows[0].validate.audience_rule}}
signature_rule: {{flows[0].validate.signature_rule}}
clock_skew_seconds: {{flows[0].validate.clock_skew_seconds}} | OPTIONAL
5. Session Creation
claims_used: {{flows[0].session.claims_used}}
session_duration_policy: {{flows[0].session.duration_policy}} | OPTIONAL
refresh_policy_ref: {{flows[0].session.refresh_policy_ref}} (expected: {{xref:SSO-04}}) |
OPTIONAL
6. Error Handling
error_taxonomy: {{flows[0].errors.taxonomy}}
user_ux_rule: {{flows[0].errors.user_ux_rule}}
retry_rule: {{flows[0].errors.retry_rule}} | OPTIONAL

7. Logout
logout_supported: {{flows[0].logout.supported}}
logout_behavior: {{flows[0].logout.behavior}} | OPTIONAL
8. Telemetry
login_success_metric: {{flows[0].telemetry.success_metric}}
login_failure_metric: {{flows[0].telemetry.failure_metric}} | OPTIONAL
fields: {{flows[0].telemetry.fields}} | OPTIONAL
(Repeat flow blocks per provider_id.)
9. References
Provider inventory: {{xref:SSO-01}}
Claim mapping/provisioning: {{xref:SSO-03}} | OPTIONAL
Session/token exchange: {{xref:SSO-04}} | OPTIONAL
Security controls: {{xref:SSO-09}} | OPTIONAL
Audit/compliance: {{xref:SSO-10}} | OPTIONAL
Secure link handling: {{xref:CSec-05}} | OPTIONAL
Guard rules: {{xref:ROUTE-04}} | OPTIONAL

## Cross-References

Upstream: {{xref:SSO-01}}, {{xref:ROUTE-03}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-03}}, {{xref:SSO-04}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define entry/callback + state + basic validation; use UNKNOWN for
multi-tenant discovery if not applicable.
intermediate: Required. Define nonce/PKCE rules (as applicable) and error taxonomy +
telemetry.
advanced: Required. Add logout rigor, clock skew, and protocol-specific edge cases
(IdP-initiated, tenant discovery).

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, redirect_uri/acs_url/allowed redirects,
nonce/pkce fields, clock skew, session duration/refresh ref, failure metric/fields, logout behavior,
multi-tenant/idp initiated, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If flows[].state_rule is UNKNOWN → block Completeness Gate.
If flows[].validate.signature_rule is UNKNOWN → block Completeness Gate.
If flows[].errors.user_ux_rule is UNKNOWN → block Completeness Gate.
If flows[].telemetry.success_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.SSO

Pass conditions:
required_fields_present == true
provider_ids_exist_in_SSO_01 == true
callback_routes_allowlisted == true
state_and_signature_validation_defined == true
error_and_telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
