# FEAT-012 — Secrets & PII Scanner / Quarantine: Observability

## 1. Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `scanner.packs_loaded` | counter | Number of scan packs loaded (default + custom) |
| `scanner.files_scanned` | counter | Total files scanned in a directory scan |
| `scanner.files_skipped_binary` | counter | Files skipped due to binary extension |
| `scanner.files_skipped_size` | counter | Files skipped due to exceeding MAX_FILE_SIZE |
| `scanner.findings.total` | counter | Total findings across all severities |
| `scanner.findings.critical` | counter | Critical severity findings |
| `scanner.findings.high` | counter | High severity findings |
| `scanner.findings.medium` | counter | Medium severity findings |
| `scanner.findings.low` | counter | Low severity findings |
| `scanner.quarantine.entries` | counter | Files quarantined |
| `scanner.quarantine.blocked` | counter | Unique file paths blocked from kit |
| `scanner.scan.passed` | gauge | 1 if scan passed, 0 if failed |

## 2. Logging

### 2.1 Structured Log Fields

- `feature`: `FEAT-012`
- `domain`: `scanner`
- `operation`: `loadScanPacks` | `scanArtifact` | `scanDirectory` | `quarantine` | `isQuarantined`
- `files_scanned`: Number of files processed
- `findings_count`: Number of findings produced
- `status`: `pass` | `fail`
- `error_code`: Error code if applicable (ERR-SCAN-NNN)

### 2.2 Log Levels

- `ERROR`: `ERR-SCAN-001` through `ERR-SCAN-004` — pack loading failures, file/directory not found
- `WARN`: Files skipped (binary, oversized), invalid regex patterns silently skipped
- `INFO`: Scan started, scan completed with summary, quarantine actions taken
- `DEBUG`: Per-file scan details, per-pattern match details

## 3. Traces

- Each `scanDirectory()` call generates a trace span:
  - `span_name`: `scanner.scanDirectory`
  - `feature_id`: `FEAT-012`
  - `run_id`: Current pipeline run identifier
  - Child spans for each file scanned

## 4. Alerting

- Alert when `scanner.findings.critical > 0` — critical secrets detected
- Alert when scan packs fail to load (`ERR-SCAN-001`)
- Alert when quarantine write fails

## 5. Cross-References

- SYS-06 (Data & Traceability Model)
- GOV-04 (Audit & Traceability Rules)
