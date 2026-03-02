# FEAT-002 — Operator UI Core: API Surface

  ## 1. Module Exports

  Source modules:

  - `src/cli/axion.ts`
- `src/cli/index.ts`
- `src/cli/commands/generateKit.ts`
- `src/cli/commands/validateIntake.ts`
- `src/cli/commands/resolveStandards.ts`
- `src/cli/commands/buildSpec.ts`
- `src/cli/commands/planWork.ts`
- `src/cli/commands/fillTemplates.ts`
- `src/cli/commands/packageKit.ts`
- `src/cli/commands/runGates.ts`
- `src/cli/commands/runControlPlane.ts`
- `src/cli/commands/exportBundle.ts`
- `src/cli/commands/release.ts`
- `src/cli/commands/repro.ts`

  ## 2. Public Functions

  ### `validateIntake()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `resolveStandards()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `buildSpec()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `planWork()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `fillTemplates()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `packageKit()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `runGates()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `runControlPlane()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `exportBundle()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `release()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `repro()`

- **Module**: `src/cli/axion.ts`
- **Returns**: Result object or throws registered error code
- **Side Effects**: See 01_contract.md for invariants

### `generateKit()`

- **Module**: `src/cli/axion.ts`
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
  