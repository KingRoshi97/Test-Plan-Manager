# FEAT-013 — Ref Integrity Engine: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-DOMAIN-NNN` format defined in the ERROR_CODE_REGISTRY.

## 2. Domain

`REF`

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-REF-001` | error | Reference not found in spec | false | Verify the referenced entity exists in the canonical spec's entity collections and index. |
| `ERR-REF-002` | error | Unknown reference type | false | Verify the ref type matches a known CAN-02 ID pattern (ROLE, FEAT, WF, PERM, SCREEN, DATA, OP, INTG, UNK). |
| `ERR-REF-003` | error | Circular reference detected | false | Review the reference graph and break the cycle by removing or restructuring the circular dependency. |
| `ERR-REF-004` | warning | Reference resolved via collection scan (index missing) | false | Rebuild the spec index to include the missing entity. |
| `ERR-REF-005` | warning | Spec is null or not an object | false | Provide a valid canonical spec object. |

## 4. Error Handling Rules

- `resolveRefs()` populates `unresolved[]` with specific error messages rather than throwing
- `validateRefIntegrity()` returns a `RefResolutionResult` — callers inspect `all_valid` and `unresolved`
- `extractRefs()` returns an empty array for null/invalid input rather than throwing
- `detectCycles()` returns a `CycleResult` with `has_cycles: false` for acyclic graphs

## 5. Cross-References

- ERROR_CODE_REGISTRY.json
- FEAT-017 (Error Taxonomy & Registry)
- CAN-02 (Reference Integrity Rules)
