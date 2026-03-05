# FEAT-004 — Artifact Store & Registry: Test Plan

## 1. Unit Tests

### 1.1 CAS Tests (`cas.ts`)

- `computeContentHash()` — same content produces same hash (deterministic)
- `computeContentHash()` — different content produces different hashes
- `computeContentHash()` — accepts both `Buffer` and `string` inputs
- `computeContentHash()` — supports `sha256` and `sha512` algorithms
- `createCAS().put()` — stores content, returns hex hash string
- `createCAS().put()` — idempotent: re-putting same content returns same hash, no duplicate file
- `createCAS().get()` — returns exact `Buffer` that was put
- `createCAS().get()` — returns `null` for unknown hash
- `createCAS().has()` — returns `true` for stored hash, `false` for unknown
- `createCAS().delete()` — removes stored object, returns `true`
- `createCAS().delete()` — returns `false` for unknown hash
- `createCAS().list()` — returns all stored hashes
- `createCAS().list()` — returns empty array for empty store

### 1.2 Reference Tests (`refs.ts`)

- `parseRef("cas:<hash>")` — returns `{ scheme: "cas", hash: "<hash>" }`
- `parseRef("file:<path>")` — returns `{ scheme: "file", path: "<path>" }`
- `parseRef("inline:<data>")` — returns `{ scheme: "inline", path: "<data>" }`
- `parseRef()` — throws `ERR-ART-002` for missing separator
- `parseRef()` — throws `ERR-ART-002` for unknown scheme
- `formatRef()` — round-trips with `parseRef()` for cas and file schemes
- `formatRef()` — throws `ERR-ART-002` for CAS ref without hash
- `resolveRef()` — CAS ref resolves to `objects/<prefix>/<hash>` path
- `resolveRef()` — file ref resolves relative to basePath
- `resolveRef()` — throws `ERR-ART-003` for inline refs
- `createRefStore().set/get` — stores and retrieves ref by name
- `createRefStore().delete` — removes ref, returns `true`; `false` if missing
- `createRefStore().list` — returns all ref names
- `createRefStore().allRefs` — returns Map of all name→ref pairs

### 1.3 GC Tests (`gc.ts`)

- `findUnreferencedObjects()` — returns hashes not in referenced set
- `findUnreferencedObjects()` — returns empty for fully-referenced store
- `garbageCollect()` — removes unreferenced objects, returns correct counts
- `garbageCollect()` — `dryRun: true` counts but does not delete
- `garbageCollect()` — `maxAge` skips objects newer than threshold
- `garbageCollect()` — captures filesystem errors in `GCResult.errors`
- `garbageCollect()` — returns zero counts for empty store

### 1.4 Edge Cases

- Empty content (`""` / `Buffer.alloc(0)`) stored and retrieved correctly
- Large content (>1MB) stored and retrieved correctly
- Concurrent `put()` of same content is safe (idempotent write)

## 2. Integration Tests

- End-to-end: `put()` → `get()` → verify content matches
- CAS + RefStore: store content, create named ref, resolve ref to CAS path, read back
- GC integration: store objects, create refs for subset, GC removes only unreferenced

## 3. Acceptance Tests

- All invariants from 01_contract.md hold
- All error codes match 02_errors.md definitions
- No `NotImplementedError` in any module

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/`
- Helpers: `test/helpers/`
- Temporary directories for CAS store isolation per test

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
- 04_gates_and_proofs.md (proof requirements)
