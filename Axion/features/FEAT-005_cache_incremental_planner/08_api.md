# FEAT-005 — Cache & Incremental Planner: API Surface

## 1. Module Exports

- `src/core/cache/keys.ts`
- `src/core/cache/planner.ts`
- `src/core/cache/integrity.ts`

## 2. Public Functions

### `computeKey(namespace: string, inputs: unknown, version: string): CacheKey`

- **Module**: `src/core/cache/keys.ts`
- **Parameters**:
  - `namespace` — Stage identifier or domain name (must be non-empty)
  - `inputs` — Arbitrary input payload; serialized via `JSON.stringify` with sorted keys
  - `version` — Cache schema version (must be non-empty)
- **Returns**: `CacheKey { namespace, input_hash, version, key }` where `key` = `namespace:version:input_hash`
- **Throws**: `ERR-CACHE-001` if namespace or version is empty/non-string

### `formatCacheKey(cacheKey: CacheKey): string`

- **Module**: `src/core/cache/keys.ts`
- **Parameters**: `cacheKey` — A `CacheKey` object with all fields populated
- **Returns**: Formatted string `namespace:version:input_hash`
- **Throws**: `ERR-CACHE-002` if required fields are missing

### `parseCacheKey(formatted: string): CacheKey`

- **Module**: `src/core/cache/keys.ts`
- **Parameters**: `formatted` — A colon-separated cache key string
- **Returns**: Parsed `CacheKey` object
- **Throws**: `ERR-CACHE-002` if format is invalid (not exactly 3 segments)

### `planIncremental(previousRunDir: string, currentInputs: unknown): IncrementalPlan`

- **Module**: `src/core/cache/planner.ts`
- **Parameters**:
  - `previousRunDir` — Path to a previous run directory (must contain `manifest.json` and `stages/`)
  - `currentInputs` — Map of stage ID → input payload for the current run
- **Returns**: `IncrementalPlan { reuse[], rebuild[], invalidated[] }`
- **Behavior**: Degrades gracefully — missing/corrupted previous runs produce full `rebuild` plans

### `shouldReuse(stage: string, previousHash: string, currentHash: string): boolean`

- **Module**: `src/core/cache/planner.ts`
- **Parameters**:
  - `stage` — Stage identifier (unused in current implementation, reserved for future policy)
  - `previousHash` — Cache key from the previous run
  - `currentHash` — Cache key from the current run
- **Returns**: `true` if hashes are identical, `false` otherwise

### `hashStageInputs(stage: string, inputs: unknown): string`

- **Module**: `src/core/cache/planner.ts`
- **Parameters**: `stage` — Stage identifier; `inputs` — Stage input payload
- **Returns**: SHA-256 hex hash of the serialized inputs

### `hashDirectory(dirPath: string): string`

- **Module**: `src/core/cache/planner.ts`
- **Parameters**: `dirPath` — Filesystem path to a directory
- **Returns**: SHA-256 Merkle hash of the directory tree (files sorted alphabetically, subdirectories recursed)
- **Throws**: `ERR-CACHE-003` if directory does not exist

### `checkIntegrity(cachePath: string): IntegrityCheckResult`

- **Module**: `src/core/cache/integrity.ts`
- **Parameters**: `cachePath` — Path to a cache directory containing `integrity.json`
- **Returns**: `IntegrityCheckResult { valid, checked, corrupted[], missing[] }`
- **Throws**: `ERR-CACHE-001` for empty cachePath; `ERR-CACHE-003` for missing directory or corrupted manifest

### `repairCache(cachePath: string, result: IntegrityCheckResult): void`

- **Module**: `src/core/cache/integrity.ts`
- **Parameters**: `cachePath` — Cache directory; `result` — Output from `checkIntegrity()`
- **Side Effects**: Deletes corrupted files, updates `integrity.json` to remove corrupted/missing entries
- **Throws**: `ERR-CACHE-001` for empty cachePath; `ERR-CACHE-003` for missing directory

### `buildIntegrityManifest(cachePath: string): Record<string, string>`

- **Module**: `src/core/cache/integrity.ts`
- **Parameters**: `cachePath` — Path to a cache directory
- **Returns**: Map of relative file paths to SHA-256 hashes (also written to `cachePath/integrity.json`)
- **Side Effects**: Creates or overwrites `integrity.json` in the cache directory
- **Throws**: `ERR-CACHE-003` if directory does not exist

## 3. Types

### `CacheKey`

```typescript
interface CacheKey {
  namespace: string;
  input_hash: string;
  version: string;
  key: string;
}
```

### `IncrementalPlan`

```typescript
interface IncrementalPlan {
  reuse: Array<{ stage: string; cache_key: string; reason: string }>;
  rebuild: Array<{ stage: string; reason: string }>;
  invalidated: Array<{ stage: string; cache_key: string; reason: string }>;
}
```

### `IntegrityCheckResult`

```typescript
interface IntegrityCheckResult {
  valid: boolean;
  checked: number;
  corrupted: Array<{ path: string; expected_hash: string; actual_hash: string }>;
  missing: string[];
}
```

## 4. Error Codes

See 02_errors.md for the complete error code table (`ERR-CACHE-001` through `ERR-CACHE-003`).

## 5. Integration Points

- FEAT-001 (Control Plane Core) — run manifest format (`manifest.json` with `stage_order`)
- FEAT-004 (Artifact Store) — content-addressable storage complements cache layer

## 6. Cross-References

- 01_contract.md (inputs, outputs, invariants)
- 02_errors.md (error codes)
- SYS-03 (End-to-End Architecture)
