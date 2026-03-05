# FEAT-015 — Run Diff Engine: Security Requirements

## 1. Scope

Security requirements for the Run Diff Engine's file-system access and output handling.

## 2. Security Requirements

- Diff operations read files using `readFileSync`; no write operations are performed on run directories
- Output `DiffReport` contains only relative paths and SHA-256 hashes — no file content is included
- Run directories are accessed as provided; no path traversal normalization is applied beyond Node.js `join`/`relative`

## 3. Data Classification

- Input data: Internal (run directory contents)
- Output data: Internal (hashes and relative paths only, no raw content)

## 4. Access Control

- File-system permissions govern access to run directories
- No authentication or authorization layer is built into the diff engine itself; callers are responsible for access checks

## 5. Threat Mitigations

- No file content is ever included in `DiffReport`, preventing accidental secret leakage through diff output
- SHA-256 hashing is one-way; original content cannot be recovered from hashes

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
