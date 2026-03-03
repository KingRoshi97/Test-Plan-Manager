# SSO-01 — Provider Inventory (by provider_id)

## Header Block

| Field | Value |
|---|---|
| template_id | SSO-01 |
| title | Provider Inventory (by provider_id) |
| type | sso_provider_inventory |
| template_version | 1.0.0 |
| output_path | 10_app/sso/SSO-01_Provider_Inventory.md |
| compliance_gate_id | TMP-05.PRIMARY.SSO |
| upstream_dependencies | ["IXS-01", "API-04"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "API-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Create the single, canonical inventory of all third-party auth/SSO providers, indexed by
provider_id, including protocol type, environments enabled, and which flows/features depend on
each provider. This document must not invent provider_ids not present in upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- API-04 AuthZ Rules (roles/claims): {{api.authz_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Provider registry (provider_id list)
- provider_id (stable identifier)
- provider name/vendor
- protocol (OIDC/SAML/LDAP/UNKNOWN)
- tenant model (single-tenant/multi-tenant/UNKNOWN)
- login entrypoints supported (web/mobile)
- environments enabled (dev/stage/prod)
- scopes/claims expected (summary)
- user provisioning mode (JIT/SCIM/manual/UNKNOWN)
- criticality (low/med/high)
- owner (team/role)
- security notes pointer (SSO-09)

## Optional Fields

- Branding/custom UI notes | OPTIONAL
- SLA/uptime notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- Do not introduce new provider_ids; use only {{spec.sso_providers_by_id}} if present, else mark
- UNKNOWN and flag.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Inventory Summary
total_providers: {{inv.total}}
protocols_present: {{inv.protocols_present}} | OPTIONAL
notes: {{inv.notes}} | OPTIONAL
2. Provider Entries (by provider_id)
Provider
provider_id: {{providers[0].provider_id}}
name: {{providers[0].name}}
protocol: {{providers[0].protocol}}
tenant_model: {{providers[0].tenant_model}}
entrypoints: {{providers[0].entrypoints}}
env_enabled: {{providers[0].env_enabled}}
claims_summary: {{providers[0].claims_summary}}
provisioning_mode: {{providers[0].provisioning_mode}}
criticality: {{providers[0].criticality}}
owner: {{providers[0].owner}}
security_ref: {{providers[0].security_ref}} (expected: {{xref:SSO-09}}) | OPTIONAL
branding_notes: {{providers[0].branding_notes}} | OPTIONAL
sla_notes: {{providers[0].sla_notes}} | OPTIONAL
open_questions:
{{providers[0].open_questions[0]}} | OPTIONAL
(Repeat per provider_id.)
3. References
SSO flow spec: {{xref:SSO-02}} | OPTIONAL
Claim mapping/provisioning: {{xref:SSO-03}} | OPTIONAL
Session/token exchange: {{xref:SSO-04}} | OPTIONAL
SCIM provisioning: {{xref:SSO-05}} | OPTIONAL
Security controls: {{xref:SSO-09}} | OPTIONAL
Audit/compliance: {{xref:SSO-10}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:API-04}} | OPTIONAL, {{xref:SPEC_INDEX}} |
OPTIONAL
Downstream: {{xref:SSO-02}}, {{xref:SSO-03}} | OPTIONAL
Standards: {{standards.rules[STD-NAMING]}} | OPTIONAL,
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Populate provider registry and core fields; do not invent provider_ids.
intermediate: Required. Add entrypoints, provisioning modes, and claims summary.
advanced: Required. Add tenant model clarity, criticality/ownership, and security/audit
references.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, tenant model, entrypoints,
claims summary, provisioning mode, security ref, branding/sla notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If providers[].provider_id is UNKNOWN → block Completeness Gate.
If providers[].protocol is UNKNOWN → block Completeness Gate.
If providers[*].env_enabled is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.SSO
Pass conditions:
required_fields_present == true
provider_ids_unique == true
no new provider_ids introduced
placeholder_resolution == true
no_unapproved_unknowns == true
