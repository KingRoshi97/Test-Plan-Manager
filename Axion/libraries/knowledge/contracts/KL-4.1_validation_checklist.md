---
  contract_id: KL-4.1a
  schema_version: 1.0.0
  applies_to: "KL usage enforcement validation"
  enforcement_level: "hard"
  ---

  # KL-4.1a — Default Usage Rule Validation Checklist

  Passes if:

  - [ ] For any KID used, the output/run log includes knowledge_citations containing that KID
  - [ ] If any verbatim excerpt appears:
    - [ ] KID.use_policy == reusable_with_allowlist
    - [ ] excerpt length within allowed_excerpt limits
    - [ ] reuse_log entry exists
  - [ ] No internal_only KID is present in any external executor context
  