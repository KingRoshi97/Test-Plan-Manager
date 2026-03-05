# FEAT-004 — Artifact Store & Registry: Contract

## 1. Purpose

Content-addressable storage (CAS) for all pipeline artifacts. Provides immutable storage by hash, named reference tracking via a RefStore, and garbage collection of unreferenced objects.

## 2. Inputs

| Input | Type | Source |
|-------|------|--------|
| Artifact content | `Buffer \| string` | Pipeline stages, kit builder |
| Storage path | `string` | Run configuration |
| Hash algorithm | `"sha256" \| "sha512"` | CAS options (default `sha256`) |
| Reference name | `string` | Caller-defined logical name |
| Referenced hashes | `Set<string>` | Ref store or manifest |
| GC options | `GCOptions` | Operator / policy |

## 3. Outputs

| Output | Type | Consumer |
|--------|------|----------|
| Content hash | `string` | Hex-encoded SHA-256/512 digest |
| Retrieved content | `Buffer \| null` | Downstream stage or export |
| Storage reference | `StorageRef` | Ref store, manifests |
| GC report | `GCResult` | Operator dashboard, audit log |
| Named ref list | `string[]` | Ref queries |

## 4. Invariants

- Content-addressable: identical content always produces the identical hash (deterministic)
- Stored objects are immutable — `put()` is a no-op if the hash already exists
- `get(hash)` returns the exact bytes that were `put()`, or `null` if not stored
- `has(hash)` is consistent with `get()` — returns `true` iff `get()` would return non-null
- `delete(hash)` removes the object file and returns `true`, or returns `false` if absent
- `list()` returns all stored object hashes
- References are JSON files under `refs/` keyed by name
- `parseRef()` round-trips with `formatRef()` — `formatRef(parseRef(s)) === s`
- `resolveRef()` maps a `StorageRef` to an absolute filesystem path
- Garbage collection only removes objects not in the `referencedHashes` set
- `dryRun` GC counts but does not delete
- `maxAge` GC skips objects newer than the threshold

## 5. Dependencies

- `FEAT-001` — Control Plane provides run context and store path

## 6. Source Modules

- `src/core/artifactStore/cas.ts` — CAS engine (`createCAS`, `computeContentHash`)
- `src/core/artifactStore/refs.ts` — Reference store (`createRefStore`, `parseRef`, `formatRef`, `resolveRef`)
- `src/core/artifactStore/gc.ts` — Garbage collector (`garbageCollect`, `findUnreferencedObjects`)

## 7. Failure Modes

| Failure | Error Code | Cause |
|---------|-----------|-------|
| Invalid ref format | `ERR-ART-002` | Ref string missing scheme separator or unknown scheme |
| Missing required field | `ERR-ART-002` | CAS ref without hash, file ref without path |
| Inline ref resolution | `ERR-ART-003` | Cannot resolve inline refs to a file path |
| Filesystem error | OS error | Disk full, permission denied during `put`/`delete` |
| GC removal failure | logged in `GCResult.errors` | Permission or concurrent access |

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-04 (Artifact Taxonomy)
- KIT-02 (Manifest & Index Format)
- No directly owned gates
