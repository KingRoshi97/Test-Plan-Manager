---
  contract_id: KL-4.4
  schema_version: 1.0.0
  applies_to: "Any artifact/render output influenced by KIDs"
  enforcement_level: "hard"
  ---

  # KL-4.4 — Mandatory Citation Behavior

  ## Rule
  If a KID influences an output in any way, the agent MUST emit:

  1) knowledge_citations: [KID-...]
  2) reuse_log entries ONLY if verbatim reuse occurs (allowlisted only)

  ## knowledge_citations (always required when used)
  - Must list all KIDs that influenced:
    - requirements
    - constraints
    - checklists/procedures followed
    - defaults copied from references
  - Must include KIDs even when content is paraphrased.

  ## reuse_log (required only for allowlisted verbatim reuse)
  A reuse_log entry MUST exist if:
  - any excerpt (prose/code/table row) is copied verbatim, AND
  - allowed by use_policy + allowed_excerpt

  If reuse occurs:
  - The exact excerpt length MUST be recorded (words/lines)
  - The target location MUST be recorded (artifact + section)
  - The system MUST verify limits before allowing export/close.

  ## Prohibitions
  - reuse_log MUST NOT be emitted for pattern_only usage unless excerpting occurred.
  - If excerpting occurred while use_policy != reusable_with_allowlist, block the run.
  