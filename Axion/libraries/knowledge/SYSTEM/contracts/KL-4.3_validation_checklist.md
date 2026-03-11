---
  contract_id: KL-4.3b
  schema_version: 1.0.0
  applies_to: "KL restricted behaviors validation"
  enforcement_level: "hard"
  ---

  # KL-4.3b — Restricted Behaviors Validation Checklist

  Passes if:

  - [ ] No output contains verbatim excerpts beyond allowed_excerpt limits
  - [ ] No internal_only KID is used when executor_type == external
  - [ ] No restricted KID content is present in external kit exports
  - [ ] No KID outside KNOWLEDGE_SELECTION is cited or used
  - [ ] No example KID content is copied unless allowlisted
  - [ ] Similarity checks (if enabled) do not trigger KL-R06
  