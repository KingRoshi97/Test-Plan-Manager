---
  contract_id: KL-2.1a
  schema_version: 1.0.0
  applies_to: "knowledge/INDEX/KNOWLEDGE_INDEX.json"
  enforcement_level: "hard"
  ---

  # KL-2.1a — KNOWLEDGE_INDEX Rules

  ## Purpose
  KNOWLEDGE_INDEX is the authoritative lookup for:
  - what KIDs exist
  - where each KID lives (path)
  - use_policy + excerpt limits
  - maturity tier
  - executor access constraints

  ## Authority & conflict resolution
  - If KNOWLEDGE_INDEX conflicts with KID frontmatter:
    - This is a gate failure.
    - Default resolution is: update KNOWLEDGE_INDEX to match the KID frontmatter (frontmatter is source-of-truth for metadata).
    - Exception: if the KID file is missing/invalid, the index entry must be removed or corrected.

  ## Uniqueness constraints
  - kid MUST be unique across all items
  - path MUST be unique across all items

  ## Sorting (determinism)
  When emitting a selection list or any derived output:
  Sort items by:
  1) pillar
  2) primary domain (domains[0])
  3) type
  4) kid

  ## Update discipline
  - Adding a KID requires:
    - KID file exists
    - KID metadata passes KL-1.3
    - KID sections pass KL-1.2
    - Index entry added/updated
  - Removing a KID requires:
    - Deprecation mapping OR explicit delete recorded in CHANGELOG
  