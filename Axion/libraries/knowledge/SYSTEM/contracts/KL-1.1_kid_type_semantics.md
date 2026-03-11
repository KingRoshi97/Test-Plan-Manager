---
  contract_id: KL-1.1a
  schema_version: 1.0.0
  applies_to: "KID Core content section"
  enforcement_level: "hard"
  ---

  # KL-1.1a — KID Type Semantics

  This defines what the **Core content** section MUST look like per KID type.

  ## concept
  Core content MUST include:
  - Explanation of the concept in plain language
  - Scope boundaries (what it covers / does not cover)
  - At least 1 concrete example or scenario (not code)

  ## pattern
  Core content MUST include:
  - Problem statement (what this pattern solves)
  - Solution outline (reusable approach)
  - Applicability conditions (when it is valid)
  - Constraints/guardrails (what must be true)
  - Implementation notes (non-copy, behavior-level)

  ## procedure
  Core content MUST include:
  - Prerequisites
  - Ordered steps (numbered)
  - Expected outputs (what success looks like)
  - Rollback or "safe stop" step (where applicable)

  ## checklist
  Core content MUST include:
  - A checklist with testable items
  - Each item must be phrased as a verifiable condition
  - Optional: "Evidence" sub-bullets per item

  ## reference
  Core content MUST include at least one of:
  - Table(s)
  - Enum lists
  - Defaults/limits
  - Parameter definitions (name → meaning → allowed values)
  No narrative longer than 8 lines in any subsection.

  ## pitfall
  Core content MUST include:
  - Symptom(s)
  - Root cause(s)
  - Detection method(s)
  - Fix / mitigation
  - Prevention rule (so it doesn't recur)

  ## example
  Core content MUST include:
  - Minimal illustrative structure (not a full donor)
  - "What to learn from this" bullets
  Must NOT include:
  - Large blocks of production code
  - Copy-ready sections beyond excerpt limits

  ## glossary_term
  Core content MUST include:
  - Canonical definition (1–4 lines)
  - Context (where used in Axion)
  - Synonyms/aliases (if any)
  - Common confusion / non-examples (optional)
  