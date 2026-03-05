# FEAT-012 — Secrets & PII Scanner / Quarantine: Documentation Requirements

## 1. API Documentation

All exported functions have JSDoc-compatible signatures documented in 08_api.md:

| Module | Exported Functions |
|--------|--------------------|
| `packs.ts` | `loadScanPacks()`, `getDefaultPacks()`, `mergePacks()` |
| `scan.ts` | `scanArtifact()`, `scanDirectory()` |
| `quarantine.ts` | `quarantine()`, `isQuarantined()`, `getQuarantineLedger()` |

## 2. Architecture Documentation

### 2.1 Module Dependency Graph

```
packs.ts ──► scan.ts ──► quarantine.ts
   │              │              │
   ▼              ▼              ▼
 ScanPack    ScanFinding   QuarantineEntry
 ScanPattern  ScanResult   QuarantineResult
```

### 2.2 Data Flow

1. `loadScanPacks()` or `getDefaultPacks()` loads pattern definitions
2. `scanArtifact()` or `scanDirectory()` matches patterns against file content line-by-line
3. `ScanResult` with findings, severity summary, and pass/fail status is produced
4. `quarantine()` copies critical/high-severity files to `.quarantine/` and updates the ledger
5. `isQuarantined()` checks the ledger for kit-packaging exclusion

### 2.3 Integration Points

- FEAT-001 (Control Plane) — invokes scanning as part of pipeline execution
- FEAT-004 (Artifact Store) — scanned artifacts may be stored in CAS
- FEAT-009 (Export Bundles) — quarantined files are blocked from kit packaging
- FEAT-017 (Error Taxonomy) — error codes follow ERR-SCAN-NNN domain

## 3. Operator Documentation

### 3.1 Default Scan Packs

- `secrets-core` v1.0.0 — 8 patterns: AWS keys, API keys, private keys, GitHub tokens, passwords, JWTs, connection strings
- `pii-core` v1.0.0 — 5 patterns: emails, SSNs, US phone numbers, credit cards, IP addresses

### 3.2 Custom Scan Packs

Place JSON files in a directory and pass the path to `loadScanPacks()`. Each file must contain a JSON object (or array of objects) with: `pack_id`, `name`, `version`, `patterns[]`.

### 3.3 Troubleshooting

| Error Code | Cause | Resolution |
|------------|-------|------------|
| `ERR-SCAN-001` | Pack path not found or empty | Verify path exists and contains `.json` files |
| `ERR-SCAN-002` | Invalid pack JSON | Validate against `ScanPack` interface |
| `ERR-SCAN-003` | Scan target not found | Verify file/directory path |
| `ERR-SCAN-004` | Run directory not found | Ensure `runDir` exists before quarantine |

## 4. Change Log

- v1.0.0: Initial implementation — regex-based scanning with 2 default packs (13 patterns), quarantine with append-only ledger

## 5. Cross-References

- SYS-09 (Terminology & Definitions)
- GOV-01 (Versioning Policy)
- GOV-02 (Change Control Rules)
