# FEAT-011 — Policy Engine Core: Documentation Requirements

## 1. API Documentation

- `loadPolicies(registryPath)` — Loads policies from registry JSON, risk-class library, and override-policy library
- `evaluatePolicy(policy, context)` — Evaluates a single policy against a context, returning pass/fail with violations
- `evaluateAllPolicies(policies, context)` — Evaluates all policies, returning an array of results

## 2. Architecture Documentation

### Data Flow

1. `loadPolicies()` reads registry JSON → iterates `entries[]` → constructs `Policy[]`
2. `loadPolicies()` checks for `libraries/policy/risk_classes.v1.json` → synthesizes risk-class policies with hard-stop/evidence/override rules
3. `loadPolicies()` checks for `libraries/policy/override_policy.v1.json` → synthesizes override policy
4. `evaluatePolicy()` checks if policy applies via `policyAppliesToContext()` → evaluates each rule via `matchesCondition()` → collects violations → determines `passed` based on enforcement mode

### Condition Matching Patterns

| Pattern | Behavior |
|---------|----------|
| `"true"` | Always matches |
| `"security.gates.fail"` | Matches if a gate key containing "security" has `passed: false` |
| `"privacy.data_handling.missing"` | Matches if a gate key containing "privacy" has `passed: false` |
| `evidence.includes("X")` | Matches if `"X"` is NOT in `context.evidence` |
| `"overrides.length === 0"` | Matches if `context.overrides` is non-empty |
| `"gates.*"` / `"standards.*"` | Always returns `false` (reserved) |

## 3. Type Reference

- `Policy` — `{ policy_id, name, version, description, rules: PolicyRule[], applies_to: string[], enforcement: "strict" | "advisory" }`
- `PolicyRule` — `{ rule_id, condition, action: "allow" | "deny" | "warn", message }`
- `PolicyEvaluationResult` — `{ policy_id, passed, violations[] }`
- `RiskClass` — `{ risk_class, hard_stops[], required_evidence[], allow_overrides }`
- `OverrideRule` — `{ rule_id, applies_to, allowed, requires_evidence[], expires_in_days, notes? }`
- `PolicyContext` — `{ run_id?, stage_id?, risk_class?, gate_results?, evidence?, overrides?, [key]: unknown }`

## 4. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- GOV-01 (Versioning Policy)
