# FEAT-010 — Release Objects & Signing: Gates & Proofs

## 1. Applicable Gates

This feature does not own any gates directly. It operates after the gate evaluation pipeline has completed. Release creation typically occurs after all G1–G8 gates have passed for a run.

## 2. Required Proof Types

The following proof types (from VER-01) are applicable:

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | CLI command outputs for release operations |
| P-02 | Test Result Proof | Unit test results for release lifecycle |
| P-05 | Diff/Commit Reference Proof | Code change verification for release module |

## 3. Internal Quality Gates

The release module enforces its own internal quality gates:

- **Signature gate**: A release cannot be published without at least one signature
- **Transition gate**: State transitions are validated against `VALID_TRANSITIONS` before execution
- **Artifact binding**: Signatures are computed over the full artifact set, preventing post-sign artifact tampering

## 4. Gate Report Contract

When release operations are subject to upstream gate evaluation (via FEAT-003), gate reports follow ORD-02 Section 7 format with standard fields: gate_id, target, status, executed_at, issues[].

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
