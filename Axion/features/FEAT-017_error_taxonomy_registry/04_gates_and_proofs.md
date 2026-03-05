# FEAT-017 — Error Taxonomy & Registry: Gates & Proofs

## 1. Applicable Gates

This feature does not own any gates directly. It is a foundational infrastructure feature consumed by all other features. It is subject to gates enforced by FEAT-003 (Gate Engine Core) when used within a pipeline run.

## 2. Required Proof Types

The following proof types (from VER-01) are applicable to this feature:

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | Registry loading and validation output |
| P-02 | Test Result Proof | Unit test results for all exported functions |
| P-05 | Diff/Commit Reference Proof | Code change verification |

## 3. Gate Report Contract

When errors from this feature appear in gate reports (per ORD-02 Section 7), they include:

- `error_code` — The `ERR-TAX-NNN` code from this feature's error table
- `severity` — Mapped from the ErrorCode severity field
- `message` — Formatted via `formatErrorMessage()` with context interpolation
- `remediation` — The `action` field from the ErrorCode definition

## 4. Override Policy

- Not directly applicable (this feature does not produce gate pass/fail decisions)
- When errors from this registry appear in gate reports, override rules from FEAT-003 apply

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
