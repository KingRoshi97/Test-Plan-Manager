# FEAT-009 — Export Bundles: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/core/kit/build.ts`
- `src/core/kit/entrypoint.ts`
- `src/core/kit/index.ts`
- `src/core/kit/layout.ts`
- `src/core/kit/manifest.ts`
- `src/core/kit/packager.ts`
- `src/core/kit/schemas.ts`
- `src/core/kit/validate.ts`
- `src/core/kit/versions.ts`
- `src/cli/commands/exportBundle.ts`

  ## 2. Public Functions

  ### `buildKit()`

- **Module**: `src/core/kit/build.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `packageKit()`

- **Module**: `src/core/kit/build.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `validateKit()`

- **Module**: `src/core/kit/build.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `writeManifest()`

- **Module**: `src/core/kit/build.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `writeEntrypoint()`

- **Module**: `src/core/kit/build.ts`
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
- FEAT-004

  ## 6. Cross-References

  - 01_contract.md (inputs, outputs, invariants)
  - 02_errors.md (error codes)
  - SYS-03 (End-to-End Architecture)
  