---
  contract_id: KL-5.2
  schema_version: 1.0.0
  applies_to: "Knowledge selection + kit export"
  enforcement_level: "hard"
  ---

  # KL-5.2 — Access Gates

  ## KL-GATE-04 — External executor cannot access restricted KIDs
  **Rule:** If executor_type == external, then:
  - NO selected KID may have executor_access == internal_only.

  **Fail reason code:** KL-GATE-04

  ---

  ## KL-GATE-05 — External kit export excludes restricted content
  **Rule:** If kit_export.target_executor == external:
  - the kit MUST NOT contain:
    - full text of any internal_only KID
    - any verbatim excerpts from internal_only KIDs
    - any KID content with use_policy == restricted_internal_only
  - Even for reusable_with_allowlist, only include excerpts within allowed_excerpt limits.

  **Fail reason code:** KL-GATE-05
  