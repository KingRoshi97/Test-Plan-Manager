# SSO-02 — SSO Protocol Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-02                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring sso protocol spec         |
| Filled By         | Internal Agent                                   |
| Consumes          | SSO-01, ROUTE-03, CSec-05                        |
| Produces          | Filled SSO Protocol Spec                         |

## 2. Purpose

Define the canonical SSO login flow(s) per provider and protocol (OIDC/SAML): endpoints, redirects/callbacks, state/nonce handling, PKCE rules (if applicable), session creation, and failure cases. This template must align with secure deep link handling and route guard rules and must not invent providers or callback routes not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- SSO-01 Provider Inventory: `{{sso.providers}}`
- ROUTE-03 Deep Link Map (callback routing): `{{route.deep_link_map}}` | OPTIONAL
- ROUTE-04 Guard Rules: `{{route.guard_rules}}` | OPTIONAL
- CSec-05 Secure Deep Link Handling: `{{csec.deep_link_security}}` | OPTIONAL
- CER-04 Session Expiry Handling: `{{cer.session_expiry}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| provider_id binding | Must exist |
| protocol | OIDC/SAML |
| entrypoint routes | Login start |
| callback routes | Redirect URI / ACS endpoint |
| state handling rule | CSRF protection |
| nonce handling rule | OIDC |
| PKCE rules | If OIDC public clients |
| token/assertion validation rules | Signature, issuer, audience |
| session creation rules | What claims stored |
| error cases and UX handling | Error taxonomy |
| logout flow behavior | SP-initiated/logout redirect |
| telemetry requirements | Success/fail, error classes |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Multi-tenant discovery rules | OPTIONAL |
| IdP-initiated SAML behavior | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL
- Callback routes MUST be allowlisted and validated; no open redirects.
- State MUST be required for all redirect-based flows.
- Token/assertion signatures MUST be validated; do not skip verification.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:SSO-01}}`, `{{xref:ROUTE-03}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SSO-03}}`, `{{xref:SSO-04}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Define entry/callback + state + basic validation; use UNKNOWN for multi-tenant discovery if not applicable.
- **intermediate**: Required. Define nonce/PKCE rules (as applicable) and error taxonomy + telemetry.
- **advanced**: Required. Add logout rigor, clock skew, and protocol-specific edge cases (IdP-initiated, tenant discovery).

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, redirect_uri/acs_url/allowed redirects, nonce/pkce fields, clock skew, session duration/refresh ref, failure metric/fields, logout behavior, multi-tenant/idp initiated, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `flows[].state_rule` is UNKNOWN → block Completeness Gate.
- If `flows[].validate.signature_rule` is UNKNOWN → block Completeness Gate.
- If `flows[].errors.user_ux_rule` is UNKNOWN → block Completeness Gate.
- If `flows[].telemetry.success_metric` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SSO
- [ ] required_fields_present == true
- [ ] provider_ids_exist_in_SSO_01 == true
- [ ] callback_routes_allowlisted == true
- [ ] state_and_signature_validation_defined == true
- [ ] error_and_telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

