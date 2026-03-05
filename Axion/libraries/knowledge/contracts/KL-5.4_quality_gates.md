---
  contract_id: KL-5.4
  schema_version: 1.0.0
  applies_to: "Knowledge selection for higher-risk runs"
  enforcement_level: "soft_to_hard_by_policy"
  ---

  # KL-5.4 — Quality Gates

  ## KL-GATE-08 — Production maturity threshold for selected KIDs
  **Rule:** For runs where risk_class in {PROD, COMPLIANCE}:
  - Every selected KID MUST meet maturity >= required threshold.

  Default thresholds:
  - PROD: reviewed+
  - COMPLIANCE: verified+

  ## Exceptions
  - Exceptions are allowed ONLY if:
    - an override is explicitly recorded in the run (operator override), AND
    - the selection artifact notes the exception, AND
    - the output is tagged "knowledge_maturity_exception=true"

  ## Fail reason code
  KL-GATE-08
  