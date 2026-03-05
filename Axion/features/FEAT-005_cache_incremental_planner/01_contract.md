# FEAT-005 — Cache & Incremental Planner: Contract

## 1. Purpose

Deterministic caching layer and incremental planning engine. Generates reproducible cache keys from stage inputs, compares them against prior runs to identify reusable outputs, and validates cache integrity via SHA-256 hash manifests.

## 2. Inputs

| Input | Type | Source |
|-------|------|--------|
| `namespace` | `string` | Stage identifier (e.g. `S1_INGEST_NORMALIZE`) |
| `inputs` | `unknown` | Stage input payload — serialized deterministically via sorted-key JSON |
| `version` | `string` | Cache schema version string |
| `previousRunDir` | `string` | Filesystem path to a prior run directory containing `manifest.json` and `stages/` |
| `currentInputs` | `Record<string, unknown>` | Map of stage ID → current input payload |
| `cachePath` | `string` | Filesystem path to the cache directory to check or repair |

## 3. Outputs

| Output | Type | Producer |
|--------|------|----------|
| `CacheKey` | `{ namespace, input_hash, version, key }` | `computeKey()` |
| Formatted key string | `string` in format `namespace:version:input_hash` | `formatCacheKey()` |
| Parsed key | `CacheKey` | `parseCacheKey()` |
| `IncrementalPlan` | `{ reuse[], rebuild[], invalidated[] }` | `planIncremental()` |
| `boolean` | Whether a stage can be reused | `shouldReuse()` |
| `string` | SHA-256 hash of stage inputs | `hashStageInputs()` |
| `string` | SHA-256 Merkle hash of a directory tree | `hashDirectory()` |
| `IntegrityCheckResult` | `{ valid, checked, corrupted[], missing[] }` | `checkIntegrity()` |
| Integrity manifest | `Record<string, string>` written to `integrity.json` | `buildIntegrityManifest()` |

## 4. Invariants

- Cache keys are deterministic: identical `(namespace, inputs, version)` always produce the same `CacheKey.key`
- JSON serialization uses sorted object keys to ensure determinism regardless of property insertion order
- `formatCacheKey(computeKey(ns, inp, ver))` round-trips through `parseCacheKey()`
- `shouldReuse()` returns `true` if and only if the previous and current cache key strings are identical
- `planIncremental()` classifies every stage into exactly one of: `reuse`, `rebuild`, or `invalidated` (with `rebuild` entry)
- `checkIntegrity()` detects both missing files and hash-mismatched files
- `repairCache()` removes corrupted files and updates the integrity manifest — it never silently ignores errors
- `buildIntegrityManifest()` excludes `integrity.json` itself from the manifest to avoid circular hashing

## 5. Dependencies

- FEAT-001 (Control Plane Core) — provides run manifest structure and stage order
- FEAT-004 (Artifact Store) — provides content-addressable storage used alongside cache

## 6. Source Modules

- `src/core/cache/keys.ts` — cache key computation, formatting, parsing
- `src/core/cache/planner.ts` — incremental plan generation, stage reuse decisions, directory hashing
- `src/core/cache/integrity.ts` — integrity checking, repair, manifest building

## 7. Failure Modes

| Failure | Handling |
|---------|----------|
| Empty/invalid namespace or version | Throws `ERR-CACHE-001` |
| Invalid CacheKey fields | Throws `ERR-CACHE-002` |
| Malformed formatted cache key string | Throws `ERR-CACHE-002` |
| Previous run directory missing | All stages classified as `rebuild` |
| Previous run manifest corrupted | All stages classified as `rebuild` |
| Cache directory does not exist | Throws `ERR-CACHE-003` |
| Integrity manifest corrupted | Throws `ERR-CACHE-003` |
| Directory does not exist for hashing | Throws `ERR-CACHE-003` |

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- No directly owned gates
