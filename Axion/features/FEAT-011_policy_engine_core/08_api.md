# FEAT-011 — Policy Engine Core: API Surface

## 1. Module Exports

Source module: `src/core/controlPlane/policies.ts`

## 2. Public Functions

### `loadPolicies(registryPath: string): Policy[]`

- **Module**: `src/core/controlPlane/policies.ts`
- **Parameters**: `registryPath` — Absolute or relative path to the policy registry JSON file
- **Returns**: `Policy[]` — Array of loaded policies from registry entries, synthesized risk-class policies, and synthesized override policy
- **Side Effects**: Reads from filesystem via `existsSync()` and `readJson()`
- **Behavior**:
  - If `registryPath` does not exist, returns empty array
  - Reads registry entries, defaulting `name` to `policy_id`, `applies_to` to `["*"]`, `enforcement` to `"strict"`, auto-generating `rule_id` when absent
  - Looks for `libraries/policy/risk_classes.v1.json` relative to `dirname(registryPath)`
  - Looks for `libraries/policy/override_policy.v1.json` relative to `dirname(registryPath)`

### `evaluatePolicy(policy: Policy, context: unknown): PolicyEvaluationResult`

- **Module**: `src/core/controlPlane/policies.ts`
- **Parameters**:
  - `policy` — A single `Policy` object
  - `context` — Cast internally to `PolicyContext`
- **Returns**: `PolicyEvaluationResult` — `{ policy_id: string, passed: boolean, violations: Array<{ rule_id, action, message, context }> }`
- **Side Effects**: None (pure evaluation)
- **Behavior**:
  - If policy does not apply to context (scope mismatch), returns `{ passed: true, violations: [] }`
  - Skips rules with `action: "allow"`
  - For `deny`/`warn` rules, evaluates condition via `matchesCondition()`
  - `passed` is `false` only if enforcement is `"strict"` AND at least one `deny` violation exists

### `evaluateAllPolicies(policies: Policy[], context: unknown): PolicyEvaluationResult[]`

- **Module**: `src/core/controlPlane/policies.ts`
- **Parameters**:
  - `policies` — Array of `Policy` objects
  - `context` — Evaluation context
- **Returns**: `PolicyEvaluationResult[]` — One result per policy, in same order as input

## 3. Exported Types

### `Policy`

```ts
interface Policy {
  policy_id: string;
  name: string;
  version: string;
  description: string;
  rules: PolicyRule[];
  applies_to: string[];
  enforcement: "strict" | "advisory";
}
```

### `PolicyRule`

```ts
interface PolicyRule {
  rule_id: string;
  condition: string;
  action: "allow" | "deny" | "warn";
  message: string;
}
```

### `PolicyEvaluationResult`

```ts
interface PolicyEvaluationResult {
  policy_id: string;
  passed: boolean;
  violations: Array<{
    rule_id: string;
    action: "deny" | "warn";
    message: string;
    context: Record<string, unknown>;
  }>;
}
```

### `RiskClass`

```ts
interface RiskClass {
  risk_class: string;
  hard_stops: string[];
  required_evidence: string[];
  allow_overrides: boolean;
}
```

### `OverrideRule`

```ts
interface OverrideRule {
  rule_id: string;
  applies_to: string;
  allowed: boolean;
  requires_evidence: string[];
  expires_in_days: number;
  notes?: string;
}
```

### `PolicyContext`

```ts
interface PolicyContext {
  run_id?: string;
  stage_id?: string;
  risk_class?: string;
  gate_results?: Record<string, { passed: boolean }>;
  evidence?: string[];
  overrides?: Array<{
    rule_id: string;
    evidence: string[];
    created_at: string;
  }>;
  [key: string]: unknown;
}
```

## 4. Internal Functions (not exported)

- `matchesCondition(condition: string, context: PolicyContext): boolean` — Pattern-matches condition strings against context
- `policyAppliesToContext(policy: Policy, context: PolicyContext): boolean` — Checks if any policy scope matches the context

## 5. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error handling)
- SYS-03 (End-to-End Architecture)
