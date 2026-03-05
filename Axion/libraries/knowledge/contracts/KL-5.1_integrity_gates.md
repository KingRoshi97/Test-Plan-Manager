---
  contract_id: KL-5.1
  schema_version: 1.0.0
  applies_to: "Knowledge Library enforcement"
  enforcement_level: "hard"
  ---

  # KL-5.1 — Integrity Gates

  ## KL-GATE-01 — Referenced KIDs exist
  **Rule:** Every KID referenced in:
  - KNOWLEDGE_SELECTION.selected
  - knowledge_citations
  - reuse_log
  MUST exist in KNOWLEDGE_INDEX.

  **Fail reason code:** KL-GATE-01

  ---

  ## KL-GATE-02 — KID metadata valid
  **Rule:** Every selected KID MUST pass KL-1.3 metadata validation.

  **Fail reason code:** KL-GATE-02

  ---

  ## KL-GATE-03 — Deprecated avoidance
  **Rule:** Deprecated KIDs MUST NOT be used unless:
  - mode == reproducibility AND allow_for_repro==true.

  If used in repro, output MUST include deprecation_notice.

  **Fail reason code:** KL-GATE-03
  