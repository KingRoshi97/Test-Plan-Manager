---
  contract_id: KL-4.4c
  schema_version: 1.0.0
  applies_to: "KL citation + reuse validation"
  enforcement_level: "hard"
  ---

  # KL-4.4c — Validation Checklist

  Passes if:

  ## knowledge_citations
  - [ ] knowledge_citations exists whenever any KID is used
  - [ ] every cited KID exists in KNOWLEDGE_INDEX (strict mode)
  - [ ] no KID outside KNOWLEDGE_SELECTION is cited (hard)

  ## reuse_log
  - [ ] reuse_log exists if verbatim excerpts exist in output
  - [ ] every reuse_log entry references a KID with use_policy == reusable_with_allowlist
  - [ ] excerpt_size within allowed_excerpt limits for that KID
  - [ ] target fields are present (artifact_id/path/section)
  