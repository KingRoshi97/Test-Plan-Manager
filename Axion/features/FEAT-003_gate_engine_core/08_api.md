# FEAT-003 — Gate Engine Core: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/core/gates/dsl.ts`
- `src/core/gates/index.ts`
- `src/core/gates/registry.ts`
- `src/core/gates/report.ts`
- `src/core/gates/reports.ts`
- `src/core/gates/run.ts`
- `src/core/gates/runner.ts`

  ## 2. Public Functions

  ### `evaluateGate()`

- **Module**: `src/core/gates/dsl.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `runAllGates()`

- **Module**: `src/core/gates/dsl.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `loadGateRegistry()`

- **Module**: `src/core/gates/dsl.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `parseRule()`

- **Module**: `src/core/gates/dsl.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `generateReport()`

- **Module**: `src/core/gates/dsl.ts`
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

  ## 6. Cross-References

  - 01_contract.md (inputs, outputs, invariants)
  - 02_errors.md (error codes)
  - SYS-03 (End-to-End Architecture)
  