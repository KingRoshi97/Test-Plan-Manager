---
  contract_id: KL-1.3a
  schema_version: 1.0.0
  applies_to: "KID metadata fields"
  enforcement_level: "hard"
  ---

  # KL-1.3a — Metadata Normalization Rules

  ## IDs
  - kid MUST be immutable once created.
  - kid MUST match filename (without .md).
  - kid MUST match the ID pattern: KID-<PILLAR>-<DOMAIN>-<TYPE>-<NNNN>

  ## Domains / subdomains
  - domains MUST use canonical domain slugs from TAXONOMY.json.
  - subdomains (if present) MUST use canonical subdomain slugs from TAXONOMY.json.
  - If multiple domains are provided, the first is treated as the primary domain.

  ## Tags
  - tags MUST use canonical tag vocabulary from TAXONOMY.json, including aliases resolution.
  - tags MUST be lowercase snake_case.
  - tags MUST be de-duplicated and sorted lexicographically.

  ## Maturity
  - maturity transitions allowed:
    - draft → reviewed → verified → golden
  - reverse transitions require DEPRECATIONS entry + changelog note.

  ## use_policy defaults
  - Default use_policy is pattern_only unless explicitly changed.
  - example types SHOULD default to restricted_internal_only.

  ## executor_access
  - internal_only MUST be enforced for external executors during selection (KL-3/KL-5).

  ## allowed_excerpt
  - max_words/max_lines default to 0/0.
  - If either value > 0 then use_policy MUST be reusable_with_allowlist.

  ## supersedes / deprecated_by
  - If deprecated_by is set:
    - this KID MUST appear in DEPRECATIONS.json mapping to replacement
    - selection must avoid it unless repro mode is enabled (KL-5)
  