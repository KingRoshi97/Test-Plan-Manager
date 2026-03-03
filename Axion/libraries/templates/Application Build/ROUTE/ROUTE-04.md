# ROUTE-04 — Guard Rules

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | ROUTE-04                                         |
| Template Type     | Build / Routing                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring guard rules               |
| Filled By         | Internal Agent                                   |
| Consumes          | ROUTE-01, API-04, CSec-01                        |
| Produces          | Filled Guard Rules                               |

## 2. Purpose

Define the canonical client-side route guard rules: authentication gating, role/permission gating, feature flag gating, and safe redirect behavior. This template must be consistent with backend AuthZ policies and must not invent roles/permissions not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- ROUTE-01 Route Contract: `{{route.contract}}`
- API-04 AuthZ Rules: `{{api.authz_rules}}` | OPTIONAL
- CSec-01 Token Storage Policy: `{{csec.token_policy}}` | OPTIONAL
- CER-04 Session Expiry Handling: `{{cer.session_expiry}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field Name | Notes |
|---|---|
| Auth gating rules | Logged-out redirects |
| Role/permission gating rules | Deny behavior |
| Feature flag gating rules | If used |
| Guard evaluation order | Deterministic |
| Redirect rules | Where to send user |
| Return-to behavior | After login |
| Forbidden handling | 403 vs hide route |
| Session expiry handling binding | CER-04 |
| Telemetry requirements | Guard denials |

## 5. Optional Fields

| Field Name | Notes |
|---|---|
| ABAC-style client hints (org context) | OPTIONAL |
| Per-route custom guards | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Client guards MUST NOT be the only security control; server remains authoritative.
- Do not invent roles/permissions; bind to `{{xref:API-04}}`.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:ROUTE-01}}`, `{{xref:API-04}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:ROUTE-06}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-SECURITY]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

| Level | Rule |
|---|---|
| beginner | Required. Define auth gating + deny behavior; use UNKNOWN for flags/telemetry details. |
| intermediate | Required. Define evaluation order, return-to behavior, and forbidden handling. |
| advanced | Required. Add per-route overrides and telemetry log fields with privacy constraints. |

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, return_to_param, claims_source, flag gate rules, forbidden redirect, default route, expiry behavior, denial log fields, ABAC client hints, per-route custom guards, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If auth.redirect_to_login is UNKNOWN → block Completeness Gate.
- If roles.deny_behavior is UNKNOWN → block Completeness Gate.
- If telemetry.guard_denial_metric is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.ROUTE
- **Pass conditions**:
- [ ] required_fields_present == true
- [ ] auth_and_role_gating_defined == true
- [ ] evaluation_order_defined == true
- [ ] telemetry_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

