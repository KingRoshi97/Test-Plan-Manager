# FEAT-016 — Minimal Repro Exporter: Security Requirements

## 1. Scope

Security requirements for the Minimal Repro Exporter, focused on preventing sensitive data leakage in exported repro bundles.

## 2. Security Requirements

- Files matching sensitive patterns are always excluded from selection regardless of mode
- Sensitive patterns include: `.env`, `secret`, `credentials`, `private_key` (case-insensitive regex matching)
- Output paths are validated to exist before writing
- No network I/O — all operations are local filesystem only

## 3. Sensitive File Exclusion

The selector applies regex-based filtering against all file paths:

| Pattern | Matches |
|---------|---------|
| `/\.env$/i` | Environment variable files |
| `/secret/i` | Any path containing "secret" |
| `/credentials/i` | Any path containing "credentials" |
| `/private_key/i` | Any path containing "private_key" |

Excluded files appear in `excluded_artifacts[]` with reason `"sensitive_content"`.

## 4. Data Classification

- Input data: Internal (run directory contents)
- Output data: Internal (repro bundle — may be shared externally after review)
- Manifest data: Internal (contains artifact hashes, no content)

## 5. Integrity Guarantees

- Every selected artifact includes a SHA-256 hash
- The package `content_hash` is a SHA-256 of all sorted artifact hashes
- `repro_manifest.json` is written using canonical JSON (deterministic key ordering)

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
