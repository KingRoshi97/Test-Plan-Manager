# FEAT-017 — Error Taxonomy & Registry: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/core/taxonomy/errors.ts`
- `src/core/taxonomy/normalize.ts`

  ## 2. Public Functions

  ### `loadErrorRegistry()`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `normalizeError()`

- **Module**: `src/core/taxonomy/errors.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `lookupErrorCode()`

- **Module**: `src/core/taxonomy/errors.ts`
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

  - None (root feature)

  ## 6. Cross-References

  - 01_contract.md (inputs, outputs, invariants)
  - 02_errors.md (error codes)
  - SYS-03 (End-to-End Architecture)
  