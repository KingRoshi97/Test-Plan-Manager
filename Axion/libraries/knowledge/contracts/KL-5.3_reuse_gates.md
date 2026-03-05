---
  contract_id: KL-5.3
  schema_version: 1.0.0
  applies_to: "Outputs + kit packaging when KIDs are used"
  enforcement_level: "hard"
  ---

  # KL-5.3 — Plagiarism / Reuse Gates

  ## KL-GATE-06 — Allowlisted reuse requires reuse_log
  **Rule:** If output contains any verbatim excerpt from a KID:
  - reuse_log MUST include an entry for that KID, and
  - KID.use_policy MUST be reusable_with_allowlist.

  **Fail reason code:** KL-GATE-06

  ---

  ## KL-GATE-07 — Block verbatim copying beyond excerpt limits
  **Rule:** For every reuse_log entry:
  - excerpt_size MUST be <= KID.allowed_excerpt (max_words/max_lines).
  If output contains verbatim text beyond allowed limits → block.

  **Fail reason code:** KL-GATE-07

  ---

  ## Optional hardening
  If similarity detection is enabled:
  - high-similarity outputs to KID content trigger failure (KL-R06) even if not exact verbatim.
  