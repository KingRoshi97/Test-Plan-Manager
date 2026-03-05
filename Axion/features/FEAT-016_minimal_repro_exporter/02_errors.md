# FEAT-016 — Minimal Repro Exporter: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-REPRO-NNN` format.

## 2. Domain

`REPRO`

## 3. Error Codes

| Code | Severity | Message | Thrown By | Retryable | Action |
|------|----------|---------|-----------|-----------|--------|
| `ERR-REPRO-001` | error | Run directory does not exist: `{path}` | `selectReproArtifacts()` | false | Verify run directory path exists and is accessible. |
| `ERR-REPRO-002` | error | Run directory does not exist: `{path}` | `buildReproPackage()` | false | Verify run directory path exists before calling builder. |
| `ERR-REPRO-003` | error | No artifacts selected for repro package | `buildReproPackage()` | false | Adjust selection options — `minimal: false` or verify run directory contains expected artifacts. |

## 4. Error Handling Rules

- All errors include the `ERR-REPRO-NNN` code prefix in the message string
- Errors are thrown as standard `Error` instances with the code embedded in the message
- Missing individual artifacts during copy are silently skipped (not fatal)
- The CLI command (`cmdRepro`) catches `ERR-REPRO-001` and exits with code 1

## 5. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
