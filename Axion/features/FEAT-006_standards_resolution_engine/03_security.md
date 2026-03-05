# FEAT-006 — Standards Resolution Engine: Security Requirements

## 1. Scope

Security properties of the standards resolution pipeline as implemented.

## 2. Trust Boundaries

- Standards packs are loaded exclusively from `{repoRoot}/libraries/standards/` — no user-supplied arbitrary paths
- Pack file paths are resolved relative to the standards library directory using `join(libDir, packEntry.file_path)` from the index
- No network I/O; all data is read from the local filesystem via `readFileSync`

## 3. Data Flow

- **Input**: Normalized intake record (internal, produced by FEAT-001 pipeline)
- **Processing**: In-memory rule merging and conflict resolution; no external service calls
- **Output**: Canonical JSON snapshot written to the run directory

## 4. Integrity

- Snapshot ID is derived from a SHA-256 hash of canonical JSON (`shortHash` of `{ runId, rules }`), providing tamper-evident identification
- `writeCanonicalJson` ensures deterministic serialization (key ordering) so identical content always produces the same hash
- Conflict resolution is fully logged in the `conflicts` array — no silent overwrites

## 5. Override Policy

- Override records (`OverrideRecord`) are typed with `source: "user" | "admin" | "system"` and `status: "applied" | "blocked"`
- The `ResolverRules.overrides` configuration controls whether user overrides are allowed and the precedence order of override sources
- Fixed rules (`fixed: true`) cannot be overridden by configurable rules in the `fixed_over_configurable` and `stricter_wins` conflict strategies

## 6. Cross-References

- SYS-07 (Compliance & Gate Model)
- STD-02 (Standards Resolution Rules)
- FEAT-012 (Secrets & PII Scanner / Quarantine)
