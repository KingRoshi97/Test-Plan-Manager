# SSO-01 — SSO Provider Inventory

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SSO-01                                           |
| Template Type     | Integration / SSO                                |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring sso provider inventory    |
| Filled By         | Internal Agent                                   |
| Consumes          | IXS-01, API-04                                   |
| Produces          | Filled SSO Provider Inventory                    |

## 2. Purpose

Create the single, canonical inventory of all third-party auth/SSO providers, indexed by provider_id, including protocol type, environments enabled, and which flows/features depend on each provider. This document must not invent provider_ids not present in upstream inputs.

## 3. Inputs Required

- SPEC_INDEX: `{{spec.index}}`
- DOMAIN_MAP: `{{domain.map}}` | OPTIONAL
- GLOSSARY: `{{glossary.terms}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL
- IXS-01 Integration Inventory: `{{ixs.inventory}}` | OPTIONAL
- API-04 AuthZ Rules (roles/claims): `{{api.authz_rules}}` | OPTIONAL
- Existing docs/notes: `{{inputs.notes}}` | OPTIONAL

## 4. Required Fields

| Field | Description |
|---|---|
| Provider registry | provider_id list |
| provider_id | Stable identifier |
| provider name/vendor | Name/vendor |
| protocol | OIDC/SAML/LDAP/UNKNOWN |
| tenant model | single-tenant/multi-tenant/UNKNOWN |
| login entrypoints supported | web/mobile |
| environments enabled | dev/stage/prod |
| scopes/claims expected | Summary |
| user provisioning mode | JIT/SCIM/manual/UNKNOWN |
| criticality | low/med/high |
| owner | team/role |
| security notes pointer | SSO-09 |

## 5. Optional Fields

| Field | Notes |
|---|---|
| Branding/custom UI notes | OPTIONAL |
| SLA/uptime notes | OPTIONAL |
| Open questions | OPTIONAL |

## 6. Rules

- Must align to: `{{standards.rules[STD-CANONICAL-TRUTH]}}` | OPTIONAL
- Do not introduce new provider_ids; use only `{{spec.sso_providers_by_id}}` if present, else mark UNKNOWN and flag.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: `{{glossary.terms}}` | OPTIONAL

## 7. Cross-References

- **Upstream**: `{{xref:IXS-01}}` | OPTIONAL, `{{xref:API-04}}` | OPTIONAL, `{{xref:SPEC_INDEX}}` | OPTIONAL
- **Downstream**: `{{xref:SSO-02}}`, `{{xref:SSO-03}}` | OPTIONAL
- **Standards**: `{{standards.rules[STD-NAMING]}}` | OPTIONAL, `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL

## 8. Skill Level Requiredness Rules

- **beginner**: Required. Populate provider registry and core fields; do not invent provider_ids.
- **intermediate**: Required. Add entrypoints, provisioning modes, and claims summary.
- **advanced**: Required. Add tenant model clarity, criticality/ownership, and security/audit references.

## 9. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, inv notes, tenant model, entrypoints, claims summary, provisioning mode, security ref, branding/sla notes, open_questions
- If any Required Field is UNKNOWN, allow only if: `{{standards.rules[STD-UNKNOWN-HANDLING]}}` | OPTIONAL
- If `providers[].provider_id` is UNKNOWN → block Completeness Gate.
- If `providers[].protocol` is UNKNOWN → block Completeness Gate.
- If `providers[*].env_enabled` is UNKNOWN → block Completeness Gate.

## 10. Completeness Gate

- **Gate ID**: TMP-05.PRIMARY.SSO
- [ ] required_fields_present == true
- [ ] provider_ids_unique == true
- [ ] no new provider_ids introduced
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true

## 11. Output Format

