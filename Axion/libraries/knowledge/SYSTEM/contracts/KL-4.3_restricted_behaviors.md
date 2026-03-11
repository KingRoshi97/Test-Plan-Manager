---
  contract_id: KL-4.3
  schema_version: 1.0.0
  applies_to: "Agent behavior when consuming KIDs"
  enforcement_level: "hard"
  ---

  # KL-4.3 — Restricted Behaviors

  Agents MUST NOT do the following:

  ## 1) Copying beyond policy limits
  - MUST NOT copy code blocks or long prose unless:
    - KID.use_policy == reusable_with_allowlist, AND
    - excerpt is within allowed_excerpt limits, AND
    - reuse_log entry is emitted (KL-4.4 / KL-5.3)

  ## 2) Leaking internal-only items to external executors
  If executor_type == external:
  - MUST NOT use any KID where executor_access == internal_only
  - MUST NOT include internal-only content in artifacts or kits exported for external execution

  ## 3) Including restricted content inside external kits
  - MUST NOT package KID content (full text or excerpts) into external kits unless explicitly permitted.
  - Even when permitted, include only excerpts within allowed limits and record reuse.

  ## 4) Using examples as donors
  - Examples are "structure learning only" unless allowlisted.
  - MUST NOT paste example content into outputs as-is.

  ## 5) Bypassing selection
  - Agents MUST NOT "roam" the library.
  - Only KIDs present in KNOWLEDGE_SELECTION may influence outputs.
  - Direct reads outside the selection list is a hard violation.

  ## 6) Smuggling via paraphrase
  - MUST NOT produce near-verbatim paraphrases that preserve distinctive phrasing and ordering.
  - If output similarity is high, treat as copying and block (KL-5.3).
  