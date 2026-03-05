---
  contract_id: KL-3.3a
  schema_version: 1.0.0
  applies_to: "Determining applicability match for why_selected.applicability"
  enforcement_level: "soft"
  ---

  # KL-3.3a — Applicability Extraction

  ## Purpose
  Provide a short human-readable reason that ties selection to the KID's "When to use" section, without letting agents roam or reinterpret the library.

  ## Rule
  The selector MAY extract a brief applicability note by:
  - referencing matched domain/tags
  - referencing "When to use" bullets ONLY as short paraphrase (no verbatim)

  ## Format
  why_selected.applicability should be:
  - 1 sentence max
  - no quotes
  - no raw copying
  