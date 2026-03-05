# FEAT-009 — Export Bundles: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-DOMAIN-NNN` format defined in the ERROR_CODE_REGISTRY.

## 2. Domain

`KIT`

## 3. Runtime Errors

| Source | Error Type | Trigger | Behavior |
|--------|-----------|---------|----------|
| `validateKit()` | `NotImplementedError` | Any call to `validateKit()` | Throws immediately; function is an unimplemented stub |
| `packageKit()` | `NotImplementedError` | Any call to `packageKit()` | Throws immediately; function is an unimplemented stub |
| `cmdExportBundle()` | `NotImplementedError` | Any call to `cmdExportBundle()` | Throws immediately; CLI command is an unimplemented stub |
| `buildRealKit()` | I/O Error | File system write failure (disk full, permissions) | Uncaught; propagates to caller |
| `safeRead()` / `safeReadJson()` | None (graceful) | Source artifact files missing or malformed JSON | Returns `null`; caller writes placeholder content |

## 4. Graceful Degradation

The `buildRealKit()` function uses `safeRead()` and `safeReadJson()` helpers that catch read/parse errors and return `null`. When a source artifact is unavailable:

- Core artifact files get `{ "note": "not available" }` placeholder content
- `spec_id` defaults to `"SPEC-UNKNOWN"`
- `projectName` defaults to `"Axion Generated Project"`
- `submissionId` defaults to `"unknown"`
- Version fields default to `"1.0.0"`
- `templates_used` defaults to `0`

## 5. Error Handling Rules

- `buildRealKit()` never throws on missing source artifacts — it always produces a valid kit
- Stub functions (`validateKit`, `packageKit`, `cmdExportBundle`) always throw `NotImplementedError`
- File system errors during writes are not caught and propagate to the caller

## 6. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
