# FEAT-011 — Policy Engine Core: Test Plan

## 1. Unit Tests

### 1.1 `loadPolicies()`

- Returns empty array when registry file does not exist
- Loads policies from registry file with correct `policy_id`, `name`, `version`, `description`
- Defaults `name` to `policy_id` when `name` is absent in entry
- Defaults `applies_to` to `["*"]` when absent
- Defaults `enforcement` to `"strict"` when absent
- Auto-generates `rule_id` as `{policy_id}-R01`, `R02`, etc. when `rule_id` is absent
- Defaults `condition` to `"true"` and `action` to `"allow"` when absent in rule
- Synthesizes risk-class policies from `libraries/policy/risk_classes.v1.json`
- Risk-class hard stops generate `deny` rules with IDs `RC-{class}-HS-{stop}`
- Risk-class required evidence generates `deny` rules with IDs `RC-{class}-EV-{evidence}`
- Risk-class with `allow_overrides: false` generates `RC-{class}-NO-OVR` deny rule
- Risk-class policies have `policy_id: "RISK-{class}"` and `enforcement: "strict"`
- Synthesizes override policy from `libraries/policy/override_policy.v1.json`
- Override rules with `allowed: true` map to `action: "allow"`, `allowed: false` maps to `action: "deny"`
- Override policy has `policy_id: "OVERRIDE-POLICY"` and `applies_to: ["overrides"]`
- Skips library directory silently when it does not exist

### 1.2 `evaluatePolicy()`

- Returns `passed: true` with empty violations when policy scope does not match context
- Skips rules with `action: "allow"` (no violation generated)
- Triggers `deny` violation for hard-stop condition when matching gate result has `passed: false`
- Does not trigger hard-stop condition when matching gate result has `passed: true`
- Triggers evidence condition violation when required evidence is missing from `context.evidence`
- Triggers override condition violation when `context.overrides` is non-empty and condition is `overrides.length === 0`
- Returns `passed: false` for strict enforcement when any `deny` violation exists
- Returns `passed: true` for advisory enforcement even with `deny` violations
- Violations include `rule_id`, `action`, `message`, and context with `condition`, `risk_class`, `stage_id`

### 1.3 `policyAppliesToContext()` (internal)

- Matches `"*"` scope to any context
- Matches `"overrides"` scope when `context.overrides` is defined
- Matches `"risk_class:{rc}"` scope when `context.risk_class === rc`
- Matches stage-level scope when `scope === context.stage_id`
- Returns `false` when no scope matches

### 1.4 `matchesCondition()` (internal)

- `"true"` always returns `true`
- `"security.gates.fail"` returns `true` when a gate key containing `"security"` has `passed: false`
- `"privacy.data_handling.missing"` returns `true` when a gate key containing `"privacy"` has `passed: false`
- `evidence.includes("X")` returns `true` (violation) when `"X"` is absent from `context.evidence`
- `"overrides.length === 0"` returns `true` (violation) when `context.overrides` is non-empty
- Conditions starting with `"gates."` or `"standards."` return `false`
- Unrecognized conditions return `false`

### 1.5 `evaluateAllPolicies()`

- Returns one `PolicyEvaluationResult` per policy
- Aggregates results from multiple policies correctly

## 2. Integration Tests

- Load policies from a test registry file, then evaluate against a mock context with gate results
- Verify risk-class policy enforcement blocks a run when required evidence is missing
- Verify override policy denies overrides when `allowed: false`

## 3. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (policy registry files, risk class files, override files)
- Helpers: `test/helpers/`

## 4. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
