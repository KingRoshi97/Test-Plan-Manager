---
  contract_id: KL-2.4b
  schema_version: 1.0.0
  applies_to: "KL integrity validation for SOURCES_INDEX"
  enforcement_level: "hard"
  ---

  # KL-2.4b — SOURCES_INDEX Validation Checklist

  Passes if:

  ## Schema
  - [ ] JSON parses
  - [ ] Matches KL-2.4 schema

  ## Uniqueness
  - [ ] source_id is unique

  ## Optional strict referential checks (recommended)
  - [ ] Any KID marked as derived/excerpting external content references a valid source_id
  - [ ] If attribution_required==true, KID includes attribution in Links section
  