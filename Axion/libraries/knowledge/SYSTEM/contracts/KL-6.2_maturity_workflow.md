---
  contract_id: KL-6.2
  schema_version: 1.0.0
  applies_to: "KID maturity transitions"
  enforcement_level: "hard"
  ---

  # KL-6.2 — Maturity Workflow

  ## States
  - draft
  - reviewed
  - verified
  - golden

  ## Allowed transitions
  - draft → reviewed → verified → golden

  Reverse transitions are not allowed unless handled as:
  - deprecate old KID
  - create new KID
  - map via DEPRECATIONS
  - log in CHANGELOG

  ---

  ## Definitions (what each maturity means)

  ### draft
  Meaning:
  - authored but not formally checked

  Minimum bar:
  - passes KL-1.2 (sections) + KL-1.3 (metadata)
  - indexed in KNOWLEDGE_INDEX

  ### reviewed
  Meaning:
  - checked for correctness + policy alignment

  Minimum bar:
  - passes draft requirements
  - reviewed by a human/operator checklist:
    - technically plausible
    - does not violate pattern-only default
    - correct use_policy / executor_access
  - "Proof/confidence" evidence updated to include reviewer note

  ### verified
  Meaning:
  - validated against real runs or tests

  Minimum bar:
  - passes reviewed requirements
  - evidence includes at least one of:
    - referenced run_id where it was applied successfully
    - test case IDs that prove the guidance
    - audit log reference showing correct use
  - any defaults/constraints match current standards snapshot

  ### golden
  Meaning:
  - stable canonical reference; changes controlled

  Minimum bar:
  - passes verified requirements
  - used across multiple runs without contradictions
  - changes require:
    - CHANGELOG entry
    - if meaning changes materially: create new KID + deprecate old
  