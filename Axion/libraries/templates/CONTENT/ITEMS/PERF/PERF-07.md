# PERF-07 — Cache Strategy (tiers, invalidation)

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | PERF-07                                             |
| Template Type     | Operations / Performance                                          |
| Template Version  | 1.0.0                                              |
| Applies           | All projects requiring cache strategy (tiers, invalidation)    |
| Filled By         | Internal Agent                                     |
| Consumes          | Canonical Spec, Intake Submission, Standards Snapshot |
| Produces          | Filled Cache Strategy (tiers, invalidation) Document                         |

## 2. Purpose

Define the canonical caching strategy for the system: cache tiers, what is cacheable, TTL rules,
invalidation strategy, and privacy constraints. This template ensures caching improves
performance without breaking correctness or privacy.

## 3. Inputs Required

- SPEC_INDEX: {{spec.index}}
- DOMAIN_MAP: {{domain.map}} | OPTIONAL
- GLOSSARY: {{glossary.terms}} | OPTIONAL
- STANDARDS_INDEX: {{standards.index}} | OPTIONAL
- DB performance policy: {{xref:PERF-06}} | OPTIONAL
- Endpoint catalog: {{xref:API-01}} | OPTIONAL
- Data minimization rules: {{xref:PRIV-03}} | OPTIONAL
- Rate limit policy: {{xref:RLIM-01}} | OPTIONAL
- Metrics catalog: {{xref:OBS-03}} | OPTIONAL
- Existing docs/notes: {{inputs.notes}} | OPTIONAL

## 4. Required Fields

| Field Name                | Source       | UNKNOWN Allowed |
|---------------------------|--------------|-----------------|
| Cache tiers (client, e... | spec         | Yes             |
| Cacheable data rules (... | spec         | Yes             |
| Non-cacheable rules (u... | spec         | Yes             |
| TTL rules (default TTLs)  | spec         | Yes             |
| Invalidation strategy ... | spec         | Yes             |
| Cache key rules (avoid... | spec         | Yes             |
| Staleness tolerance ru... | spec         | Yes             |
| Observability requirem... | spec         | Yes             |
| Telemetry requirements... | spec         | Yes             |

## 5. Optional Fields

Cache warming strategy | OPTIONAL
Open questions | OPTIONAL

Rules
Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
Do not cache or key by raw PII; hashed identifiers only when allowed.
Cache invalidation must be deterministic for data that must be consistent.
If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.
Output Format
1. Tiers
tiers: {{tiers.list}}
2. Cacheability
cacheable_rule: {{cache.rule}}
non_cacheable_rule: {{cache.non_rule}}
3. TTL
default_ttl_seconds: {{ttl.default_seconds}}
ttl_overrides: {{ttl.overrides}} | OPTIONAL
4. Invalidation
strategy: {{inv.strategy}}
events_ref: {{xref:EVT-01}} | OPTIONAL
5. Keys
key_rule: {{keys.rule}}
pii_key_rule: {{keys.pii_key_rule}} | OPTIONAL
6. Staleness
stale_rule: {{stale.rule}}
swr_rule: {{stale.swr_rule}} | OPTIONAL
7. Observability
hit_rate_metric_ref: {{obs.hit_rate_metric_ref}} | OPTIONAL
eviction_metric_ref: {{obs.eviction_metric_ref}} | OPTIONAL
8. Telemetry
cache_hit_rate_metric: {{telemetry.hit_rate_metric}}
stale_serve_metric: {{telemetry.stale_serve_metric}} | OPTIONAL
Cross-References
Upstream: {{xref:PERF-06}}, {{xref:SPEC_INDEX}} | OPTIONAL
Downstream: {{xref:PERF-05}}, {{xref:LOAD-03}} | OPTIONAL
Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
Skill Level Requiredness Rules
beginner: Required. Define tiers, cacheable/non-cacheable, TTL, invalidation strategy, key rule.
intermediate: Required. Define staleness rules and observability metrics and telemetry.
advanced: Required. Add warming strategy and strict event-driven invalidation + correctness
constraints.
Unknown Handling
UNKNOWN_ALLOWED: domain.map, glossary.terms, ttl overrides, events ref, pii key rule, swr

rule, obs metric refs, optional metrics, warming, open_questions
If any Required Field is UNKNOWN, allow only if:
{{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL
If tiers.list is UNKNOWN → block Completeness Gate.
If cache.rule is UNKNOWN → block Completeness Gate.
If ttl.default_seconds is UNKNOWN → block Completeness Gate.
If inv.strategy is UNKNOWN → block Completeness Gate.
If keys.rule is UNKNOWN → block Completeness Gate.
If telemetry.hit_rate_metric is UNKNOWN → block Completeness Gate.
Completeness Gate
Gate ID: TMP-05.PRIMARY.PERF
Pass conditions:
required_fields_present == true
cache_policy_defined == true
ttl_and_keys_defined == true
invalidation_defined == true
telemetry_defined == true
placeholder_resolution == true
no_unapproved_unknowns == true

PERF-08

PERF-08 — Queue/Async Performance (jobs, backpressure)
Header Block

## 6. Rules

- Must align to: {{standards.rules[STD-PII-REDACTION]}} | OPTIONAL
- Do not cache or key by raw PII; hashed identifiers only when allowed.
- **Cache invalidation must be deterministic for data that must be consistent.**
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Tiers`
2. `## Cacheability`
3. `## TTL`
4. `## Invalidation`
5. `## Keys`
6. `## Staleness`
7. `## Observability`
8. `## Telemetry`

## 8. Cross-References

- **Upstream: {{xref:PERF-06}}, {{xref:SPEC_INDEX}} | OPTIONAL**
- **Downstream: {{xref:PERF-05}}, {{xref:LOAD-03}} | OPTIONAL**
- **Standards: {{standards.rules[STD-UNKNOWN-HANDLING]}} | OPTIONAL**

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
