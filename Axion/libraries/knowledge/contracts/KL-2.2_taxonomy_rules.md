---
  contract_id: KL-2.2a
  schema_version: 1.0.0
  applies_to: "knowledge/INDEX/TAXONOMY.json"
  enforcement_level: "hard"
  ---

  # KL-2.2a — TAXONOMY Rules

  ## Purpose
  TAXONOMY is the canonical vocabulary for:
  - pillars
  - domains/subdomains
  - industries
  - stack/framework families
  - tag vocabulary + aliases

  ## Slug rules
  - domain_slug, subdomain_slug, industry_slug, stack_slug:
    - lowercase snake_case
    - stable once created (do not rename; deprecate instead)
  - tag keys MUST be lowercase snake_case.

  ## Tag aliasing
  - tag_aliases maps non-canonical labels to canonical tags.
  - On ingest:
    - if tag is canonical -> keep
    - else if tag is an alias -> replace with canonical
    - else -> reject (or require TAXONOMY update) depending on strictness mode

  ## Conservative updates
  - Adding tags/domains is allowed.
  - Removing or renaming requires:
    - entry in DEPRECATIONS.json (for tags/domains)
    - changelog entry
    - a migration plan for existing KIDs/index entries

  ## Minimum domain tags (min_tags)
  - Each domain defines a minimum tag set used for quality:
    - if a KID is in that domain, it SHOULD include at least 1 tag from min_tags.
    - production selection may require this (optional gate).
  