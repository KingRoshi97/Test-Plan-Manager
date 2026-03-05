# FEAT-012 — Secrets & PII Scanner / Quarantine: Test Plan

## 1. Unit Tests

### 1.1 packs.ts

- `getDefaultPacks()` — returns 2 packs: `secrets-core` (8 patterns) and `pii-core` (5 patterns)
- `getDefaultPacks()` — returns deep copies (mutations do not affect subsequent calls)
- `loadScanPacks(filePath)` — loads a single JSON file containing a valid scan pack
- `loadScanPacks(dirPath)` — loads all `.json` files from a directory
- `loadScanPacks()` — throws `ERR-SCAN-001` when path does not exist
- `loadScanPacks()` — throws `ERR-SCAN-001` when directory contains no `.json` files
- `loadScanPacks()` — throws `ERR-SCAN-002` for invalid JSON
- `loadScanPacks()` — throws `ERR-SCAN-002` for missing required fields
- `mergePacks()` — merges packs from multiple sets, deduplicating by `pack_id` and `pattern_id`

### 1.2 scan.ts

- `scanArtifact()` — detects AWS access key (`AKIA...`) in a file
- `scanArtifact()` — detects private key header (`-----BEGIN RSA PRIVATE KEY-----`)
- `scanArtifact()` — detects email addresses
- `scanArtifact()` — detects SSN patterns
- `scanArtifact()` — returns empty array for binary files (`.png`, `.jpg`, etc.)
- `scanArtifact()` — returns empty array for files exceeding 10MB
- `scanArtifact()` — throws `ERR-SCAN-003` for non-existent file
- `scanArtifact()` — produces masked snippets (first 4 + `***` + last 4)
- `scanArtifact()` — generates deterministic `finding_id` (SHA-256 of path:pattern:line)
- `scanDirectory()` — recursively scans all files, excluding `node_modules`, `.git`, `.quarantine`
- `scanDirectory()` — computes correct summary counts by severity
- `scanDirectory()` — `passed` is `true` only when `critical === 0 && high === 0`
- `scanDirectory()` — throws `ERR-SCAN-003` for non-existent directory

### 1.3 quarantine.ts

- `quarantine()` — creates `.quarantine/` directory and copies flagged files
- `quarantine()` — only quarantines `critical` and `high` severity findings
- `quarantine()` — skips findings already in the ledger (idempotent)
- `quarantine()` — writes `quarantine_ledger.json` with all entries
- `quarantine()` — returns `blocked_from_kit` list of unique file paths
- `quarantine()` — throws `ERR-SCAN-004` when `runDir` does not exist
- `isQuarantined()` — returns `true` for files in the ledger
- `isQuarantined()` — returns `false` for files not in the ledger
- `getQuarantineLedger()` — returns full ledger array

## 2. Integration Tests

- End-to-end: load default packs → scan a directory with planted secrets → quarantine findings → verify ledger
- Verify `isQuarantined()` returns `true` for quarantined files after the flow
- Verify `scanDirectory().passed === false` when secrets are present
- Verify `scanDirectory().passed === true` for a clean directory

## 3. Acceptance Tests

- All invariants from 01_contract.md are satisfied
- No `NotImplementedError` remains in any scanner module
- Error codes match the SCAN domain in the Error Taxonomy Registry
- Masked snippets never reveal full secret values

## 4. Test Infrastructure

- Test framework: Vitest
- Fixtures: `test/fixtures/` (temporary directories with planted secrets for scanning)
- Helpers: `test/helpers/`

## 5. Cross-References

- VER-01 (Proof Types & Evidence Rules)
- VER-03 (Completion Criteria)
- 01_contract.md (invariants to verify)
- 04_gates_and_proofs.md (proof requirements)
