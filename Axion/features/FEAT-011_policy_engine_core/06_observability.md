# FEAT-011 — Policy Engine Core: Observability

## 1. Metrics

The current implementation does not emit metrics directly. The following metrics should be tracked by callers:

- `policies.loaded` — Count of policies returned by `loadPolicies()`
- `policies.evaluated` — Count of policies evaluated per `evaluateAllPolicies()` call
- `policies.passed` — Count of policies with `passed: true`
- `policies.failed` — Count of policies with `passed: false`
- `policies.violations.deny` — Count of `deny` violations across all evaluated policies
- `policies.violations.warn` — Count of `warn` violations across all evaluated policies

## 2. Logging

The current implementation does not perform structured logging. Callers should log:

### 2.1 Recommended Log Events

- `policy.load.complete` — After `loadPolicies()` returns, log count of policies loaded (registry + risk-class + override)
- `policy.evaluate.result` — After each `evaluatePolicy()`, log `policy_id`, `passed`, violation count
- `policy.evaluate.violation` — For each violation, log `rule_id`, `action`, `condition`, `risk_class`
- `policy.scope.skip` — When a policy does not apply to the current context

### 2.2 Log Levels

- `ERROR`: Policy file exists but fails to parse
- `WARN`: Advisory policy violations (violations with enforcement `"advisory"`)
- `INFO`: Policy load summary, evaluation results
- `DEBUG`: Individual condition matching results, scope matching

## 3. Traces

- `policy.load` — Span covering file reads and policy synthesis
- `policy.evaluate` — Span per policy evaluation
- `policy.evaluateAll` — Parent span covering all policy evaluations

## 4. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
