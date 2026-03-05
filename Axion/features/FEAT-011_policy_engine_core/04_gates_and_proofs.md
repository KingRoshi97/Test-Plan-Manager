# FEAT-011 — Policy Engine Core: Gates & Proofs

## 1. Applicable Gates

This feature does not own any gates directly. It is consumed by the Control Plane (FEAT-001) which invokes policy evaluation during pipeline execution. Gate results from FEAT-003 are passed into `PolicyContext.gate_results` for policy condition matching.

## 2. Required Proof Types

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | Verify `loadPolicies()` loads from registry and library files correctly |
| P-02 | Test Result Proof | Unit test results for `evaluatePolicy()`, `evaluateAllPolicies()`, condition matching |
| P-05 | Diff/Commit Reference Proof | Code change verification for policy engine modifications |

## 3. Policy–Gate Interaction

The policy engine evaluates `gate_results` from context:

- `matchesCondition()` checks hard-stop patterns (`security.gates.fail`, `privacy.data_handling.missing`) by scanning `context.gate_results` keys for domain matches
- If a matching gate key exists and `passed === false`, the condition is triggered
- This enables policies that enforce "if security gate failed, deny progression"

## 4. Override Policy Integration

- Override rules loaded from `libraries/policy/override_policy.v1.json`
- Each `OverrideRule` specifies: `rule_id`, `applies_to`, `allowed`, `requires_evidence[]`, `expires_in_days`
- Synthesized into a single `OVERRIDE-POLICY` policy with `enforcement: "strict"`
- Rules where `allowed === true` become `action: "allow"` (skipped during evaluation)
- Rules where `allowed === false` become `action: "deny"` (block overrides)

## 5. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
