---
  contract_id: KL-5.1b
  schema_version: 1.0.0
  applies_to: "Gate failure reporting for KL-5.1"
  enforcement_level: "hard"
  ---

  # KL-5.1b — Gate Evidence Format

  Any KL-5.1 gate failure report MUST include:
  - gate_id
  - failing_kids (list)
  - locations (where referenced: selection/citations/reuse_log)
  - reason (human readable)
  - remediation (what to change)

  Example:
  - gate_id: KL-GATE-01
  - failing_kids: ["KID-...-9999"]
  - locations: ["knowledge_citations", "KNOWLEDGE_SELECTION.selected[3]"]
  - remediation: "Add KID to KNOWLEDGE_INDEX or remove reference."
  