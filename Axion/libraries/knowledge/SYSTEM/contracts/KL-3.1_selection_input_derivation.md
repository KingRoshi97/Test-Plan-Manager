---
  contract_id: KL-3.1a
  schema_version: 1.0.0
  applies_to: "Generation of selection inputs before knowledge selection"
  enforcement_level: "hard"
  ---

  # KL-3.1a — Selection Input Derivation Rules

  ## Source mapping
  Selection inputs MUST be derived from these upstream sources:
  1) canonical spec signals
  - domains/subdomains/features/tags extracted from canonical spec artifacts
  - used to drive domain + tag matching

  2) standards snapshot
  - standards_snapshot_id references the resolved standards snapshot for the run
  - used to:
    - add required domains/tags (if standards imply them)
    - tighten maturity thresholds for high-risk categories

  3) run profile
  - API / WEB / MOBILE / etc.
  - used to apply bundles and/or profile-specific weighting

  4) risk class
  - PROTOTYPE / PROD / COMPLIANCE
  - used to set min_maturity:
    - PROTOTYPE: draft+
    - PROD: reviewed+
    - COMPLIANCE: verified+
  (These are defaults; overridable by policy.)

  5) executor type
  - internal vs external
  - used to filter by executor_access during selection

  6) target stack (optional)
  - used to prefer language/framework KIDs and stack-family bundles

  ## Normalization before selection
  Before selection runs:
  - domains/subdomains MUST be canonical slugs (TAXONOMY)
  - tags MUST be canonical tags (alias-resolved via TAXONOMY.tag_aliases)
  - duplicate tags/domains removed; sort lexicographically for determinism
  