# FEAT-004 — Artifact Store & Registry: Security Requirements

## 1. Scope

Security requirements for the Artifact Store content-addressable storage, reference tracking, and garbage collection.

## 2. Security Requirements

- Artifact content is integrity-verified by hash on every `get()` (content-addressable guarantees tamper detection)
- Storage paths are derived from hashes with a 2-character prefix directory — no user-controlled path components (prevents path traversal)
- `put()` writes to a deterministic path based on content hash — cannot overwrite unrelated files
- GC requires explicit invocation with a known set of referenced hashes — no automatic deletion
- `resolveRef()` uses `path.resolve()` for file refs but the base path is always operator-controlled

## 3. Data Classification

- Stored artifacts: Internal (may contain generated specs, manifests, evidence)
- Reference metadata: Internal (JSON files mapping names to storage refs)
- GC reports: Internal (scan/removal statistics)

## 4. Access Control

- All CAS operations are local filesystem operations scoped to the configured `storePath`
- No network access required
- Write operations (`put`, `delete`, GC) modify the store directory
- Read operations (`get`, `has`, `list`) are side-effect-free

## 5. Threat Mitigations

| Threat | Mitigation |
|--------|-----------|
| Path traversal | Hash-derived paths; no user-controlled path segments in CAS |
| Content tampering | Content-addressable: hash mismatch detectable on read |
| Unauthorized deletion | GC requires explicit referenced-hash set; `dryRun` available |
| Storage exhaustion | GC with `maxAge` threshold removes stale objects |

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
