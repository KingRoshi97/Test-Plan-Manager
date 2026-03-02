# FEAT-005 — Cache & Incremental Planner: Gates & Proofs

  ## 1. Applicable Gates

  This feature does not own any gates directly. It is subject to gates enforced by upstream features (FEAT-003 Gate Engine Core).

  ## 2. Required Proof Types

  The following proof types (from VER-01) are applicable to this feature:

  | Proof Type | Name | Applicability |
  |------------|------|---------------|
  | P-01 | Command Output Proof | Build and runtime verification |
  | P-02 | Test Result Proof | Unit and integration test results |
  | P-05 | Diff/Commit Reference Proof | Code change verification |
  | P-06 | Checklist Proof (Manual Verification) | Manual review verification |

  ## 3. Gate Report Contract

  Every gate produces a report per ORD-02 Section 7:

  - `gate_id` — Gate identifier
  - `target` — Artifact or output being checked
  - `status` — pass | fail
  - `executed_at` — Timestamp
  - `issues[]` — Array of issue objects with:
    - `issue_id`, `severity`, `error_code`, `rule_id`, `pointer`, `message`, `remediation`

  ## 4. Override Policy

  - Overrides are allowed only if the gate rule declares `overridable: true`
  - Override records must include: override_id, gate_id, rule_id, approver, reason, risk_acknowledged, timestamp
  - Overrides never delete the original failure — they annotate it

  ## 5. Cross-References

  - SYS-07 (Compliance & Gate Model)
  - ORD-02 (Gate DSL & Gate Rules)
  - VER-01 (Proof Types & Evidence Rules)
  - FEAT-003 (Gate Engine Core)
  