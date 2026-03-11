---
  contract_id: KL-2.5c
  schema_version: 1.0.0
  applies_to: "KL integrity validation for DEPRECATIONS + CHANGELOG coherence"
  enforcement_level: "hard"
  ---

  # KL-2.5c — Validation Checklist

  ## Deprecations
  - [ ] DEPRECATIONS.json parses and matches schema
  - [ ] No duplicate (kind,id) pairs
  - [ ] replacement_id exists (strict mode):
    - for kind=kid -> exists in KNOWLEDGE_INDEX
    - for kind=bundle -> exists in BUNDLES_INDEX
    - for kind=tag/domain/subdomain -> exists in TAXONOMY (or in alias migration set)

  ## Coherence with metadata
  - [ ] Any KID with deprecated_by has a matching DEPRECATIONS record
  - [ ] Any bundle with deprecated_by has a matching DEPRECATIONS record

  ## CHANGELOG presence
  - [ ] CHANGELOG.md exists
  