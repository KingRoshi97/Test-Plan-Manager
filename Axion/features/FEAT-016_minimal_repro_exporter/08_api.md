# FEAT-016 — Minimal Repro Exporter: API Surface

## 1. Module Exports

### `src/core/repro/selector.ts`

Exports:
- `selectReproArtifacts()` — function
- `ReproSelection` — interface

### `src/core/repro/builder.ts`

Exports:
- `buildReproPackage()` — function
- `ReproPackage` — interface

### `src/cli/commands/repro.ts`

Exports:
- `cmdRepro()` — function

## 2. Public Functions

### `selectReproArtifacts(runDir: string, options?: SelectionOptions): ReproSelection`

- **Module**: `src/core/repro/selector.ts`
- **Parameters**:
  - `runDir: string` — path to run directory
  - `options.minimal?: boolean` — minimal mode (default `true`)
  - `options.include_stage_reports?: boolean` — include stage reports (default `true`)
  - `options.include_gate_reports?: boolean` — include gate reports (default `true`)
  - `options.include_proof_ledger?: boolean` — include verification artifacts (default `true`)
  - `options.stages?: string[]` — restrict to named stages
- **Returns**: `ReproSelection` — `{ run_id, selected_artifacts[], excluded_artifacts[], total_size_bytes }`
- **Throws**: `ERR-REPRO-001` if `runDir` does not exist

### `buildReproPackage(runDir: string, outputPath: string, selection: ReproSelection): ReproPackage`

- **Module**: `src/core/repro/builder.ts`
- **Parameters**:
  - `runDir: string` — source run directory
  - `outputPath: string` — destination directory for repro package
  - `selection: ReproSelection` — output from `selectReproArtifacts()`
- **Returns**: `ReproPackage` — `{ repro_id, run_id, created_at, output_path, artifacts_included, total_size_bytes, content_hash, manifest }`
- **Throws**: `ERR-REPRO-002` if `runDir` does not exist; `ERR-REPRO-003` if selection is empty
- **Side Effects**: Copies files to `outputPath`; writes `repro_manifest.json`

### `cmdRepro(runDir: string, outputPath?: string): ReproPackage`

- **Module**: `src/cli/commands/repro.ts`
- **Parameters**:
  - `runDir: string` — path to run directory
  - `outputPath?: string` — destination (defaults to `{runDir}/../repro_output`)
- **Returns**: `ReproPackage`
- **Side Effects**: Writes files to filesystem; logs progress to stdout; exits with code 1 on error

## 3. Types

### `ReproSelection`

```typescript
interface ReproSelection {
  run_id: string;
  selected_artifacts: Array<{ path: string; reason: string; hash: string }>;
  excluded_artifacts: Array<{ path: string; reason: string }>;
  total_size_bytes: number;
}
```

### `ReproPackage`

```typescript
interface ReproPackage {
  repro_id: string;
  run_id: string;
  created_at: string;
  output_path: string;
  artifacts_included: number;
  total_size_bytes: number;
  content_hash: string;
  manifest: ReproSelection;
}
```

### `SelectionOptions` (internal)

```typescript
interface SelectionOptions {
  minimal?: boolean;
  include_stage_reports?: boolean;
  include_gate_reports?: boolean;
  include_proof_ledger?: boolean;
  stages?: string[];
}
```

## 4. Error Codes

See 02_errors.md — `ERR-REPRO-001`, `ERR-REPRO-002`, `ERR-REPRO-003`.

## 5. Integration Points

- FEAT-001 (Control Plane Core — run directory structure, `RunManifest`)
- FEAT-004 (Artifact Store & Registry — artifact hashing conventions)
- Uses shared utilities: `sha256`, `ensureDir`, `isoNow`, `canonicalJsonString`

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
