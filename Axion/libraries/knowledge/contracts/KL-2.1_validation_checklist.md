---
  contract_id: KL-2.1b
  schema_version: 1.0.0
  applies_to: "KL integrity validation for KNOWLEDGE_INDEX"
  enforcement_level: "hard"
  ---

  # KL-2.1b — KNOWLEDGE_INDEX Validation Checklist

  Registry passes if:

  ## Schema
  - [ ] JSON parses
  - [ ] Matches KL-2.1 schema

  ## Uniqueness
  - [ ] No duplicate kid
  - [ ] No duplicate path

  ## Referential integrity (optional strict mode)
  - [ ] For every item.path, file exists
  - [ ] KID filename matches item.kid
  - [ ] KID frontmatter kid matches item.kid
  - [ ] KID frontmatter fields match index fields for: title/type/pillar/domains/tags/maturity/use_policy/executor_access/license/allowed_excerpt

  ## Deprecations coherence
  - [ ] If item.deprecated_by exists, DEPRECATIONS.json contains mapping item.kid -> item.deprecated_by
  