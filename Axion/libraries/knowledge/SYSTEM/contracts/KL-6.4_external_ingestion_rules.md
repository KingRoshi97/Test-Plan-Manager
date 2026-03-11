---
  contract_id: KL-6.4
  schema_version: 1.0.0
  applies_to: "Creating KIDs from non-internal sources"
  enforcement_level: "hard"
  ---

  # KL-6.4 — External Content Ingestion Rules

  ## Goal
  Allow learning from external sources without turning the library into a copy-donor.

  ## Hard rules
  1) No verbatim copyrighted text unless licensed for reuse
  - If not clearly licensed for reuse, store only summaries/paraphrase.
  - Any verbatim excerpt must be within:
    - source reuse_constraints (SOURCES_INDEX)
    - KID.allowed_excerpt
    - and must be recorded in reuse_log if used in outputs

  2) SOURCES_INDEX governs provenance
  If a KID is derived from external material:
  - it MUST reference a source_id from SOURCES_INDEX
  - source_id must define license + allowed_reuse_level

  3) Prefer summary-first
  Default external ingestion output should be:
  - concept/pattern/procedure/checklist written in your own words
  - minimal quotes/excerpts (ideally none)

  4) Mandatory attribution when required
  If SOURCES_INDEX.attribution_required == true:
  - Links section must include attribution (publisher/author/year or equivalent)

  ## Allowed storage modes (based on allowed_reuse_level)
  - summary_only: store only paraphrase + citations
  - short_excerpts_only: store small excerpts, still bounded
  - allowlisted_reuse: store allowlisted fragments only (explicit)
  - full_reuse_per_license: still cite; keep atomic

  ## Export safety
  External kit exports must obey:
  - executor_access rules
  - use_policy rules
  - excerpt limits
  Even if a source license permits reuse, your library policy may still restrict it.
  