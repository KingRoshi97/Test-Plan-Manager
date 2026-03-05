# FEAT-006 — Standards Resolution Engine: Gates & Proofs

## 1. Applicable Gates

### GATE-03 — Standards Gate (Resolved Ruleset Integrity)

Validates the `resolved_standards_snapshot.json` produced by the resolver:

- Snapshot file exists at `{runDir}/standards/resolved_standards_snapshot.json`
- All resolved rules are version-pinned (via `standards_library_version_used` and per-pack `pack_version`)
- `fixed_vs_configurable` map is populated for every resolved rule
- `conflicts` array is present; every conflict entry has a non-empty `resolution` string
- `selected_packs` array is non-empty (at least one pack matched)
- `resolved_standards_id` is a valid hash-based identifier

## 2. Snapshot Fields Verified by GATE-03

| Field | Check |
|-------|-------|
| `resolved_standards_id` | Non-empty, starts with snapshot_id_prefix |
| `standards_library_version_used` | Non-empty string |
| `resolver_version` | Non-empty string |
| `selected_packs` | Array length > 0 |
| `rules` | Array length > 0 |
| `fixed_vs_configurable` | Keys match `rules` array entries |
| `conflicts` | Each entry has `rule_id`, `packs`, `values`, `resolution` |

## 3. Proof Artifacts

| Artifact | Path | Description |
|----------|------|-------------|
| Standards snapshot | `{runDir}/standards/resolved_standards_snapshot.json` | Full resolved snapshot with provenance |
| Gate report | `{runDir}/gates/G3_STANDARDS_RESOLVED.json` | GATE-03 pass/fail report |

## 4. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
