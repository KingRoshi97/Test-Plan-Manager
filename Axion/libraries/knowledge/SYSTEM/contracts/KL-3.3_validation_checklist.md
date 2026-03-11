---
  contract_id: KL-3.3b
  schema_version: 1.0.0
  applies_to: "KL selection rules validation (engine behavior)"
  enforcement_level: "hard"
  ---

  # KL-3.3b — Selection Rules Validation Checklist

  Passes if:

  ## Filter compliance
  - [ ] External executor never receives internal_only items
  - [ ] maturity threshold enforced
  - [ ] deprecated items excluded in normal mode
  - [ ] deprecated items only allowed in repro mode when allow_for_repro=true
  - [ ] applicability filter applied (domain/tag/bundle)

  ## Rank compliance
  - [ ] scoring function applied consistently
  - [ ] tie-breakers deterministic

  ## Cap compliance
  - [ ] selected.length <= selection_cap
  - [ ] bundle ordering preserved when bundles are used
  