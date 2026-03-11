---
  contract_id: KL-3.2a
  schema_version: 1.0.0
  applies_to: "KNOWLEDGE_SELECTION artifact generation"
  enforcement_level: "hard"
  ---

  # KL-3.2a — KNOWLEDGE_SELECTION Output Rules

  ## Deterministic ordering
  The "selected" list MUST be ordered deterministically:
  1) bundle contribution order (if bundles applied)
  2) then ranked relevance (KL-3.3 ranking rules)
  3) tie-breakers:
    - pillar
    - primary domain
    - type
    - kid

  ## What must be included per selected item
  Each selected item MUST include:
  - kid, title, type, path (from KNOWLEDGE_INDEX)
  - why_selected.matches (domain/tag/bundle/profile/stack_family hits)
  - why_selected.score (numeric)
  - restrictions snapshot:
    - use_policy, executor_access, allowed_excerpt, maturity

  ## Cap enforcement
  - "cap" MUST equal the applied selection_cap.
  - selected.length MUST be <= cap.
  - If candidate set > cap:
    - truncate after sorting
    - include note "cap_applied" with counts.

  ## Repro mode
  If mode == reproducibility:
  - deprecated items may appear only if allow_for_repro=true.
  - any deprecated selected item MUST include deprecation_notice.
  