# FEAT-003 — Gate Engine Core: Security Requirements

## 1. Scope

Security requirements for the gate evaluation engine, covering file access, path safety, and data integrity.

## 2. Path Traversal Protection

The `verify_hash_manifest` operator enforces path safety via `isPathSafe()`:
- Rejects absolute paths (`isAbsolute(p)`)
- Rejects directory traversal (`..`)
- Rejects backslash characters (`\`)
- Validates that resolved paths stay within the bundle root using `normalize()` comparison

## 3. File Access Model

- All file reads are synchronous via `readFileSync` and `existsSync`
- No external network calls during gate evaluation
- File access is read-only — evaluators never modify artifacts
- Gate reports are written once via `writeCanonicalJson` (deterministic, append-only semantics)

## 4. Data Classification

| Data | Classification | Access |
|------|---------------|--------|
| Gate registry | Internal | Read-only during evaluation |
| Artifact files | Internal | Read-only during checks |
| Gate reports | Internal | Write-once, immutable after generation |
| Run manifest | Internal | Append gate_reports entries |
| Evidence entries | Internal | Embedded in gate reports |

## 5. Integrity Guarantees

- Gate reports are written with `writeCanonicalJson` for deterministic output
- Hash verification uses SHA-256 with strict 64-char lowercase hex validation
- Evidence entries capture full audit trail (path, pointer, details)
- Failure on first check prevents partial-pass scenarios

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
- FEAT-001 (Control Plane Core — run directory access)
