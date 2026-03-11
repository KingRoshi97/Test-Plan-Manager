---
  contract_id: KL-2.5b
  schema_version: 1.0.0
  applies_to: "knowledge/INDEX/CHANGELOG.md"
  enforcement_level: "soft"
  ---

  # KL-2.5b — Knowledge Library CHANGELOG Contract

  ## Purpose
  Track library-level changes for reproducibility and governance.

  ## Required sections
  - Unreleased
  - Date-stamped entries in reverse chronological order

  ## What must be logged
  - Added/removed/deprecated KIDs
  - Taxonomy changes (new tags/domains/aliases)
  - Bundle changes (new bundles or deprecations)
  - Source ingestion changes (new sources and reuse constraints)

  ## Recommended entry format
  - Added: KID-...
  - Updated: KID-...
  - Deprecated: KID-... -> KID-...
  - Taxonomy: added tag <x>, alias <y -> x>
  - Bundles: added/updated bundle <id>
  