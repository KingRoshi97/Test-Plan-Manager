---
  contract_id: KL-3.2b
  schema_version: 1.0.0
  applies_to: "KL selection output validation"
  enforcement_level: "hard"
  ---

  # KL-3.2b — KNOWLEDGE_SELECTION Validation Checklist

  Passes if:

  ## Schema
  - [ ] JSON parses
  - [ ] Matches KL-3.2 schema

  ## Referential integrity (strict mode)
  - [ ] Every selected.kid exists in KNOWLEDGE_INDEX
  - [ ] selected.title/type/path match the registry for that kid

  ## Restrictions snapshot
  - [ ] Each selected item contains restrictions: use_policy, executor_access, allowed_excerpt, maturity

  ## Cap
  - [ ] selected.length <= cap

  ## Deprecations
  - [ ] If any selected item is deprecated:
    - [ ] mode == reproducibility
    - [ ] deprecation_notice present
  