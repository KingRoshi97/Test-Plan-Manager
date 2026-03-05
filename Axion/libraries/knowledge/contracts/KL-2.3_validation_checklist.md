---
  contract_id: KL-2.3b
  schema_version: 1.0.0
  applies_to: "KL integrity validation for BUNDLES_INDEX"
  enforcement_level: "hard"
  ---

  # KL-2.3b — BUNDLES_INDEX Validation Checklist

  Passes if:

  ## Schema
  - [ ] JSON parses
  - [ ] Matches KL-2.3 schema

  ## Determinism
  - [ ] bundle_id is unique
  - [ ] kids list has no duplicates within a bundle

  ## Optional strict referential checks (recommended)
  - [ ] Every bundle.kids entry exists in KNOWLEDGE_INDEX
  - [ ] Bundle does not include KIDs with executor_access that conflicts with bundle.by_executor
  - [ ] Bundle min_maturity is not lower than the run's required maturity (enforced during selection)
  