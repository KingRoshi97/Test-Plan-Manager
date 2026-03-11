# Knowledge Library Changelog

## Unreleased

## 2025-01-01 — v1.1.0 — Registry alignment with KL-2.x contracts

- Bundles: updated bundles.index.json to KL-2.3 schema (added title, description, selection_policy, kids, by_run_profile, by_risk_class, by_executor, domains, tags, created_at, updated_at, owner)
- Bundles: updated all 10 individual bundle files to KL-2.3 schema
- Taxonomy: added tag_vocabulary, tag_aliases, stack_families per KL-2.2
- Added: sources.index.json updated to KL-2.4 schema (added source_type, title, origin, reuse_constraints, created_at, updated_at, owner)
- Added: deprecations.json updated to KL-2.5 schema (added schema_version)
- Added: changelog.md updated to KL-2.5b contract format (added Unreleased section, date-stamped entries)
- Updated: all 395 KID items in knowledge.index.json enriched with domains, subdomains, tags, allowed_excerpt, license, created_at, updated_at, owner per KL-2.1

## 2025-01-01 — v1.0.0 — Knowledge Library scaffold created

- Added: Initial library structure established
- Added: INDEX registries created (knowledge.index.json, taxonomy.json, tags.json, bundles.index.json, sources.index.json, quality_tiers.json, deprecations.json)
- Added: POLICIES defined (use_policy, external_agent_policy, citation_policy, plagiarism_ip_rules, secrets_pii_handling)
- Bundles: scaffolded 10 bundles across run_profile, risk_class, executor categories
- Added: REUSE infrastructure created (allowlist, reuse_log, license texts)
- Added: TEMPLATES created (knowledge_item, industry_playbook, stack_playbook)
- Added: OUTPUTS schemas defined (knowledge_selection, knowledge_bundle_export)