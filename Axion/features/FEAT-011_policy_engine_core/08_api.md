# FEAT-011 — Policy Engine Core: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/core/controlPlane/policies.ts`

  ## 2. Public Functions

  ### `evaluatePolicy()`

- **Module**: `src/core/controlPlane/policies.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `loadPolicies()`

- **Module**: `src/core/controlPlane/policies.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `validatePolicyDefinition()`

- **Module**: `src/core/controlPlane/policies.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants


  ## 3. Types

  All types are defined in or re-exported from:

  - `src/types/index.ts`
  - `src/types/artifacts.ts`
  - `src/types/run.ts`

  ## 4. Error Codes

  See 02_errors.md for the complete error code table for this feature.

  ## 5. Integration Points

  - FEAT-001
- FEAT-003

  ## 6. Cross-References

  - 01_contract.md (inputs, outputs, invariants)
  - 02_errors.md (error codes)
  - SYS-03 (End-to-End Architecture)
  