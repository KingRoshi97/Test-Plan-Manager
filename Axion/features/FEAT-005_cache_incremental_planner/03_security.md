# FEAT-005 — Cache & Incremental Planner: Security Requirements

## 1. Scope

Security requirements for the cache key generation, incremental planning, and integrity validation subsystems.

## 2. Security Requirements

- Cache keys use SHA-256 for input hashing — collision-resistant and non-reversible
- Integrity manifests use SHA-256 to detect tampering or corruption of cached artifacts
- `repairCache()` deletes corrupted files rather than attempting to use them
- No secrets or PII are stored in cache keys — only hashes of serialized inputs
- Cache key format (`namespace:version:hash`) does not leak input data

## 3. Data Classification

- Cache keys: Internal (contain only hashes, not raw input data)
- Integrity manifests: Internal (contain file paths and SHA-256 hashes)
- Cached stage outputs: Same classification as the original stage outputs
- Audit data: Restricted (append-only)

## 4. Access Control

- Cache operations are local filesystem operations — access is controlled by OS file permissions
- `repairCache()` requires write access to the cache directory
- `buildIntegrityManifest()` requires write access to create `integrity.json`

## 5. Threat Mitigations

- **Cache poisoning**: Integrity checks via `checkIntegrity()` detect tampered cache entries
- **Hash collision attacks**: SHA-256 provides 128-bit collision resistance
- **Path traversal**: Cache paths are joined via `node:path.join()` which normalizes traversal sequences
- **Stale cache reuse**: Deterministic key generation ensures changed inputs produce different keys

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
