---
  contract_id: KL-5.4b
  schema_version: 1.0.0
  applies_to: "Operator override of KL-GATE-08"
  enforcement_level: "hard"
  ---

  # KL-5.4b — Override Record Format

  If KL-GATE-08 is overridden, record:

  - override_id: OVERRIDE-KL-GATE-08-<NNNN>
  - operator: <name/id>
  - timestamp: <iso datetime>
  - reason: <why this is safe>
  - impacted_kids: [KID-...]
  - compensating_controls: <tests, audits, manual review, extra gates>
  - expiry: <date> (must not be blank)

  This record must be referenced by:
  - run log
  - KNOWLEDGE_SELECTION.notes
  