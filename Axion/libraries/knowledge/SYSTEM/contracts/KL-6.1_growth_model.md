---
  contract_id: KL-6.1
  schema_version: 1.0.0
  applies_to: "Knowledge Library content operations"
  enforcement_level: "hard"
  ---

  # KL-6.1 — Growth Model

  ## Rule: Add items atomically
  - New knowledge is added as **small KIDs** (no monolith docs).
  - Each KID should cover a single concept/pattern/procedure/checklist/etc.
  - If a topic needs more than ~1,200 words, split into multiple KIDs.

  ## Rule: Update taxonomy conservatively
  - TAXONOMY changes are rare and governed:
    - Additions are allowed.
    - Renames/removals require DEPRECATIONS + CHANGELOG entry.
  - Prefer tag_aliases to absorb naming drift.

  ## Rule: Use bundles for curated slices
  - Instead of "select everything," use BUNDLES_INDEX to create standard sets:
    - by run profile
    - by risk class
    - by executor type
    - by stack family

  ## Rule: Keep selection deterministic
  - Selection depends only on:
    - selection inputs (KL-3.1)
    - registries (KL-2.x)
    - deterministic ranking rules (KL-3.3)

  ## Rule: Prevent rot
  - Any KID touched should update updated_at and add a CHANGELOG note if behavior changes.
  - Deprecate instead of overwriting when meaning changes materially.
  