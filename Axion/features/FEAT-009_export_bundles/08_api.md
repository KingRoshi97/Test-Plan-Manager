# FEAT-009 — Export Bundles: API Surface

## 1. Primary Function

### `buildRealKit(runDir, runId, generatedAt, baseDir): KitBuildResult`

- **Module**: `src/core/kit/build.ts` (exported as `buildKit` via index.ts)
- **Parameters**:
  - `runDir: string` — Path to the pipeline run directory
  - `runId: string` — Unique run identifier
  - `generatedAt: string` — ISO timestamp
  - `baseDir: string` — Base directory of the Axion repository
- **Returns**: `KitBuildResult` — `{ fileCount: number; contentHash: string }`
- **Side Effects**: Creates `kit/` directory tree under `runDir` with agent kit, manifests, and metadata

## 2. Placeholder Constructors

### `createPlaceholderKitManifest(runId: string): KitManifest`

- **Module**: `src/core/kit/manifest.ts`
- **Returns**: `KitManifest` with `kit_id: "kit_{runId}"`, `version: "0.0.0"`, empty `artifacts[]`, empty `metadata`

### `writeKitManifest(outputPath: string, manifest: KitManifest): void`

- **Module**: `src/core/kit/manifest.ts`
- **Side Effects**: Writes manifest as JSON to `outputPath`

### `createPlaceholderEntrypoint(runId: string): Entrypoint`

- **Module**: `src/core/kit/entrypoint.ts`
- **Returns**: `Entrypoint` with `entry_type: "placeholder"`, empty `instructions[]`

### `writeEntrypoint(outputPath: string, entrypoint: Entrypoint): void`

- **Module**: `src/core/kit/entrypoint.ts`
- **Side Effects**: Writes entrypoint as JSON to `outputPath`

### `createPlaceholderVersionStamp(runId: string): VersionStamp`

- **Module**: `src/core/kit/versions.ts`
- **Returns**: `VersionStamp` with `version: "0.0.0"`, zero-filled `content_hash` and `source_run_hash`

### `writeVersionStamp(outputPath: string, stamp: VersionStamp): void`

- **Module**: `src/core/kit/versions.ts`
- **Side Effects**: Writes version stamp as JSON to `outputPath`

## 3. Layout

### `createKitLayout(runDir: string): void`

- **Module**: `src/core/kit/layout.ts`
- **Side Effects**: Creates `kit/` directory under `runDir` via `ensureDir()`

## 4. Stubs (Not Yet Implemented)

### `validateKit(manifest: KitManifest): KitValidationResult`

- **Module**: `src/core/kit/validate.ts`
- **Status**: Throws `NotImplementedError`
- **Intended Return**: `{ valid: boolean; errors: string[] }`

### `packageKit(runDir: string, outputPath: string): void`

- **Module**: `src/core/kit/packager.ts`
- **Status**: Throws `NotImplementedError`

### `cmdExportBundle(runDir: string, profile?: BundleProfile, outputPath?: string): void`

- **Module**: `src/cli/commands/exportBundle.ts`
- **Status**: Throws `NotImplementedError`
- **Types**: `BundleProfile = "thin" | "full" | "audit" | "public" | "internal" | "repro"`

## 5. Types

### `KitManifest` (from `schemas.ts`)

```typescript
interface KitManifest {
  kit_id: string;
  run_id: string;
  version: string;
  created_at: string;
  artifacts: KitArtifactEntry[];
  metadata: Record<string, unknown>;
}
```

### `KitArtifactEntry` (from `schemas.ts`)

```typescript
interface KitArtifactEntry {
  artifact_id: string;
  path: string;
  type: string;
  hash: string;
}
```

### `Entrypoint` (from `schemas.ts`)

```typescript
interface Entrypoint {
  kit_id: string;
  run_id: string;
  entry_type: string;
  created_at: string;
  instructions: string[];
}
```

### `VersionStamp` (from `schemas.ts`)

```typescript
interface VersionStamp {
  kit_id: string;
  run_id: string;
  version: string;
  created_at: string;
  content_hash: string;
  source_run_hash: string;
}
```

### `KitBuildResult` (from `build.ts`)

```typescript
interface KitBuildResult {
  fileCount: number;
  contentHash: string;
}
```

### `KitValidationResult` (from `validate.ts`)

```typescript
interface KitValidationResult {
  valid: boolean;
  errors: string[];
}
```

## 6. Internal Functions (not exported)

- `slotForOutputPath(outputPath: string): string | null` — Maps an output path to a domain slot using `SUBDIR_TO_SLOT` lookup + keyword fallback
- `safeRead(filePath: string): string | null` — Reads file, returns null on error
- `safeReadJson<T>(filePath: string): T | null` — Reads and parses JSON, returns null on error
- `buildStartHereMd()`, `buildKitManifestMd()`, `buildKitIndexMd()`, `buildVersionsMd()`, `buildRunRulesMd()`, `buildProofLogMd()`, `buildPackMetaMd()`, `buildPackIndexMd()`, `buildGateChecklistMd()`, `buildNaMd()` — Markdown generators

## 7. Constants

- `APP_SLOTS` — Array of 12 domain slots: `01_requirements` through `12_analytics`
- `SUBDIR_TO_SLOT` — Record mapping 80+ subdirectory/template names to slot identifiers

## 8. Barrel Exports (from `index.ts`)

```typescript
export { buildRealKit as buildKit } from "./build.js";
export type { KitBuildResult } from "./build.js";
export { createPlaceholderKitManifest, writeKitManifest } from "./manifest.js";
export { createPlaceholderEntrypoint, writeEntrypoint } from "./entrypoint.js";
export { createPlaceholderVersionStamp, writeVersionStamp } from "./versions.js";
export { createKitLayout } from "./layout.js";
export { validateKit } from "./validate.js";
export type { KitValidationResult } from "./validate.js";
export { packageKit } from "./packager.js";
export type { KitManifest, KitArtifactEntry, Entrypoint, VersionStamp } from "./schemas.js";
```

## 9. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
