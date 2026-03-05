# FEAT-015 — Run Diff Engine: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-DIFF-NNN` format.

## 2. Domain

`DIFF`

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-DIFF-001` | error | Run directory does not exist | false | Verify the run directory path exists before calling `diffRuns()`. |
| `ERR-DIFF-002` | error | Path is not a directory | false | Ensure the provided path points to a directory, not a file. |

## 4. Error Handling Rules

- Both `ERR-DIFF-001` and `ERR-DIFF-002` are thrown as standard `Error` instances with the error code prefixed in the message
- File-level I/O errors (permission denied, broken symlinks) propagate as native Node.js errors
- All errors are non-retryable; the caller must fix the input before retrying

## 5. Cross-References

- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
