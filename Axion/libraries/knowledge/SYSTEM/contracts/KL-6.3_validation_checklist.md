---
  contract_id: KL-6.3b
  schema_version: 1.0.0
  applies_to: "Deprecation workflow compliance"
  enforcement_level: "hard"
  ---

  # KL-6.3b — Deprecation Workflow Validation Checklist

  - [ ] Deprecated KIDs have deprecated_by set
  - [ ] DEPRECATIONS.json contains mapping (kind + id -> replacement_id)
  - [ ] CHANGELOG includes the deprecation
  - [ ] Selection excludes deprecated in normal mode
  - [ ] Repro mode allows deprecated only when allow_for_repro==true
  - [ ] Taxonomy deprecations include alias migration window when needed
  