# FEAT-005 — Cache & Incremental Planner: Test Plan

## 1. Unit Tests

### 1.1 keys.ts

- `computeKey()` produces a deterministic `CacheKey` for identical `(namespace, inputs, version)`
- `computeKey()` produces different keys when inputs differ
- `computeKey()` produces different keys when namespace differs
- `computeKey()` produces different keys when version differs
- `computeKey()` serializes object keys in sorted order (property insertion order does not matter)
- `computeKey()` throws `ERR-CACHE-001` for empty namespace
- `computeKey()` throws `ERR-CACHE-001` for empty version
- `formatCacheKey()` returns `namespace:version:input_hash`
- `formatCacheKey()` throws `ERR-CACHE-002` for missing fields
- `parseCacheKey()` round-trips with `formatCacheKey()`
- `parseCacheKey()` throws `ERR-CACHE-002` for non-3-segment strings
- `parseCacheKey()` throws `ERR-CACHE-002` for empty string

### 1.2 planner.ts

- `planIncremental()` classifies all stages as `rebuild` when previous run directory is missing
- `planIncremental()` classifies all stages as `rebuild` when manifest.json is missing
- `planIncremental()` classifies all stages as `rebuild` when manifest.json is corrupted
- `planIncremental()` classifies a stage as `reuse` when cache key matches
- `planIncremental()` classifies a stage as `invalidated` + `rebuild` when cache key changes
- `planIncremental()` adds `rebuild` for new stages not in previous run
- `shouldReuse()` returns `true` for identical hash strings
- `shouldReuse()` returns `false` for different hash strings
- `hashStageInputs()` returns SHA-256 hex string
- `hashDirectory()` produces deterministic hash for identical directory contents
- `hashDirectory()` throws `ERR-CACHE-003` for non-existent directory

### 1.3 integrity.ts

- `checkIntegrity()` returns `valid: true` when all files match their hashes
- `checkIntegrity()` detects corrupted files (hash mismatch)
- `checkIntegrity()` detects missing files
- `checkIntegrity()` returns `valid: true` when no integrity manifest exists (nothing to check)
- `checkIntegrity()` throws `ERR-CACHE-001` for empty cachePath
- `checkIntegrity()` throws `ERR-CACHE-003` for non-existent directory
- `repairCache()` removes corrupted files from disk
- `repairCache()` removes corrupted and missing entries from integrity manifest
- `buildIntegrityManifest()` creates `integrity.json` with SHA-256 hashes of all files
- `buildIntegrityManifest()` excludes `integrity.json` from the manifest
- `buildIntegrityManifest()` traverses subdirectories recursively

## 2. Integration Tests

- Full cycle: `buildIntegrityManifest()` → `checkIntegrity()` → modify file → `checkIntegrity()` detects corruption → `repairCache()` cleans up
- Full cycle: `computeKey()` → `planIncremental()` with matching keys → stage reused
- Full cycle: `computeKey()` → modify inputs → `planIncremental()` → stage rebuilt
- Integration with FEAT-001 run manifest format (stage_order, stages)

## 3. Acceptance Tests

- All invariants from 01_contract.md are satisfied
- Error codes match 02_errors.md definitions
- No `NotImplementedError` remains in any cache module

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (temporary directories for cache testing)
- Helpers: `test/helpers/`

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
- 04_gates_and_proofs.md (proof requirements)
