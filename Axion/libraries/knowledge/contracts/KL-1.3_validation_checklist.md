---
  contract_id: KL-1.3b
  schema_version: 1.0.0
  applies_to: "KL validation gate for KID metadata"
  enforcement_level: "hard"
  ---

  # KL-1.3b — Metadata Validation Checklist

  A KID passes KL-1.3 if ALL checks are true:

  ## Presence + types
  - [ ] All required fields exist (kid, title, type, pillar, domains, tags, maturity, use_policy, executor_access, license, allowed_excerpt, created_at, updated_at, owner)
  - [ ] allowed_excerpt contains max_words and max_lines (ints >= 0)

  ## ID integrity
  - [ ] kid matches the required pattern
  - [ ] filename == kid + ".md"

  ## Canonical vocab
  - [ ] pillar is valid enum
  - [ ] type is valid enum
  - [ ] domains/subdomains exist in TAXONOMY (if taxonomy enforcement enabled)
  - [ ] tags exist in TAXONOMY vocabulary (or alias-resolved)

  ## Policy coherence
  - [ ] if allowed_excerpt.max_words > 0 OR max_lines > 0 → use_policy == reusable_with_allowlist
  - [ ] if type == example → use_policy should be restricted_internal_only unless explicitly overridden

  ## Deprecation coherence
  - [ ] if deprecated_by is set → entry exists in DEPRECATIONS.json mapping this KID → deprecated_by
  