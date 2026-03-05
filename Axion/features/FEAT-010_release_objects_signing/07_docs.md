# FEAT-010 — Release Objects & Signing: Documentation Requirements

## 1. API Documentation

All exported functions in `releases.ts` and `release.ts` have typed parameters and return types:
- `createRelease(runId, version, basePath?, artifacts?, notes?) → Release`
- `signRelease(releaseId, signer, basePath?) → Release`
- `publishRelease(releaseId, basePath?) → Release`
- `revokeRelease(releaseId, reason, basePath?) → Release`
- `getRelease(releaseId, basePath?) → Release | null`
- `listReleases(basePath?) → Release[]`
- CLI: `cmdRelease(baseDir, version, runId?, notes?) → Release`
- CLI: `cmdReleaseSign(baseDir, releaseId, signer) → Release`
- CLI: `cmdReleasePublish(baseDir, releaseId) → Release`
- CLI: `cmdReleaseRevoke(baseDir, releaseId, reason) → Release`
- CLI: `cmdReleaseGet(baseDir, releaseId) → Release | null`
- CLI: `cmdReleaseList(baseDir) → Release[]`

## 2. Architecture Documentation

- State machine: draft → staged → published → revoked (with shortcuts to revoked)
- Storage: JSON files in `{basePath}/releases/`
- Signing: SHA-256 hash of `{ release_id, signer, signed_at, artifacts }` payload
- CLI layer delegates to core `releases.ts` functions

## 3. Operator Documentation

- Create release: `cmdRelease(baseDir, "1.0.0")` — creates from latest run
- Sign release: `cmdReleaseSign(baseDir, releaseId, "operator@org")`
- Publish release: `cmdReleasePublish(baseDir, releaseId)` — requires prior signing
- Revoke release: `cmdReleaseRevoke(baseDir, releaseId, "security issue")`
- List releases: `cmdReleaseList(baseDir)`

## 4. Change Log

- v1.0.0: Initial implementation of release lifecycle with state machine and SHA-256 signing
- CLI commands implemented: create, sign, publish, revoke, get, list

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
