# FEAT-009 — Export Bundles: Security Requirements

## 1. Scope

Security requirements for the kit packaging and export pipeline.

## 2. Data Flow

- **Input**: Reads from `runDir` — all source artifacts are local filesystem files produced by earlier pipeline stages
- **Processing**: Copies and transforms artifacts into kit structure; generates metadata files
- **Output**: Writes to `runDir/kit/` — all output is local filesystem; no network I/O

## 3. Integrity Guarantees

- Every file in the kit has a SHA-256 hash recorded in `kit_manifest.json` and `packaging_manifest.json`
- `contentHash` (the return value) is the SHA-256 of the canonical JSON serialization of the file hash list — enables tamper detection
- Hashes are computed via `sha256()` utility from `../../utils/hash.js`
- JSON outputs use `writeCanonicalJson()` for deterministic serialization

## 4. Data Handling

- No secrets or credentials are generated or embedded by the kit builder
- Source artifacts are copied verbatim — any secrets in source data will appear in the kit
- Secrets/PII scanning is the responsibility of FEAT-012 (upstream from kit packaging)
- N/A markers are generated for empty slots to prevent information leakage about slot existence

## 5. Path Safety

- All output paths are constructed using `join()` from `node:path` — relative to `runDir/kit/`
- `ensureDir()` creates parent directories as needed
- No user-controlled path components in the kit structure (slot names are from `APP_SLOTS` constant)
- Rendered doc filenames come from `readdirSync()` of the `rendered_docs/` directory

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
- GATE-08 — Packaging Gate (Kit Contract)
