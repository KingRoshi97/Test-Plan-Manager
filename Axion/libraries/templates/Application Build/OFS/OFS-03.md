# OFS-03 — Sync Protocol Spec

## 1. Header Block

| Field             | Value                                              |
|-------------------|----------------------------------------------------|
| Template ID       | OFS-03                                           |
| Template Type     | Build / Offline                                  |
| Template Version  | 1.0.0                                            |
| Applies           | All projects requiring sync protocol spec        |
| Filled By         | Internal Agent                                   |
| Consumes          | Canonical Spec, Standards Snapshot               |
| Produces          | Filled Sync Protocol Spec                        |

## 2. Purpose

Define the canonical local storage contracts: what storage technologies are used, schema definitions, size/TTL limits, encryption at rest, and migration strategy. This template must be consistent with offline scope and data protection rules and must not invent storage schemas not present in upstream inputs.

## 3. Inputs Required

- OFS-01: `{{ofs.scope}}`
- OFS-02: `{{ofs.sync_model}}` | OPTIONAL
- CSec-02: `{{csec.data_protection}}` | OPTIONAL
- SMD-02: `{{smd.cache_strategy}}` | OPTIONAL
- STANDARDS_INDEX: `{{standards.index}}` | OPTIONAL

## 4. Required Fields

| Field Name | Source | UNKNOWN Allowed |
|---|---|---|
| Storage technology choices (SQLite, MMKV, AsyncStorage, etc.) | spec | No |
| Per-store schema (tables/keys, types) | spec | No |
| Size limits (per store, total) | spec | No |
| TTL / eviction rules | SMD-02 | No |
| Encryption at rest policy | CSec-02 | No |
| Migration/versioning strategy | spec | No |
| Sensitive data rules (what NOT to cache) | CSec-02 | No |
| Telemetry requirements | spec | No |

## 5. Optional Fields

| Field Name | Source | Notes |
|---|---|---|
| Indexing/query optimization notes | spec | Performance hints |
| Multi-user/profile storage isolation | spec | If multi-user |
| Open questions | agent | Enrichment only |

## 6. Rules

- Sensitive data MUST NOT be cached unless explicitly allowed per `{{xref:CSec-02}}`.
- Encryption at rest MUST be enforced for classified stores.
- If a required field is not provided by inputs, write UNKNOWN unless explicitly disallowed.

## 7. Output Format

### Required Headings (in order)

1. `## Storage Technologies` — technologies, per_store_purpose
2. `## Per-Store Schema` — Per store: store_id, technology, schema, size_limit, ttl_rule, encryption_required, sensitive_data_excluded, migration_version, notes
3. `## Size Limits` — total_budget_mb, per_store_limits
4. `## TTL / Eviction` — default_ttl, eviction_policy, per_store_overrides
5. `## Encryption at Rest` — encryption_policy, key_management_ref
6. `## Migration Strategy` — versioning_scheme, breaking_change_rule, rollback_support
7. `## Telemetry` — storage_size_metric, eviction_metric, migration_success_metric

## 8. Cross-References

- **Upstream**: OFS-01, OFS-02, SPEC_INDEX
- **Downstream**: OFS-04, OFS-05
- **Standards**: STD-SECURITY, STD-UNKNOWN-HANDLING

## 9. Skill Level Requiredness Rules

| Section | Beginner | Intermediate | Expert |
|---|---|---|---|
| Tech choices + basic schemas | Required | Required | Required |
| TTL/eviction + encryption + migration | Optional | Required | Required |
| Indexing + multi-user isolation | Optional | Optional | Required |

## 10. Unknown Handling

- **UNKNOWN_ALLOWED**: domain.map, glossary.terms, per-store schema details, ttl overrides, key management ref, rollback support, telemetry optional metrics, indexing notes, multi-user isolation, open_questions
- If technologies list is UNKNOWN → block Completeness Gate.
- If encryption.policy is UNKNOWN → block Completeness Gate.
- If migration.versioning_scheme is UNKNOWN → block Completeness Gate.

## 11. Completeness Gate

- [ ] required_fields_present == true
- [ ] storage_technologies_defined == true
- [ ] encryption_policy_defined == true
- [ ] migration_strategy_defined == true
- [ ] placeholder_resolution == true
- [ ] no_unapproved_unknowns == true
