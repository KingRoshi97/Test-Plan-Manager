---
  contract_id: KL-4.2a
  schema_version: 1.0.0
  applies_to: "Any agent output derived from KIDs"
  enforcement_level: "soft"
  ---

  # KL-4.2a — Paraphrase Safe-Mode

  When drawing from KIDs (pattern_only default), agents SHOULD:
  - compress: produce a shorter version than the KID section
  - transform: change structure (bullets → sentences or vice versa)
  - reframe: use different ordering of ideas
  - localize: tie to the current spec/run context

  Agents SHOULD NOT:
  - reuse distinctive phrasing
  - keep identical bullet ordering across 5+ bullets
  - copy code blocks or paragraph chunks
  