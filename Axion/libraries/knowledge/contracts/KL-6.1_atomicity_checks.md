---
  contract_id: KL-6.1a
  schema_version: 1.0.0
  applies_to: "KID authoring review"
  enforcement_level: "soft_to_hard_by_policy"
  ---

  # KL-6.1a — Atomicity Checks

  A KID SHOULD be split if any are true:
  - > 1,200 words (hard cap from KL-1.2)
  - covers 3+ distinct subtopics that could stand alone
  - has > 12 checklist items across multiple concerns
  - includes both "what/why" and a deep "how-to" that could be separate concept + procedure

  Split strategy:
  - concept + pattern + procedure + checklist as separate KIDs
  - keep cross-links in Links section
  