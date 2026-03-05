# FEAT-011 — Policy Engine Core: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-POL-NNN` format.

## 2. Domain

`POL`

## 3. Error Codes

The policy engine does not throw domain-specific error codes. Errors propagate from underlying I/O and JSON parsing:

| Source | Condition | Behavior |
|--------|-----------|----------|
| `readJson()` | Registry file exists but is malformed JSON | Throws parse error from `readJson` |
| `readJson()` | Risk-class or override file is malformed | Throws parse error from `readJson` |
| `existsSync()` | File does not exist | Returns empty array / skips silently — no error |
| `matchesCondition()` | Unrecognized condition string | Returns `false` — no error thrown |

## 4. Error Handling Rules

- `loadPolicies()`: If the registry file does not exist, returns `[]`. If it exists but is unreadable, the error propagates from `readJson`.
- `evaluatePolicy()`: Never throws. Unmatched scopes return `{ passed: true, violations: [] }`. Unknown conditions default to `false` (not triggered).
- `evaluateAllPolicies()`: Maps over all policies; if any individual evaluation throws, the error propagates.

## 5. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
