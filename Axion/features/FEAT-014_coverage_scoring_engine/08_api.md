# FEAT-014 — Coverage Scoring Engine: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/core/coverage/scorer.ts`
- `src/core/coverage/rules.ts`

  ## 2. Public Functions

  ### `computeCoverage()`

- **Module**: `src/core/coverage/scorer.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `loadRules()`

- **Module**: `src/core/coverage/scorer.ts`
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
- FEAT-008

  ## 6. Cross-References

  - 01_contract.md (inputs, outputs, invariants)
  - 02_errors.md (error codes)
  - SYS-03 (End-to-End Architecture)
  