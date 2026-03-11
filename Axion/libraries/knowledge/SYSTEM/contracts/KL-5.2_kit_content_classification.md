---
  contract_id: KL-5.2b
  schema_version: 1.0.0
  applies_to: "Determining what content is allowed inside external kits"
  enforcement_level: "hard"
  ---

  # KL-5.2b — Kit Content Classification

  ## Content types
  When packaging a kit, classify any knowledge-derived content as:

  1) **citation_only**
  - KID referenced, no excerpt included.

  2) **paraphrase**
  - rewritten content that does not preserve distinctive phrasing.
  - allowed for external kits if the underlying KID was accessible to the executor.

  3) **excerpt**
  - verbatim text/code/table content from a KID.
  - allowed ONLY if:
    - use_policy == reusable_with_allowlist
    - excerpt is within allowed_excerpt
    - reuse_log entry exists

  ## Hard bans for external kits
  If target_executor == external:
  - Ban any excerpt or full text from:
    - executor_access == internal_only
    - use_policy == restricted_internal_only

  ## Proof of compliance
  Kit export MUST include an export_report listing:
  - KIDs cited
  - KIDs excerpted + excerpt sizes
  - blocked items (if any) + reason codes
  