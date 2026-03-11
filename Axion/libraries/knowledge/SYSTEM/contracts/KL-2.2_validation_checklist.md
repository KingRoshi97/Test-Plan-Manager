---
  contract_id: KL-2.2b
  schema_version: 1.0.0
  applies_to: "KL integrity validation for TAXONOMY"
  enforcement_level: "hard"
  ---

  # KL-2.2b — TAXONOMY Validation Checklist

  Passes if:

  ## Schema
  - [ ] JSON parses
  - [ ] Matches KL-2.2 schema

  ## Slugs
  - [ ] All keys (domain/tag/industry/stack) are lowercase snake_case

  ## Domain integrity
  - [ ] Each domain has pillar, subdomains, min_tags
  - [ ] Each subdomain has a name

  ## Tag integrity
  - [ ] Every canonical tag in tag_vocabulary has name + category
  - [ ] Every alias in tag_aliases maps to an existing canonical tag

  ## Optional strict referential checks (recommended)
  - [ ] Every KID in KNOWLEDGE_INDEX uses only domains/tags present in TAXONOMY (after alias normalization)
  