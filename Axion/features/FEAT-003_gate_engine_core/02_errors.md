# FEAT-003 — Gate Engine Core: Error Codes

## 1. Error Code Format

Failure codes are returned as the `failure_code` field in `CheckResult`. They use the `E_` prefix convention.

## 2. Evaluator Failure Codes

| Code | Operator | Meaning | Remediation |
|------|----------|---------|-------------|
| `E_UNKNOWN_OP` | (any) | Operator not in `REGISTERED_OPS` set | Use one of the 6 registered operators |
| `E_FILE_MISSING` | `file_exists`, `json_valid`, `json_has`, `json_eq`, `coverage_gte` | Target file does not exist on disk | Ensure the prior stage produced the expected artifact |
| `E_JSON_INVALID` | `json_valid`, `json_has`, `json_eq`, `coverage_gte` | File exists but fails `JSON.parse` | Fix the JSON syntax in the target file |
| `E_REQUIRED_FIELD_MISSING` | `json_has`, `json_eq` | JSON pointer path does not resolve to a value | Ensure the required field exists at the specified pointer |
| `E_VALUE_MISMATCH` | `json_eq` | Field value does not equal `expected` | Update the field to match the expected value |
| `E_COVERAGE_FIELD_INVALID` | `coverage_gte` | Pointer resolves but value is not a number | Ensure the coverage field is a numeric value |
| `E_COVERAGE_BELOW_MIN` | `coverage_gte` | Numeric value is below `min` threshold | Increase coverage to meet the minimum threshold |

## 3. Hash Manifest Failure Codes

| Code | Meaning | Remediation |
|------|---------|-------------|
| `E_PACK_MANIFEST_MISSING` | Manifest file not found | Run kit packaging to generate the manifest |
| `E_PACK_MANIFEST_INVALID_JSON` | Manifest file is not valid JSON | Fix JSON syntax in the manifest file |
| `E_PACK_MANIFEST_BAD_ALGORITHM` | `algorithm` field is not `"sha256"` | Set manifest algorithm to `sha256` |
| `E_PACK_MANIFEST_FILES_INVALID` | `files` is not a non-empty array | Ensure manifest contains at least one file entry |
| `E_PACK_ENTRY_INVALID` | File entry missing `path` or `sha256` string fields | Add required fields to the manifest entry |
| `E_PACK_ENTRY_PATH_INVALID` | Path is absolute, contains `..`, `\`, or resolves outside bundle root | Use relative, safe paths within the bundle root |
| `E_PACK_ENTRY_HASH_INVALID` | SHA-256 hash is not a 64-character lowercase hex string | Regenerate the hash for the file |
| `E_PACK_BUNDLE_FILE_MISSING` | File listed in manifest does not exist in the bundle | Ensure all listed files are present in the bundle |
| `E_PACK_BUNDLE_FILE_UNREADABLE` | File exists but cannot be read | Check file permissions |
| `E_PACK_HASH_MISMATCH` | Computed SHA-256 does not match expected hash | Rebuild the kit to regenerate correct hashes |

## 4. Gate-Level Failure Reporting

When a check fails, `checksToIssues()` converts it into a `GateIssue` with:
- `issue_id`: `{gate_id}-ISS-{NNN}` (zero-padded counter)
- `severity`: `"error"`
- `error_code`: the check's `failure_code` (or `"GATE_CHECK_FAILED"` if null)
- `rule_id`: the check's `check_id` (operator name)
- `pointer`: first evidence entry's path
- `message`: descriptive failure message
- `remediation`: guidance to fix and re-run

## 5. Cross-References

- ORD-02 (Gate DSL & Gate Rules)
- FEAT-017 (Error Taxonomy & Registry)
- SYS-07 (Compliance & Gate Model)
