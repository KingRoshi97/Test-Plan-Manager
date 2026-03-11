---
  contract_id: KL-5.3c
  schema_version: 1.0.0
  applies_to: "Gate failure reporting for KL-5.3"
  enforcement_level: "hard"
  ---

  # KL-5.3c — Reuse Gate Evidence Format

  A KL-5.3 failure report MUST include:
  - gate_id
  - offending_kid
  - excerpt_measurement (words/lines)
  - allowed_excerpt (words/lines)
  - locations (artifact + section/path)
  - remediation

  Remediation examples:
  - "Replace excerpt with paraphrase + citations"
  - "Reduce excerpt size to within limits and add reuse_log"
  - "Mark KID as reusable_with_allowlist and set allowed_excerpt (governed change)"
  