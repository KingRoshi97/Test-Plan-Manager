# FEAT-014 — Coverage Scoring Engine: Gates & Proofs

## 1. Applicable Gates

This feature does not own any gates directly. It is consumed by the gate engine (FEAT-003) via the `coverage_gte` evaluator operation, which calls `computeCoverage()` and `meetsCoverageThreshold()` to determine if G6 PLAN-COVERAGE passes.

## 2. Integration with Gate Engine

The coverage scoring engine is invoked during gate evaluation:

- **G6 (PLAN-COVERAGE)**: Uses `computeCoverage()` to compute the score, then `meetsCoverageThreshold()` to check against the configured threshold
- The gate engine passes the acceptance map, proof ledger entries, and threshold as inputs

## 3. Required Proof Types

The following proof types (from VER-01) are relevant to coverage scoring:

| Proof Type | Name | Usage in Coverage |
|------------|------|-------------------|
| P-01 | Command Output Proof | Counted as coverage for functional/integration items |
| P-02 | Test Result Proof | Counted as coverage for functional/security items |
| P-05 | Diff/Commit Reference Proof | Counted as coverage for code change items |
| P-06 | Checklist Proof (Manual Verification) | Counted as coverage for security/manual review items |

Items with `required_proof_types` specified must have proofs of all listed types to be considered covered.

## 4. Override Policy

- Coverage threshold overrides are governed by the policy engine (FEAT-011)
- Overrides do not change the computed score — they only affect whether a gate passes despite below-threshold coverage

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
- FEAT-008 (Proof Ledger)
