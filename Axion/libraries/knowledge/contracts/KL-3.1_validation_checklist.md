---
  contract_id: KL-3.1b
  schema_version: 1.0.0
  applies_to: "KL selection input validation"
  enforcement_level: "hard"
  ---

  # KL-3.1b — Selection Inputs Validation Checklist

  Passes if:

  ## Schema
  - [ ] JSON parses
  - [ ] Matches KL-3.1 schema

  ## Canonicalization (strict mode)
  - [ ] signals.domains exist in TAXONOMY.domains
  - [ ] signals.subdomains exist under the referenced domains (if provided)
  - [ ] signals.tags are canonical or alias-resolved to canonical tags

  ## Determinism
  - [ ] domains and tags are de-duplicated and sorted
  - [ ] selection_cap is set (defaults allowed)
  