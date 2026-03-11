---
  contract_id: KL-2.4a
  schema_version: 1.0.0
  applies_to: "knowledge/INDEX/SOURCES_INDEX.json + any KID that references external sources"
  enforcement_level: "hard"
  ---

  # KL-2.4a — Sources Rules (Provenance & Licensing)

  ## Purpose
  SOURCES_INDEX governs provenance/licensing so the Knowledge Library does not become a copy-donor.

  ## When SOURCES_INDEX is required
  If ANY KID includes:
  - text excerpts from external material
  - code excerpts from external material
  - direct reuse beyond paraphrase/summarization
  then the KID MUST reference a source_id that exists in SOURCES_INDEX.

  ## allowed_reuse_level meanings
  - summary_only:
    - no verbatim excerpts stored in KIDs
    - only paraphrase + citations
  - short_excerpts_only:
    - excerpts allowed only within KID allowed_excerpt limits AND source constraints
  - allowlisted_reuse:
    - reuse allowed only for explicitly allowlisted sections/assets
  - full_reuse_per_license:
    - reuse permitted as allowed by license (still must cite)

  ## Consistency rules
  - If a KID has allowed_excerpt > 0 or use_policy != pattern_only AND it is derived from external content:
    - it MUST include a source_id reference (in Links or in metadata extension field).
  - If attribution_required is true:
    - KID Links must include attribution text (author/publisher/year) or a standardized attribution block.

  ## External executor safety
  - KIDs referencing sources with restricted reuse MUST NOT be exported in full to external kits unless allowed_reuse_level permits and excerpt limits are enforced (KL-5).
  