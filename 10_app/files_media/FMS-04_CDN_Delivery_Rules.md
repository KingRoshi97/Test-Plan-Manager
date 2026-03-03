# FMS-04 — CDN & Delivery Rules (cache headers, variants)

## Header Block

| Field | Value |
|---|---|
| template_id | FMS-04 |
| title | CDN & Delivery Rules (cache headers, variants) |
| type | files_media_cdn_delivery_rules |
| template_version | 1.0.0 |
| output_path | 10_app/files_media/FMS-04_CDN_Delivery_Rules.md |
| compliance_gate_id | TMP-05.PRIMARY.FMS |
| upstream_dependencies | ["FMS-01", "FPMP-05", "FMS-05"] |
| inputs_required | ["SPEC_INDEX", "DOMAIN_MAP", "GLOSSARY", "STANDARDS_INDEX", "FMS-01", "FPMP-05", "FMS-02", "FMS-05", "FMS-06"] |
| required_by_skill_level | {"beginner": true, "intermediate": true, "advanced": true} |

## Purpose

Define the canonical CDN and delivery policy for files/media: cache headers, access models,
variants (sizes/bitrates), purge/invalidation rules, and how signed access is enforced at the
edge. This template must be consistent with storage access modes and security/retention
constraints.

## Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- FMS-01 Storage Inventory: {{fms.storage_inventory}}
- FPMP-05 CDN/Delivery Rules: {{fpmp.cdn_rules}} | OPTIONAL
- FMS-02 Upload/Download Spec: {{fms.upload_download}} | OPTIONAL
- FMS-05 Retention/Lifecycle: {{fms.retention}} | OPTIONAL
- FMS-06 Security/Compliance: {{fms.security}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## Required Fields

- CDN enabled (true/false/UNKNOWN)
- CDN provider/edge binding (provider_id)
- Delivery domains/URLs policy
- Cache policy (public/private, max-age)
- Signed delivery supported (yes/no/UNKNOWN)
- Signed URL/token TTL rule
- Variant strategy (image sizes, video bitrates)
- Cache key strategy (include params?)
- Purge/invalidation rules (when, how)
- Access control enforcement at edge (auth headers/signed tokens)
- Telemetry requirements (edge hit rate, errors)

## Optional Fields

- Regional edge strategy | OPTIONAL
- Origin shielding rules | OPTIONAL
- Open questions | OPTIONAL

## Rules

- Must align to: {{standards.rules[STD-SECURITY]}} | OPTIONAL
- Private media must not be cacheable publicly.
- If signed delivery is used, TTL must be bounded and tied to object/variant.
- Purge rules must not leak private URLs or identifiers.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## Output Format

1. Enablement
cdn_enabled: {{cdn.enabled}}
provider_id: {{cdn.provider_id}} | OPTIONAL
2. Delivery Domains
domains: {{delivery.domains}}
url_pattern_rule: {{delivery.url_pattern_rule}} | OPTIONAL
3. Cache Policy
public_cache_rule: {{cache.public_cache_rule}}
private_cache_rule: {{cache.private_cache_rule}}
default_max_age_seconds: {{cache.default_max_age_seconds}} | OPTIONAL
4. Signed Delivery
signed_supported: {{signed.supported}}
ttl_seconds: {{signed.ttl_seconds}} | OPTIONAL
token_location: {{signed.token_location}} (query/header/cookie/UNKNOWN) |
OPTIONAL
5. Variants
variant_strategy: {{variants.strategy}}
variants_list: {{variants.list}} | OPTIONAL
6. Cache Keys
cache_key_rule: {{cachekey.rule}}
include_query_params: {{cachekey.include_query_params}} | OPTIONAL
7. Purge / Invalidation
purge_supported: {{purge.supported}}
purge_triggers: {{purge.triggers}}
purge_method: {{purge.method}} | OPTIONAL
8. Edge Access Control
edge_enforcement: {{edge.enforcement}}
auth_model: {{edge.auth_model}} (signed_only/header_pass_through/UNKNOWN) |
OPTIONAL

9. Telemetry
cdn_hit_rate_metric: {{telemetry.hit_rate_metric}}
cdn_error_metric: {{telemetry.error_metric}} | OPTIONAL
10.References
Storage inventory: {{xref:FMS-01}}
Upload/download spec: {{xref:FMS-02}} | OPTIONAL
Retention/lifecycle: {{xref:FMS-05}} | OPTIONAL
Security/compliance: {{xref:FMS-06}} | OPTIONAL

## Cross-References

Upstream: {{xref:FMS-01}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:FMS-10}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

## Skill Level Requiredness Rules

beginner: Required. Define cache policy and whether CDN enabled and signed supported.
intermediate: Required. Define variants, cache key rule, and purge triggers.
advanced: Required. Add edge auth model, origin shielding/regional strategy, and telemetry
rigor.

## Unknown Handling

UNKNOWN_ALLOWED: domain.map, glossary.terms, provider id, url pattern, max age, ttl,
token location, variants list, query params, purge method, auth model, error metric,
regional/shielding, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If cdn.enabled is UNKNOWN → block Completeness Gate.
If cache.public_cache_rule is UNKNOWN → block Completeness Gate.
If cache.private_cache_rule is UNKNOWN → block Completeness Gate.
If cachekey.rule is UNKNOWN → block Completeness Gate.
If telemetry.hit_rate_metric is UNKNOWN → block Completeness Gate.

## Completeness Gate

Gate ID: TMP-05.PRIMARY.FMS
Pass conditions:
required_fields_present == true
cache_policy_defined == true
cdn_and_signed_delivery_defined == true
purge_and_cachekey_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true
