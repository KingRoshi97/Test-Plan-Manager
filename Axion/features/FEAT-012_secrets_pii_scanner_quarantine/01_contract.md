# FEAT-012 — Secrets & PII Scanner / Quarantine: Contract

## 1. Purpose

Scans artifacts for secrets, credentials, and PII using regex-based scan packs. Findings with critical or high severity are quarantined — copies are isolated into a `.quarantine/` directory and the original file paths are blocked from kit packaging.

## 2. Inputs

| Input | Type | Source |
|-------|------|--------|
| `packsPath` | `string` | Path to directory or file containing scan pack JSON definitions |
| `filePath` | `string` | Path to a single artifact file to scan |
| `dirPath` | `string` | Path to a directory to recursively scan |
| `packs` | `ScanPack[]` | Array of loaded scan pack objects |
| `findings` | `ScanFinding[]` | Array of scan findings to quarantine |
| `runDir` | `string` | Root directory of the current pipeline run |

## 3. Outputs

| Output | Type | Description |
|--------|------|-------------|
| `ScanPack[]` | Array | Loaded scan pack definitions with patterns |
| `ScanFinding[]` | Array | Findings from scanning a single file |
| `ScanResult` | Object | Full directory scan result with summary counts and pass/fail |
| `QuarantineResult` | Object | Quarantine entries + list of blocked file paths |
| `boolean` | Primitive | Whether a specific file is quarantined |
| `QuarantineEntry[]` | Array | Full quarantine ledger for a run |

## 4. Invariants

- All artifacts are scanned before pipeline progression
- Scan patterns are loaded from versioned scan packs or built-in defaults
- Default packs include `secrets-core` (8 patterns) and `pii-core` (5 patterns)
- Binary files and files >10MB are skipped
- Directories named `node_modules`, `.git`, `.quarantine` are excluded from recursive scans
- Quarantined content is copied (not moved) to `.quarantine/` with a unique `QRN-*` ID
- A `quarantine_ledger.json` is maintained as append-only record
- Scan results never echo detected secrets in plaintext — snippets are masked
- `ScanResult.passed` is `true` only when `critical === 0 && high === 0`
- Duplicate quarantine entries (same `finding_id`) are not re-created

## 5. Dependencies

- FEAT-001 (Control Plane — pipeline integration)
- FEAT-004 (Artifact Store — content storage)
- FEAT-017 (Error Taxonomy — error code format ERR-SCAN-NNN)

## 6. Source Modules

- `src/core/scanner/packs.ts` — scan pack loading, defaults, merging
- `src/core/scanner/scan.ts` — per-file and per-directory scanning
- `src/core/scanner/quarantine.ts` — quarantine isolation and ledger

## 7. Failure Modes

| Failure | Error Code | Cause |
|---------|------------|-------|
| Pack directory/file not found | `ERR-SCAN-001` | Invalid `packsPath` argument |
| Pack file read failure | `ERR-SCAN-001` | Filesystem permission or IO error |
| Invalid pack JSON structure | `ERR-SCAN-002` | Missing `pack_id`, `name`, `version`, or `patterns[]` |
| File not found for scanning | `ERR-SCAN-003` | Missing artifact file |
| File read failure during scan | `ERR-SCAN-003` | Filesystem error |
| Directory not found for scanning | `ERR-SCAN-003` | Invalid `dirPath` |
| Run directory not found for quarantine | `ERR-SCAN-004` | Invalid `runDir` |

## 8. Cross-References

- SYS-03 (End-to-End Architecture)
- SYS-07 (Compliance & Gate Model)
- FEAT-017 (Error Taxonomy Registry — ERR-SCAN domain)
