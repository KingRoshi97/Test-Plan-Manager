---
  contract_id: KL-2.5a
  schema_version: 1.0.0
  applies_to: "knowledge/INDEX/DEPRECATIONS.json"
  enforcement_level: "hard"
  ---

  # KL-2.5a — Deprecations Rules

  ## Purpose
  DEPRECATIONS provides the authoritative mapping from deprecated items to replacements.

  ## Selection behavior
  - Deprecated KIDs MUST NOT be selected in normal mode.
  - Deprecated KIDs MAY be selected only when:
    - run_mode == reproducibility (repro)
    - allow_for_repro == true on the deprecation record
  - When a deprecated item is used in repro:
    - the selection artifact MUST include a deprecation_notice for it.

  ## Consistency behavior
  - If a KID frontmatter includes deprecated_by:
    - DEPRECATIONS MUST include a record kind=kid with id=<kid> and replacement_id=<deprecated_by>.
  - If a bundle has deprecated_by:
    - DEPRECATIONS MUST include kind=bundle mapping.
  - If a tag/domain/subdomain is deprecated:
    - TAXONOMY must keep alias compatibility during a migration window.
  