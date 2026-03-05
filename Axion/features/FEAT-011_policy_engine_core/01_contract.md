# FEAT-011 — Policy Engine Core: Contract

## 1. Purpose

Loads policy definitions from on-disk registry files, synthesizes additional policies from risk-class and override-policy library files, and evaluates all applicable policies against a pipeline context to produce pass/fail results with violation details.

## 2. Inputs

- `registryPath: string` — File path to the policy registry JSON (`PolicyRegistryFile`)
- `policy: Policy` — A single policy object for per-policy evaluation
- `context: unknown` — Cast to `PolicyContext` internally; may contain `run_id`, `stage_id`, `risk_class`, `gate_results`, `evidence`, `overrides`
- `policies: Policy[]` — Array of all loaded policies for batch evaluation

### Source Files

- Policy registry JSON: `{ $schema, description, entries[] }` where each entry has `policy_id`, `version`, `description`, `rules[]`, optional `applies_to`, `enforcement`, `name`
- Risk classes file: `libraries/policy/risk_classes.v1.json` — `{ version, description, classes[] }` where each class has `risk_class`, `hard_stops[]`, `required_evidence[]`, `allow_overrides`
- Override policy file: `libraries/policy/override_policy.v1.json` — `{ version, rules[] }` where each rule has `rule_id`, `applies_to`, `allowed`, `requires_evidence[]`, `expires_in_days`

## 3. Outputs

- `loadPolicies()` → `Policy[]` — Array of loaded and synthesized policy objects
- `evaluatePolicy()` → `PolicyEvaluationResult` — `{ policy_id, passed, violations[] }`
- `evaluateAllPolicies()` → `PolicyEvaluationResult[]` — Results for every policy

### Violation object shape

```ts
{
  rule_id: string;
  action: "deny" | "warn";
  message: string;
  context: { condition, risk_class, stage_id };
}
```

## 4. Invariants

- Policy evaluation is deterministic for identical inputs and identical on-disk files
- `allow` rules are always skipped during evaluation (only `deny` and `warn` rules can trigger violations)
- Strict enforcement: any `deny` violation causes `passed: false`
- Advisory enforcement: `passed` is always `true` regardless of violations
- A policy that does not match the context (`applies_to` vs `PolicyContext`) returns `passed: true` with zero violations
- Missing registry file produces an empty policy list (no error thrown)
- Missing library directory is silently skipped
- Risk-class policies are synthesized with `policy_id: "RISK-{class}"` and `enforcement: "strict"`
- Override policy is synthesized with `policy_id: "OVERRIDE-POLICY"` and `enforcement: "strict"`

## 5. Dependencies

- `FEAT-001` — Control Plane Core (consumes `PolicyContext` with `run_id`, `stage_id`)
- `FEAT-003` — Gate Engine Core (gate results fed into `context.gate_results`)
- `../../utils/fs.js` — `readJson<T>()` utility for loading JSON files

## 6. Source Modules

- `src/core/controlPlane/policies.ts` (272 lines)

## 7. Failure Modes

- Registry JSON is malformed or does not match `PolicyRegistryFile` shape → `readJson` throws
- Risk-class file present but missing `classes` array → runtime error iterating `undefined`
- Override file present but missing `rules` array → runtime error in `.map()`
- Condition string does not match any known pattern → `matchesCondition` returns `false` (safe default)

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
