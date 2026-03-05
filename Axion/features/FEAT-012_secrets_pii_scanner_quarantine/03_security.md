# FEAT-012 — Secrets & PII Scanner / Quarantine: Security Requirements

## 1. Scope

Security requirements for the Secrets & PII Scanner / Quarantine feature, which handles the most sensitive data class in the pipeline — detected secrets and PII.

## 2. Security Requirements

- Scan findings never echo the full detected secret — the `snippet` field uses `maskSnippet()` to show only the first 4 and last 4 characters with `***` in between
- For matches ≤ 8 characters, the snippet is fully replaced with `***`
- Quarantine storage (`.quarantine/` directory) contains copies of flagged files for audit — access should be restricted at the OS level
- The quarantine ledger (`quarantine_ledger.json`) is append-only — new entries are appended, existing entries are never modified or removed
- Default scan packs are hardcoded in source to prevent tampering — custom packs loaded from disk should be integrity-checked by the operator

## 3. Data Classification

| Data | Classification |
|------|---------------|
| Scan packs (pattern definitions) | Internal |
| Scan findings (masked) | Restricted |
| Quarantine ledger | Restricted (append-only) |
| Quarantined file copies | Restricted |
| Scan summary (counts only) | Internal |

## 4. Access Control

- Scan operations are invoked by the pipeline controller (FEAT-001)
- Quarantine directory creation requires write access to `runDir`
- Quarantine ledger is append-only; no delete API is exposed
- `isQuarantined()` and `getQuarantineLedger()` are read-only queries

## 5. Threat Mitigations

| Threat | Mitigation |
|--------|------------|
| Secret leakage in scan output | Snippet masking via `maskSnippet()` |
| Regex denial of service (ReDoS) | Invalid regex patterns are caught and skipped |
| Binary file scanning overhead | Binary extensions excluded via `BINARY_EXTENSIONS` set |
| Large file memory exhaustion | Files >10MB (`MAX_FILE_SIZE`) are skipped |
| Directory traversal in quarantine | Quarantine files use generated `QRN-*` IDs, not user input |

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-017 (Error Taxonomy — SCAN domain)
