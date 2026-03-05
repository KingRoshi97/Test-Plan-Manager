# FEAT-017 — Error Taxonomy & Registry: Error Codes

## 1. Error Code Format

All error codes follow the `ERR-DOMAIN-NNN` pattern validated by `validateErrorCode()`. The regex is: `^ERR-[A-Z][A-Z0-9_]+-\d{3}$`.

## 2. Domain

`TAX` (taxonomy subsystem)

## 3. Error Codes

| Code | Severity | Message | Retryable | Action |
|------|----------|---------|-----------|--------|
| `ERR-TAX-001` | error | Error registry file not found | false | Verify the registry file path exists and is accessible. |
| `ERR-TAX-002` | error | Failed to read error registry file | false | Check file permissions and disk I/O. |
| `ERR-TAX-003` | error | Error registry file is not valid JSON | false | Validate registry file with a JSON linter. |
| `ERR-TAX-004` | error | Error registry missing required 'version' field | false | Add `"version"` string field to the registry JSON root. |
| `ERR-TAX-005` | error | Error registry missing required 'entries' array | false | Add `"entries"` array to the registry JSON root. |
| `ERR-TAX-006` | error | Error entry missing required 'code' field | false | Ensure every entry in `entries[]` has a `"code"` string. |
| `ERR-TAX-007` | error | Invalid error code format | false | Use format `ERR-DOMAIN-NNN` where DOMAIN is uppercase letters/digits and NNN is 3 digits. |
| `ERR-TAX-008` | error | Duplicate error code in registry | false | Remove or rename the duplicate code entry. |
| `ERR-TAX-009` | error | Invalid severity value | false | Use one of: `critical`, `error`, `warning`, `info`. |

## 4. Error Handling Rules

- All errors thrown by this module include the error code prefix in the message string
- Registry loading fails fast: the first validation error stops processing
- Unclassified runtime errors are normalized via `normalizeUnknownError()` with a fallback `ERR-{DOMAIN}-000` code
- Error messages must not expose stack traces or internal file paths beyond the registry path
- Context objects are sanitized: functions are stripped, Error objects are reduced to `{ message, name }`

## 5. Cross-References

- INT-05 (Error Code Catalog) — domain-specific error codes for intake
- FEAT-003 (Gate Engine Core) — gate evaluation may produce errors using this registry
- SYS-07 (Compliance & Gate Model)
