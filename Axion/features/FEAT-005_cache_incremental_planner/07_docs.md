# FEAT-005 — Cache & Incremental Planner: Documentation Requirements

## 1. API Documentation

- All exported functions have JSDoc-compatible signatures documented in 08_api.md
- Parameter types and return types are documented with TypeScript interfaces
- Error conditions reference specific `ERR-CACHE-NNN` codes from 02_errors.md

## 2. Architecture Documentation

- Three-module architecture: `keys.ts` (key generation) → `planner.ts` (incremental decisions) → `integrity.ts` (validation)
- `keys.ts` is a pure function module with no filesystem side effects
- `planner.ts` reads previous run directories and manifest files
- `integrity.ts` reads/writes integrity manifests and can delete corrupted files
- Data flow: stage inputs → `computeKey()` → `planIncremental()` compares against previous run → produces `IncrementalPlan`

## 3. Operator Documentation

- Cache keys follow the format `namespace:version:input_hash`
- The `integrity.json` file in a cache directory maps relative file paths to SHA-256 hashes
- `repairCache()` is destructive — it removes corrupted files from disk
- `buildIntegrityManifest()` should be run after populating a cache directory to enable future integrity checks

## 4. Change Log

- v1.0.0: Initial implementation — replaced `NotImplementedError` stubs with working cache key generation, incremental planning, and integrity validation

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
