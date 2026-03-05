---
  contract_id: KL-6.3
  schema_version: 1.0.0
  applies_to: "Deprecating KIDs / bundles / taxonomy elements"
  enforcement_level: "hard"
  ---

  # KL-6.3 — Deprecation Workflow

  ## Goal
  Retire outdated knowledge without breaking reproducibility.

  ## Workflow (KID)
  1) Mark KID as deprecated
  - Set frontmatter: deprecated_by: <replacement_kid>
  - Update updated_at

  2) Add DEPRECATIONS mapping
  - Add record in DEPRECATIONS.json:
    - kind: kid
    - id: <deprecated_kid>
    - replacement_id: <replacement_kid>
    - reason + effective_date
    - allow_for_repro (usually true)

  3) Update KNOWLEDGE_INDEX
  - Ensure deprecated KID remains listed (do not delete immediately)
  - Optional: add a field deprecated_by in the index entry (if you store it there)

  4) Add CHANGELOG entry
  - "Deprecated: <old> -> <new> (reason...)"

  5) Enforce selection behavior
  - Normal mode: deprecated excluded
  - Repro mode: deprecated allowed only if allow_for_repro=true

  ## Workflow (Bundle)
  Same pattern:
  - bundle.deprecated_by set
  - DEPRECATIONS.kind=bundle mapping created
  - CHANGELOG updated

  ## Workflow (Tag/Domain/Subdomain)
  1) Add deprecation mapping (DEPRECATIONS.kind=tag/domain/subdomain)
  2) Add TAXONOMY alias mapping (old -> new) for migration window
  3) Update CHANGELOG
  4) Update impacted KIDs incrementally
  5) After migration window: remove alias only when all KIDs are migrated (optional strict)
  