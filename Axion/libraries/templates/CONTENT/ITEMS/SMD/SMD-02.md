# SMD-02 — Query/Cache Strategy (client cache rules, invalidation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | SMD-02                                             |
| Template Type     | Build / State Management                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring query/cache strategy (client cache rules, invalidation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Query/Cache Strategy (client cache rules, invalidation) Document                         |

## 2. Purpose

Define the canonical client query and caching strategy: cache ownership, key conventions,
stale/TTL rules, refetch triggers, invalidation model, pagination caching, and how errors map
into client state. This template must be consistent with data binding rules and API
pagination/error contracts and must not invent caching mechanisms not present in upstream
inputs.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- SMD-01 State Architecture: {{smd.state_arch}}
- FE-04 Data Binding Rules: {{fe.data_binding}}
- API-03 Error & Status Code Policy: {{api.error_policy}} | OPTIONAL
- PFS-02 Pagination Rules: {{pfs.pagination_rules}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

Cache philosophy (source of truth: server cache vs store)
Query key conventions (stable, deterministic)
Cache time rules (stale time, TTL)
Refetch triggers (focus, reconnect, interval, mutation success)
Pagination caching rules (cursor/offset)
Invalidation model (key-based/tag-based)
Error caching policy (cache error? when)
Data normalization rules (if any)
Security constraints (don’t cache secrets/PII)
Observability hooks (optional)

Optional Fields
Prefetch rules | OPTIONAL
Offline cache behavior binding (SMD-05) | OPTIONAL
Cache persistence rules | OPTIONAL
Open questions | OPTIONAL
Rules
Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
Cache keys MUST be deterministic and based on endpoint_id + params.
Pagination caching MUST align with {{xref:PFS-02}}.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Use consistent terminology from: {{glossary.terms}} | OPTIONAL
Do not cache sensitive fields unless explicitly allowed by security standards.
Output Format
1. Cache Philosophy
source_of_truth: {{cache.source_of_truth}} (server_cache/store/UNKNOWN)
ownership: {{cache.ownership}}
notes: {{cache.notes}} | OPTIONAL
2. Query Key Conventions
key_format: {{keys.format}}
include_params_rule: {{keys.include_params_rule}}
namespace_rules: {{keys.namespace_rules}} | OPTIONAL
examples:
{{keys.examples[0]}}
{{keys.examples[1]}} | OPTIONAL
3. Cache Time Rules
stale_time_ms: {{times.stale_time_ms}}
ttl_ms: {{times.ttl_ms}} | OPTIONAL
gc_time_ms: {{times.gc_time_ms}} | OPTIONAL
4. Refetch Triggers
on_focus: {{refetch.on_focus}}
on_reconnect: {{refetch.on_reconnect}} | OPTIONAL
on_interval: {{refetch.on_interval}} | OPTIONAL
on_mutation_success: {{refetch.on_mutation_success}}
5. Pagination Caching
mode: {{pagination.mode}} (cursor/offset/UNKNOWN)
page_key_rule: {{pagination.page_key_rule}}
merge_rule: {{pagination.merge_rule}} | OPTIONAL
reset_on_sort_filter_change: {{pagination.reset_on_sort_filter_change}} | OPTIONAL
6. Invalidation Model
model: {{invalidate.model}} (key-based/tag-based/UNKNOWN)
tags_schema: {{invalidate.tags_schema}} | OPTIONAL

invalidation_on_mutation: {{invalidate.on_mutation}}
scoped_invalidation: {{invalidate.scoped_invalidation}} | OPTIONAL
7. Error Caching Policy
cache_errors: {{errors.cache_errors}}
retry_policy_ref: {{errors.retry_policy_ref}} | OPTIONAL
error_normalization: {{errors.normalization}} | OPTIONAL
8. Data Normalization Rules
normalize_enabled: {{normalize.enabled}}
entity_key_rule: {{normalize.entity_key_rule}} | OPTIONAL
merge_policy: {{normalize.merge_policy}} | OPTIONAL
9. Security Constraints
pii_cache_policy: {{security.pii_cache_policy}}
secret_cache_policy: {{security.secret_cache_policy}}
logout_cache_clear_rule: {{security.logout_cache_clear_rule}}
10.Observability Hooks (Optional)
cache_hit_metric: {{obs.cache_hit_metric}} | OPTIONAL
cache_miss_metric: {{obs.cache_miss_metric}} | OPTIONAL
stale_served_metric: {{obs.stale_served_metric}} | OPTIONAL
11.References
State architecture: {{xref:SMD-01}}
Data binding: {{xref:FE-04}}
Pagination rules: {{xref:PFS-02}} | OPTIONAL
Mutation patterns: {{xref:SMD-03}} | OPTIONAL
Offline handling: {{xref:SMD-05}} | OPTIONAL
API error policy: {{xref:API-03}} | OPTIONAL
Cross-References
Upstream: {{xref:SMD-01}}, {{xref:FE-04}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:SMD-03}}, {{xref:SMD-05}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,
{{standards.rules[STD-SECURITY]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define key format and stale time; use UNKNOWN for optional
TTL/persistence.
intermediate: Required. Define invalidation model and pagination caching rules.
advanced: Required. Add normalization, security cache policies, and observability hooks.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, cache notes, namespace rules, example
keys, ttl/gc times, reconnect/interval refetch, merge/reset rules, tags schema, scoped
invalidation, retry policy ref, error normalization, normalization rules, observability hooks,
prefetch/offline/persistence notes, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL

If keys.format is UNKNOWN → block Completeness Gate.
If invalidate.model is UNKNOWN → block Completeness Gate.
If security.logout_cache_clear_rule is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.SMD
Pass conditions:
required_fields_present == true
query_key_conventions_defined == true
invalidation_model_defined == true
security_cache_rules_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

SMD-03

SMD-03 — Mutation Patterns (optimistic updates, rollback)
Header Block

## 5. Optional Fields

Prefetch rules | OPTIONAL
Offline cache behavior binding (SMD-05) | OPTIONAL
Cache persistence rules | OPTIONAL
Open questions | OPTIONAL

## 6. Rules

- Must align to: {{standards.rules[STD-CANONICAL-TRUTH]}} | OPTIONAL
- **Cache keys MUST be deterministic and based on endpoint_id + params.**
- **Pagination caching MUST align with {{xref:PFS-02}}.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
- Use consistent terminology from: {{glossary.terms}} | OPTIONAL
- Do not cache sensitive fields unless explicitly allowed by security standards.

## 7. Output Format

### Required Headings (in order)

1. `## Cache Philosophy`
2. `## Query Key Conventions`
3. `## examples:`
4. `## Cache Time Rules`
5. `## Refetch Triggers`
6. `## Pagination Caching`
7. `## Invalidation Model`
8. `## Error Caching Policy`
9. `## Data Normalization Rules`
10. `## Security Constraints`

## 8. Cross-References

- **Upstream: {{xref:SMD-01}}, {{xref:FE-04}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:SMD-03}}, {{xref:SMD-05}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL,**
- {{standards.rules[STD-SECURITY]}} | OPTIONAL

## 9. Skill Level Requiredness Rules

| Section                    | Beginner  | Intermediate | Expert   |
|----------------------------|-----------|--------------|----------|
| Overview                   | Required  | Required     | Required |
| Core Specification         | Required  | Required     | Required |
| Detailed Fields            | Optional  | Required     | Required |
| Advanced Configuration     | Optional  | Optional     | Required |

## 10. Unknown Handling

- If a required field cannot be resolved from inputs, write `UNKNOWN` and add to Open Questions.
- UNKNOWN fields do not block gate passage unless explicitly marked `UNKNOWN Allowed: No`.
- All UNKNOWN entries must include a reason and suggested resolution path.

## 11. Completeness Gate

- All Required Fields must be populated or explicitly marked UNKNOWN with justification.
- Output must follow the heading structure defined in Section 7.
- No invented data — all content must trace to canonical spec or intake submission.
- Cross-references must resolve to valid template IDs.
