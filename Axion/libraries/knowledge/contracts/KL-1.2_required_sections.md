---
  contract_id: KL-1.2
  schema_version: 1.0.0
  applies_to: "All KID markdown entries"
  enforcement_level: "hard"
  ---

  # KL-1.2 — Required Sections (Content Contract)

  Every KID file MUST contain the following H2 sections, in this exact order:

  1. ## Summary
  2. ## When to use
  3. ## Do / Don't
  4. ## Core content
  5. ## Links
  6. ## Proof / confidence

  ## Rules
  - Section headings MUST match exactly (case + punctuation).
  - "Links" MAY be empty, but the heading MUST exist.
  - No extra required sections are allowed between these headings.
  - Additional optional headings are allowed ONLY under "Core content" as H3/H4.
  - A KID that fails section order or missing headings is invalid.
  