# FEAT-016 — Minimal Repro Exporter: Gates & Proofs

## 1. Applicable Gates

This feature does not own any gates directly. It operates outside the main pipeline stage/gate flow as a post-run utility. It is subject to gates enforced by upstream features (FEAT-003 Gate Engine Core) when used within a pipeline context.

## 2. Required Proof Types

| Proof Type | Name | Applicability |
|------------|------|---------------|
| P-01 | Command Output Proof | CLI `cmdRepro` output showing successful package creation |
| P-02 | Test Result Proof | Unit tests for selector and builder functions |
| P-05 | Diff/Commit Reference Proof | Code change verification |

## 3. Verification Points

- `selectReproArtifacts()` returns valid `ReproSelection` with non-empty `selected_artifacts` for a valid run directory
- `buildReproPackage()` copies all selected artifacts and writes `repro_manifest.json`
- Sensitive files are never included in `selected_artifacts`
- `content_hash` is deterministic for identical input

## 4. Cross-References

- SYS-07 (Compliance & Gate Model)
- ORD-02 (Gate DSL & Gate Rules)
- VER-01 (Proof Types & Evidence Rules)
- FEAT-003 (Gate Engine Core)
