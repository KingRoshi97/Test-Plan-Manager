---
  contract_id: KL-1.2b
  schema_version: 1.0.0
  applies_to: "KL validation gate for KID content sections"
  enforcement_level: "hard"
  ---

  # KL-1.2b — Validation Checklist

  A KID passes KL-1.2 if ALL checks are true:

  ## Headings + order
  - [ ] Contains H2 headings exactly: Summary, When to use, Do / Don't, Core content, Links, Proof / confidence
  - [ ] Headings appear in the correct order with no missing required heading
  - [ ] No additional H2 headings inserted between required headings

  ## Summary constraints
  - [ ] Summary exists and is 1–3 lines
  - [ ] Summary contains no links, code blocks, or tables

  ## When to use constraints
  - [ ] When to use exists and includes applicability (>= 2 bullets OR paragraph + >=2 bullets)

  ## Do / Don't constraints
  - [ ] Do / Don't contains both labeled sublists: Do and Don't
  - [ ] Do list has 2–8 bullets
  - [ ] Don't list has 2–8 bullets

  ## Core content constraints
  - [ ] Core content exists
  - [ ] Word count <= 1,200 (hard cap)
  - [ ] If code blocks exist:
    - [ ] type in {pattern, procedure, reference, example}
    - [ ] if use_policy == pattern_only: blocks are illustrative/pseudocode (no copy-ready donor chunks)

  ## Links constraints
  - [ ] Links heading exists (content may be empty)

  ## Proof / confidence constraints
  - [ ] Proof / confidence exists
  - [ ] Contains tier: {draft|reviewed|verified|golden}
  - [ ] Contains evidence line (or "none yet" if tier==draft)
  