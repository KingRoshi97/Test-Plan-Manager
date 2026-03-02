# FEAT-004 — Artifact Store & Registry: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/core/artifactStore/cas.ts`
- `src/core/artifactStore/refs.ts`
- `src/core/artifactStore/gc.ts`

  ## 2. Public Functions

  ### `store()`

- **Module**: `src/core/artifactStore/cas.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `retrieve()`

- **Module**: `src/core/artifactStore/cas.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `exists()`

- **Module**: `src/core/artifactStore/cas.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `parseRef()`

- **Module**: `src/core/artifactStore/cas.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `garbageCollect()`

- **Module**: `src/core/artifactStore/cas.ts`
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
  