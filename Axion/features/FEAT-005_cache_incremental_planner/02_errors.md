# FEAT-005 — Cache & Incremental Planner: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-CACHE-NNN` format.

## 2. Domain

`CACHE`

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-CACHE-001` | error | Invalid input parameter (empty namespace, missing version, invalid cachePath) | false | Validate that namespace and version are non-empty strings, and cachePath is a valid directory path. |
| `ERR-CACHE-002` | error | Invalid cache key format — missing fields or wrong segment count | false | Ensure formatted cache keys use the `namespace:version:hash` format with exactly 3 colon-separated segments. |
| `ERR-CACHE-003` | warning | Cache infrastructure issue — directory missing, manifest corrupted, or hash directory not found | true | Verify cache directory exists and integrity.json is valid JSON. Rebuild cache if necessary via `buildIntegrityManifest()`. |

## 4. Error Handling Rules

- All errors include the error code prefix (`ERR-CACHE-NNN`) in the message
- `ERR-CACHE-001` and `ERR-CACHE-002` are thrown as `Error` with the code in the message
- `ERR-CACHE-003` errors are recoverable — callers can rebuild the integrity manifest or fall back to full rebuild
- `planIncremental()` degrades gracefully: missing/corrupted previous runs result in full `rebuild` plan rather than throwing

## 5. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
