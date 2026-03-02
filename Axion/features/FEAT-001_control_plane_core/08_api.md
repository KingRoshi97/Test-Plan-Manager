# FEAT-001 — Control Plane Core: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/core/controlPlane/api.ts`
- `src/core/controlPlane/model.ts`
- `src/core/controlPlane/store.ts`
- `src/core/controlPlane/audit.ts`
- `src/core/controlPlane/pins.ts`
- `src/core/controlPlane/releases.ts`
- `src/core/controlPlane/policies.ts`

  ## 2. Public Functions

  ### `initRun()`

- **Module**: `src/core/controlPlane/api.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `advanceStage()`

- **Module**: `src/core/controlPlane/api.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `getRunState()`

- **Module**: `src/core/controlPlane/api.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `pinArtifact()`

- **Module**: `src/core/controlPlane/api.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `evaluatePolicy()`

- **Module**: `src/core/controlPlane/api.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `createRelease()`

- **Module**: `src/core/controlPlane/api.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `queryAuditLog()`

- **Module**: `src/core/controlPlane/api.ts`
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
  