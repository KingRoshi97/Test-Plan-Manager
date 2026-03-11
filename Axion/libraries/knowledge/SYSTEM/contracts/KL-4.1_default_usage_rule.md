---
  contract_id: KL-4.1
  schema_version: 1.0.0
  applies_to: "All agent consumption of Knowledge Library items"
  enforcement_level: "hard"
  ---

  # KL-4.1 — Default Usage Rule

  ## Rule
  Knowledge Items are **pattern-only by default**.

  This means:
  - Agents may use KIDs to derive constraints, requirements, and approaches.
  - Agents must **re-express** content in original language.
  - Agents must NOT copy long prose or code from KIDs into outputs.

  ## Allowlisting
  The only exception is when:
  - KID.use_policy == reusable_with_allowlist, AND
  - allowed_excerpt.max_words OR allowed_excerpt.max_lines > 0, AND
  - the output includes a reuse_log entry (KL-4.4 / KL-5.3).

  ## Determinism
  When a KID is used, the system MUST record its KID ID in knowledge_citations even if no excerpt is copied verbatim.

  ## Non-negotiables
  - No verbatim copying beyond allowed_excerpt.
  - No external executor access to internal_only items.
  - No exporting restricted content inside external kits.
  