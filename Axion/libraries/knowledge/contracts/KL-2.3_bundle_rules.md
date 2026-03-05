---
  contract_id: KL-2.3a
  schema_version: 1.0.0
  applies_to: "knowledge/INDEX/BUNDLES_INDEX.json"
  enforcement_level: "hard"
  ---

  # KL-2.3a — Bundle Rules

  ## Purpose
  Bundles are curated sets of KIDs used to create deterministic "slices" of the library.

  ## What a bundle can do
  - Provide a starter set for a run profile (API/Web/Mobile/etc.)
  - Provide a starter set for a risk class (prototype vs production vs compliance)
  - Provide a starter set for an executor (internal vs external)
  - Provide a starter set for a target stack family (React/Node/Postgres/etc.)

  ## Determinism
  - bundle_id is immutable.
  - The order of "kids" is meaningful and MUST be preserved during selection.
  - Selection artifact MUST record:
    - bundle_ids used
    - the resolved ordered KID list after applying bundle selection_policy

  ## Policy safety
  - Bundles MUST NOT bypass KID-level rules:
    - executor_access filtering still applies
    - maturity thresholds still apply
    - deprecated avoidance still applies

  ## Deprecation
  - If bundle is replaced, use deprecated_by and record mapping in DEPRECATIONS.json (bundle-level section).
  