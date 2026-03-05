# FEAT-015 — Run Diff Engine: Gates & Proofs

## 1. Applicable Gates

This feature does not own any gates directly. It is subject to gates enforced by upstream features (FEAT-003 Gate Engine Core).

## 2. Required Proof Types

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | Verify `diffRuns()` produces correct output for known directory pairs |
| P-02 | Test Result Proof | Unit test results for `diffRuns()`, `classifyChanges()`, `classifySingleChange()` |
| P-05 | Diff/Commit Reference Proof | Code change verification for the diff engine itself |

## 3. Gate Report Contract

Every gate produces a report per ORD-02 Section 7:

- `gate_id` — Gate identifier
- `target` — Artifact or output being checked
- `status` — pass | fail
- `executed_at` — Timestamp
- `issues[]` — Array of issue objects

## 4. Override Policy

- Overrides are allowed only if the gate rule declares `overridable: true`
- Override records must include: override_id, gate_id, rule_id, approver, reason, risk_acknowledged, timestamp

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
