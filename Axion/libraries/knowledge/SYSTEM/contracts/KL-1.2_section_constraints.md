---
  contract_id: KL-1.2a
  schema_version: 1.0.0
  applies_to: "KID section bodies"
  enforcement_level: "hard"
  ---

  # KL-1.2a — Section Constraints

  These rules keep items atomic and non-monolithic.

  ## Summary
  - MUST be 1–3 lines.
  - MUST NOT contain:
    - code blocks
    - tables
    - links
  - SHOULD use plain language and name the problem/benefit.

  ## When to use
  - MUST include at least 2 bullets OR a short paragraph + at least 2 bullets.
  - MUST include applicability conditions (signals that selection can match).
  - SHOULD include "When NOT to use" bullets when misuse risk is non-trivial.

  ## Do / Don't
  - MUST include two sublists labeled **Do** and **Don't**.
  - Each sublist MUST have 2–8 bullets.
  - Bullets MUST be concrete and testable where possible.
  - MUST NOT include long prose paragraphs (max 6 lines in any single paragraph).

  ## Core content
  - MUST contain the knowledge content.
  - May include subsections (H3/H4) but MUST remain atomic:
    - Soft cap: 600 words
    - Hard cap: 1,200 words (gate failure if exceeded)
  - Code blocks:
    - Allowed only if item.type is pattern/procedure/reference/example
    - If use_policy is pattern_only, code blocks MUST be pseudocode or illustrative, not copy-ready production code
  - Tables:
    - Allowed for reference items; allowed elsewhere only if they improve scanability.

  ## Links
  - Heading MUST exist (even if empty).
  - Internal links SHOULD use KID IDs, not filesystem paths.
  - External links allowed only if license + use_policy permit.

  ## Proof / confidence
  - MUST include:
    - tier: draft | reviewed | verified | golden
    - evidence: brief text (or "none yet" for draft)
  - SHOULD include references (run IDs, tests, audits) when tier >= reviewed.
  