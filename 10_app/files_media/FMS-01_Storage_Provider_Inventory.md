# FMS-01 — Storage Provider Inventory (by provider_id/bucket_id)

## Header Block

| Field | Value |
|---|---|
| template_id | FMS-01 |
| title | Storage Provider Inventory (by provider_id/bucket_id) |
| type | files_media_storage_provider_inventory |
| template_version | 1.0.0 |
| output_path | 10_app/files_media/FMS-01_Storage_Provider_Inventory.md |
| compliance_gate_id | TMP-05.PRIMARY.FMS |
| upstream_dependencies | ["IXS-01", "FPMP-02"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "IXS-01", "FPMP-02", "FPMP-01", "IXS-04"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Create the single, canonical inventory of file/media storage providers and storage targets
(buckets/containers), indexed by provider_id and bucket_id, including environment scoping,
access modes, and security/compliance flags. This document must not invent provider/bucket
IDs beyond upstream inputs.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- IXS-01 Integration Inventory: {{ixs.inventory}} | OPTIONAL
- FPMP-02 Storage Strategy: {{fpmp.storage_strategy}} | OPTIONAL
- FPMP-01 Upload Contract: {{fpmp.upload_contract}} | OPTIONAL
- IXS-04 Secrets/Credential Handling: {{ixs.secrets_policy}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- Provider registry (provider_id list)
- Bucket/target registry (bucket_id list)
- provider_id (stable identifier)
- bucket_id (stable identifier)
- provider/vendor name
- integration_id binding (IXS-01)
- env scope (dev/stage/prod)
- region/location (if applicable)
- access mode (public/private/signed/UNKNOWN)
- path prefix rules (naming convention)
- encryption flags (at rest)
- retention/lifecycle policy ref (FMS-05)
- observability/cost tracking flags (FMS-10)
- credential reference (IXS-04)

## Optional Fields

- CDN binding (FMS-04) | OPTIONAL
- Replication/DR notes | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Buckets/targets must be environment-scoped and least-privilege.
- Do not list secret values; reference credential policies only.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Inventory Summary
total_providers: {{inv.total_providers}}
total_buckets: {{inv.total_buckets}}
notes: {{inv.notes}} | OPTIONAL
2. Provider Entries
Provider
provider_id: {{providers[0].provider_id}}
name: {{providers[0].name}}
integration_id: {{providers[0].integration_id}}
env_enabled: {{providers[0].env_enabled}}
credential_ref: {{providers[0].credential_ref}} (expected: {{xref:IXS-04}}) | OPTIONAL
notes: {{providers[0].notes}} | OPTIONAL
(Repeat per provider.)
3. Bucket/Target Entries
Bucket
bucket_id: {{buckets[0].bucket_id}}
provider_id: {{buckets[0].provider_id}}
env_scope: {{buckets[0].env_scope}}
region: {{buckets[0].region}} | OPTIONAL
access_mode: {{buckets[0].access_mode}}
path_prefix_rule: {{buckets[0].path_prefix_rule}}
encryption_at_rest: {{buckets[0].encryption_at_rest}}
retention_ref: {{buckets[0].retention_ref}} (expected: {{xref:FMS-05}}) | OPTIONAL
cdn_ref: {{buckets[0].cdn_ref}} | OPTIONAL
dr_notes: {{buckets[0].dr_notes}} | OPTIONAL
open_questions:
{{buckets[0].open_questions[0]}} | OPTIONAL

(Repeat per bucket.)
4. References
Upload contract: {{xref:FPMP-01}} | OPTIONAL
Storage strategy: {{xref:FPMP-02}} | OPTIONAL
CDN rules: {{xref:FMS-04}} | OPTIONAL
Retention/lifecycle: {{xref:FMS-05}} | OPTIONAL
Security/compliance: {{xref:FMS-06}} | OPTIONAL
Observability/cost: {{xref:FMS-10}} | OPTIONAL

## Cross-References

Upstream: {{xref:IXS-01}} | OPTIONAL, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-02}}, {{xref:FMS-05}}, {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. List providers/buckets and access modes and env scopes; do not invent
IDs.
intermediate: Required. Add path prefix rules, encryption flags, and retention refs.
advanced: Required. Add CDN/DR bindings and cost tracking flags and rigorous traceability.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, inv notes, provider notes, region,
retention/cdn refs, dr notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If providers[].provider_id is UNKNOWN → block Completeness Gate.
If buckets[].bucket_id is UNKNOWN → block Completeness Gate.
If buckets[].access_mode is UNKNOWN → block Completeness Gate.
If buckets[].path_prefix_rule is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
provider_ids_unique == true
bucket_ids_unique == true
env_scoping_defined == true
access_modes_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
