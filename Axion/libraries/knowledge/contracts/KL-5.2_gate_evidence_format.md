---
  contract_id: KL-5.2c
  schema_version: 1.0.0
  applies_to: "Gate failure reporting for KL-5.2"
  enforcement_level: "hard"
  ---

  # KL-5.2c — Access Gate Evidence Format

  Any KL-5.2 gate failure report MUST include:
  - gate_id
  - executor_type / target_executor
  - offending_kids
  - offending_paths (where content appears in kit/artifacts)
  - reason code
  - remediation

  Example remediation:
  - "Remove internal_only KIDs from selection"
  - "Strip restricted content from kit export"
  - "Replace excerpt with paraphrase + citations"
  