# IXS-02 — Integration Spec (per integration: purpose, data flow, auth)

## Header Block

| Field | Value |
|---|---|
| template_id | IXS-02 |
| title | Integration Spec (per integration: purpose, data flow, auth) |
| type | integration_spec |
| template_version | 1.0.0 |
| output_path | 10_app/integrations/IXS-02_Integration_Spec.md |
| compliance_gate_id | TMP-05.PRIMARY.IXS |
| upstream_dependencies | ["IXS-01", "API-01", "DATA-06"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "API-01", "API-02", "DATA-06"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical per-integration specification: what the integration does, how data moves,
the exact interfaces (APIs/webhooks/files), authentication method, and operational behavior.
This template must not invent endpoints, entities, or integration IDs beyond what exists in
upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}}
- API-01 Endpoint Catalog: {{api.endpoint_catalog}} | OPTIONAL
- API-02 Endpoint Specs: {{api.endpoint_specs}} | OPTIONAL
- DATA-06 Canonical Data Schemas: {{data.schemas}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- integration_id (must exist in IXS-01)
- integration name/vendor
- purpose statement
- direction (inbound/outbound/bidirectional)
- interfaces used (REST/GraphQL/WS/Webhooks/SFTP/files/SDK)
- data objects exchanged (entity_id/schema_ref list)
- data flow diagram (text form is OK: source → transform → destination)
- auth method (oauth/api key/signed webhook/saml/oidc/etc.)
- credential location policy ref (IXS-04)
- rate limit/quotas summary (or ref)
- error handling policy ref (IXS-06)
- observability requirements ref (IXS-07)
- security/compliance notes ref (IXS-08)
- environments enabled (dev/stage/prod)

## Optional Fields

- SLAs/latency expectations | OPTIONAL
- Batch vs realtime notes | OPTIONAL
- Data retention constraints | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- integration_id MUST exist in {{xref:IXS-01}}.
- Do not introduce new endpoint_ids or schema_refs; reference existing IDs from
- {{xref:API-01}}/{{xref:DATA-06}}.
- Auth must be specific and implementable; do not leave “secure” as a description.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL

## Output Format

1. Integration Identity
integration_id: {{integration.id}}
name: {{integration.name}}
vendor: {{integration.vendor}}
category: {{integration.category}} | OPTIONAL
direction: {{integration.direction}}
env_enabled: {{integration.env_enabled}}
2. Purpose
purpose: {{purpose.statement}}
success_definition: {{purpose.success_definition}} | OPTIONAL
3. Interfaces
interfaces: {{interfaces.list}}
endpoints_used: {{interfaces.endpoint_ids}} | OPTIONAL
webhooks_used: {{interfaces.webhook_ids}} | OPTIONAL
file_transfers: {{interfaces.file_transfers}} | OPTIONAL
4. Data Objects & Mapping
entities_or_schemas: {{data.objects}}
mapping_ref: {{data.mapping_ref}} (expected: {{xref:IXS-05}}) | OPTIONAL
transform_rules: {{data.transform_rules}} | OPTIONAL
5. Data Flow
flow:
{{flow[0]}} (e.g., source → transform → destination)
{{flow[1]}} | OPTIONAL
6. Auth & Credentials
auth_method: {{auth.method}}

token_scope_or_claims: {{auth.scopes_or_claims}} | OPTIONAL
credential_policy_ref: {{auth.credential_policy_ref}} (expected: {{xref:IXS-04}}) |
OPTIONAL
7. Rate Limits / Quotas
limits_summary: {{limits.summary}}
quota_enforcement_ref: {{limits.enforcement_ref}} | OPTIONAL
8. Error Handling
error_policy_ref: {{errors.policy_ref}} (expected: {{xref:IXS-06}})
retry_behavior: {{errors.retry_behavior}} | OPTIONAL
9. Observability
observability_ref: {{obs.ref}} (expected: {{xref:IXS-07}})
key_metrics: {{obs.key_metrics}} | OPTIONAL
10.Security & Compliance
security_ref: {{security.ref}} (expected: {{xref:IXS-08}})
pii_involved: {{security.pii_involved}} | OPTIONAL
11.Notes / Open Questions
sla_notes: {{notes.sla_notes}} | OPTIONAL
batch_vs_realtime: {{notes.batch_vs_realtime}} | OPTIONAL
retention_notes: {{notes.retention_notes}} | OPTIONAL
open_questions:
{{open_questions[0]}} | OPTIONAL
12.References
Inventory: {{xref:IXS-01}}
Connectivity policy: {{xref:IXS-03}} | OPTIONAL
Secrets/credentials: {{xref:IXS-04}} | OPTIONAL
Data mapping: {{xref:IXS-05}} | OPTIONAL
Error handling: {{xref:IXS-06}} | OPTIONAL
Observability: {{xref:IXS-07}} | OPTIONAL
Security/compliance: {{xref:IXS-08}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}}, {{xref:API-01}} | OPTIONAL, {{xref:DATA-06}} | OPTIONAL,
{{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:IXS-09}}, {{xref:IXS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Fill identity/purpose/interfaces/flows with UNKNOWN where needed; do not
invent IDs.
intermediate: Required. Bind endpoints/schema refs and add auth + error/obs/security refs.
advanced: Required. Add explicit data object lists, rate-limit/SLAs, and traceability pointers.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, category, success definition,
endpoint/webhook ids, file transfers, mapping ref, transform rules, auth scopes/claims,

credential policy ref, quota enforcement ref, retry behavior, key metrics, pii involved, notes,
open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If integration.id is UNKNOWN → block Completeness Gate.
If errors.policy_ref is UNKNOWN → block Completeness Gate.
If obs.ref is UNKNOWN → block Completeness Gate.
If security.ref is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.IXS
Pass conditions:
required_fields_present == true
integration_id_exists_in_inventory == true
no new endpoint_ids or schema_refs introduced
auth_method_defined == true
refs_to_error_obs_security_present == true
placeholder_resolution == true
no_unapproved_unknowns == true
