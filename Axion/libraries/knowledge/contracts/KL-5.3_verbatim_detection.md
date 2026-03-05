---
  contract_id: KL-5.3b
  schema_version: 1.0.0
  applies_to: "Detecting reuse in outputs"
  enforcement_level: "hard"
  ---

  # KL-5.3b — Verbatim Detection

  ## Definition
  An output contains a verbatim excerpt if ANY of the following are true:
  - A contiguous sequence of >= 12 words matches a KID exactly, OR
  - >= 3 consecutive lines match a KID exactly, OR
  - A code block matches a KID code block with only whitespace changes.

  ## Aggregation
  - Excerpts are measured per KID.
  - If multiple excerpts exist for the same KID:
    - total_words = sum(excerpt words)
    - total_lines = sum(excerpt lines)
  - Totals must remain within allowed_excerpt.

  ## Allowed transformations that still count as verbatim
  - whitespace changes
  - formatting-only changes (markdown bullets vs numbered)
  - variable renaming without structural change (for code)

  ## Exclusions
  - KID IDs themselves (KID-...) do not count as excerpts.
  - Short common phrases under 12 words do not count.
  