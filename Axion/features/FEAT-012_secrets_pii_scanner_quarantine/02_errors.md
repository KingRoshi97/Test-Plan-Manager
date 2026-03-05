# FEAT-012 — Secrets & PII Scanner / Quarantine: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-SCAN-NNN` format registered in the SCAN domain of the Error Taxonomy Registry (FEAT-017).

## 2. Domain

`SCAN`

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-SCAN-001` | error | Scan pack loading failed — directory/file not found or unreadable | false | Verify the `packsPath` argument points to a valid directory or JSON file. Check filesystem permissions. |
| `ERR-SCAN-002` | error | Scan pack file has invalid structure — not valid JSON or missing required fields (`pack_id`, `name`, `version`, `patterns[]`) | false | Validate scan pack file against the `ScanPack` interface schema. |
| `ERR-SCAN-003` | error | Scan target not found or unreadable — file or directory does not exist or cannot be read | false | Verify the file/directory path exists and has read permissions. |
| `ERR-SCAN-004` | error | Run directory not found for quarantine operation | false | Ensure the `runDir` exists before calling `quarantine()`. |

## 4. Error Handling Rules

- All errors include the `ERR-SCAN-NNN` code as prefix in the message
- Error messages include the actual path or resource that caused the failure
- Scan pack parse errors include the file path for traceability
- Errors during individual file scans within `scanDirectory()` do not abort the full directory scan — the file is skipped
- Invalid regex patterns in scan packs are silently skipped (the finding is `null`)

## 5. Cross-References

- FEAT-017 (Error Taxonomy & Registry — SCAN domain)
- SYS-07 (Compliance & Gate Model)
