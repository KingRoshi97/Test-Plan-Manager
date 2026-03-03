# SSO-04 — Session & Token Exchange Rules (refresh, expiry, rotation)

## Header Block

| Field | Value |
|---|---|
| template_id | SSO-04 |
| title | Session & Token Exchange Rules (refresh, expiry, rotation) |
| type | sso_session_token_exchange_rules |
| template_version | 1.0.0 |
| output_path | 10_app/sso/SSO-04_Session_Token_Exchange_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.SSO |
| upstream_dependencies | ["SSO-02", "CSec-01", "CER-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "SSO-01", "SSO-02", "CSec-01", "CER-04", "API-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical rules for exchanging SSO assertions/tokens into application sessions,
including session duration, refresh behavior, token storage/rotation, revocation handling, and
logout semantics. This template must be consistent with client token storage and session expiry
handling and must not invent auth mechanisms not present in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SSO-01 Provider Inventory: {{sso.providers}}
- SSO-02 Flow Spec: {{sso.flows}}
- CSec-01 Token Storage Policy: {{csec.token_storage}} | OPTIONAL
- CER-04 Session Expiry Handling: {{cer.session_expiry}} | OPTIONAL
- API-04 AuthZ Rules: {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- provider_id binding
- session model (cookie/session token/jwt/UNKNOWN)
- session creation rule (what is issued, where)
- session duration policy (absolute/idle)
- refresh supported (yes/no/UNKNOWN)
- refresh trigger rules (when to refresh)
- refresh failure behavior (re-auth/logout)
- token rotation rules (if applicable)
- revocation handling (IdP revoked, user disabled)
- logout behavior (local + IdP logout)
- secure storage binding (CSec-01)
- telemetry requirements (refresh success/fail, expiry)

## Optional Fields

- Backchannel logout (OIDC) | OPTIONAL
- Session binding to device/browser | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Tokens MUST be stored/handled per {{xref:CSec-01}}.
- Session expiry behavior MUST align to {{xref:CER-04}}.
- Refresh loops must be prevented; failures must degrade safely.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Session Model
provider_id: {{meta.provider_id}}
session_model: {{session.model}} (cookie/jwt/session_token/UNKNOWN)
issued_artifacts: {{session.issued_artifacts}}
storage_ref: {{session.storage_ref}} (expected: {{xref:CSec-01}}) | OPTIONAL
2. Session Duration
absolute_ttl_seconds: {{ttl.absolute_ttl_seconds}}
idle_ttl_seconds: {{ttl.idle_ttl_seconds}} | OPTIONAL
renew_on_activity: {{ttl.renew_on_activity}} | OPTIONAL
3. Refresh
refresh_supported: {{refresh.supported}}
trigger_rule: {{refresh.trigger_rule}} | OPTIONAL
max_refresh_attempts: {{refresh.max_attempts}} | OPTIONAL
on_refresh_fail: {{refresh.on_fail}}
4. Rotation
rotation_supported: {{rotation.supported}}
rotation_rule: {{rotation.rule}} | OPTIONAL
5. Revocation Handling
revocation_signals: {{revoke.signals}}
on_revoked_behavior: {{revoke.on_revoked_behavior}}
6. Logout
local_logout_clears: {{logout.local_clears}}
idp_logout_supported: {{logout.idp_supported}} | OPTIONAL
idp_logout_rule: {{logout.idp_rule}} | OPTIONAL
7. Telemetry
session_created_metric: {{telemetry.session_created_metric}}
refresh_success_metric: {{telemetry.refresh_success_metric}} | OPTIONAL
refresh_failure_metric: {{telemetry.refresh_failure_metric}} | OPTIONAL
session_expired_metric: {{telemetry.session_expired_metric}} | OPTIONAL

8. References
Flow spec: {{xref:SSO-02}}
Claim mapping/provisioning: {{xref:SSO-03}} | OPTIONAL
Token storage policy: {{xref:CSec-01}} | OPTIONAL
Session expiry handling: {{xref:CER-04}} | OPTIONAL
Security controls: {{xref:SSO-09}} | OPTIONAL

## Cross-References

Upstream: {{xref:SSO-01}}, {{xref:SSO-02}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SSO-05}}, {{xref:SSO-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define session model + TTL + refresh fail behavior; use UNKNOWN for
rotation if not used.
intermediate: Required. Define refresh trigger rules and revocation handling and logout
behavior.
advanced: Required. Add backchannel/device binding and strict telemetry fields and loop
prevention.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, storage ref, idle ttl/renewal, refresh
trigger/max attempts, rotation rule, idp logout details, optional telemetry metrics,
backchannel/device binding, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If session.model is UNKNOWN → block Completeness Gate.
If ttl.absolute_ttl_seconds is UNKNOWN → block Completeness Gate.
If refresh.on_fail is UNKNOWN → block Completeness Gate (when refresh.supported == true).
If revoke.on_revoked_behavior is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
provider_id_exists_in_SSO_01 == true
session_model_and_ttl_defined == true
refresh_or_no_refresh_defined == true
revocation_and_logout_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
