# SSO-09 — Security Controls (PKCE, signature validation, replay defense)

## Header Block

| Field | Value |
|---|---|
| template_id | SSO-09 |
| title | Security Controls (PKCE, signature validation, replay defense) |
| type | sso_security_controls |
| template_version | 1.0.0 |
| output_path | 10_app/sso/SSO-09_Security_Controls.md |
| compliance_gate_id | TMP-05.PRIMARY.SSO |
| upstream_dependencies | ["SSO-02", "CSec-01", "CSec-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "SSO-01", "SSO-02", "SSO-04", "CSec-01", "CSec-05", "CER-05"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical security control requirements for SSO: PKCE usage, redirect/callback
hardening, token/assertion signature validation, replay defenses (state/nonce), secure
cookie/session settings, and logging/redaction. This template must be consistent with client
token storage and deep link security and must not invent controls not applicable to the chosen
protocol/provider.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}}
- SSO-04 Session/Token Exchange: {{sso.session_rules}} | OPTIONAL
- CSec-01 Token Storage: {{csec.token_storage}} | OPTIONAL
- CSec-05 Secure Deep Link Handling: {{csec.deep_link_security}} | OPTIONAL
- CER-05 Logging/Redaction: {{cer.logging}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Provider/protocol applicability map (provider_id → controls)
- Redirect URI allowlist rule
- State required rule (CSRF)
- Nonce required rule (OIDC)
- PKCE required rule (where applicable)
- Signature validation rule (JWT/SAML)
- Issuer/audience validation rules
- Replay prevention window rules (nonce/state TTL)
- Secure session settings (cookie flags / token storage constraints)
- Key rotation/JWKS caching rules
- Logging/redaction rules (no tokens/PII)
- Security telemetry requirements (validation failures)

## Optional Fields

- mTLS between app and IdP | OPTIONAL
- Advanced token binding (DPoP/MTLS OIDC) | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- No skipping signature validation.
- No dynamic redirects; redirect URIs must be fixed/allowlisted.
- Controls must be deterministic and enforceable.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Applicability Map
Provider Controls
provider_id: {{controls[0].provider_id}}
protocol: {{controls[0].protocol}}
pkce_required: {{controls[0].pkce_required}} | OPTIONAL
state_required: {{controls[0].state_required}}
nonce_required: {{controls[0].nonce_required}} | OPTIONAL
signature_validation: {{controls[0].signature_validation}}
issuer_validation: {{controls[0].issuer_validation}}
audience_validation: {{controls[0].audience_validation}}
jwks_cache_rule: {{controls[0].jwks_cache_rule}} | OPTIONAL
notes: {{controls[0].notes}} | OPTIONAL
(Repeat per provider_id.)
2. Redirect & Callback Hardening
redirect_allowlist_rule: {{redirect.allowlist_rule}}
no_open_redirects_rule: {{redirect.no_open_redirects_rule}}
callback_path_validation: {{redirect.callback_path_validation}} | OPTIONAL
3. State / Nonce / Replay
state_ttl_seconds: {{replay.state_ttl_seconds}}
nonce_ttl_seconds: {{replay.nonce_ttl_seconds}} | OPTIONAL
single_use_nonce: {{replay.single_use_nonce}} | OPTIONAL
4. PKCE
pkce_method: {{pkce.method}} (S256/plain/UNKNOWN) | OPTIONAL
required_for_clients: {{pkce.required_for_clients}} | OPTIONAL

5. Signature / Claims Validation
signature_rule: {{validate.signature_rule}}
issuer_rule: {{validate.issuer_rule}}
audience_rule: {{validate.audience_rule}}
alg_allowlist: {{validate.alg_allowlist}} | OPTIONAL
clock_skew_seconds: {{validate.clock_skew_seconds}} | OPTIONAL
6. Key Rotation / JWKS
jwks_fetch_rule: {{keys.jwks_fetch_rule}} | OPTIONAL
jwks_rotation_handling: {{keys.rotation_handling}} | OPTIONAL
7. Session Security
session_storage_ref: {{session.storage_ref}} (expected: {{xref:CSec-01}}) | OPTIONAL
cookie_flags_rule: {{session.cookie_flags_rule}} | OPTIONAL
token_redaction_rule: {{session.token_redaction_rule}}
8. Logging / Redaction
no_token_in_logs: {{logs.no_token_in_logs}}
no_pii_in_logs: {{logs.no_pii_in_logs}} | OPTIONAL
log_fields_allowlist: {{logs.field_allowlist}} | OPTIONAL
9. Security Telemetry
signature_fail_metric: {{telemetry.signature_fail_metric}}
state_nonce_fail_metric: {{telemetry.state_nonce_fail_metric}} | OPTIONAL
issuer_audience_fail_metric: {{telemetry.issuer_audience_fail_metric}} | OPTIONAL
10.References
Flow spec: {{xref:SSO-02}}
Session/token rules: {{xref:SSO-04}} | OPTIONAL
Token storage: {{xref:CSec-01}} | OPTIONAL
Secure deep links: {{xref:CSec-05}} | OPTIONAL
Logging/redaction: {{xref:CER-05}} | OPTIONAL

## Cross-References

Upstream: {{xref:SSO-01}}, {{xref:SSO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define state + signature validation + redirect allowlist; use UNKNOWN for
advanced token binding.
intermediate: Required. Define nonce/PKCE applicability and replay TTLs and JWKS caching.
advanced: Required. Add algorithm allowlists, rotation handling, and security telemetry rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, pkce required, nonce required, jwks
cache, notes, callback path validation, nonce ttl, single-use nonce, pkce method/clients, alg
allowlist, clock skew, jwks fetch/rotation, session storage/cookie flags, log allowlist, optional
telemetry metrics, mtls/dpop, open_questions
If any Required Field is UNKNOWN, allow only if:

{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If redirect.allowlist_rule is UNKNOWN → block Completeness Gate.
If validate.signature_rule is UNKNOWN → block Completeness Gate.
If validate.issuer_rule is UNKNOWN → block Completeness Gate.
If session.token_redaction_rule is UNKNOWN → block Completeness Gate.
If telemetry.signature_fail_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
redirect_and_replay_controls_defined == true
signature_and_claims_validation_defined == true
session_security_defined == true
security_telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
