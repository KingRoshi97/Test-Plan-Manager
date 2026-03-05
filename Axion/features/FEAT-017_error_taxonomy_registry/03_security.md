# FEAT-017 — Error Taxonomy & Registry: Security Requirements

## 1. Scope

Security requirements for the Error Taxonomy & Registry feature. This feature handles error classification and normalization — it must not leak sensitive information through error messages.

## 2. Security Requirements

- Error messages never expose internal file system paths beyond the registry path argument
- Stack traces are stripped during normalization — only `message` and `name` are preserved from Error objects
- Context sanitization removes function references to prevent serialization of closures
- The error registry is read-only at runtime; loaded once from disk, then immutable in memory
- Template interpolation uses simple `{{key}}` replacement with no code execution

## 3. Data Classification

- Input data: Internal (error events from subsystems)
- Output data: Internal (normalized error objects for logging/reporting)
- Registry data: Read-only configuration

## 4. Access Control

- Registry loading requires filesystem read access to the registry JSON file
- No write operations — the registry is consumed read-only
- Normalized errors may be included in gate reports and proof logs (append-only destinations)

## 5. Threat Mitigations

- **Information leakage**: `sanitizeContext()` strips functions and reduces Error objects to safe representations
- **Template injection**: `formatErrorMessage()` uses literal string replacement (`split/join`), not `eval` or regex-based replacement with capture groups
- **Denial of service**: Registry validation fails fast on first error, preventing processing of extremely large malformed files

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine) — scans artifacts for leaked secrets; normalized errors should not contain secrets
