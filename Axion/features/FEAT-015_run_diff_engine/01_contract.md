# FEAT-015 — Run Diff Engine: Contract

  ## 1. Purpose

  Compares pipeline runs to produce structured diff reports, classifying changes across stages, artifacts, and gate results.

  ## 2. Inputs

  Two run snapshots (baseline and comparison)

  ## 3. Outputs

  Diff report (classified changes by stage, artifact, gate)

  ## 4. Invariants

  - Diff is deterministic for identical run pairs
- Changes are classified by type (added, removed, modified)
- Diff preserves full context for each change
- Empty diff is explicitly reported (not omitted)

  ## 5. Dependencies

  - FEAT-001
- FEAT-004

  ## 6. Source Modules

  - `src/core/diff/runDiff.ts`
- `src/core/diff/classify.ts`

  ## 7. Failure Modes

  - Diff misses changes due to incomplete artifact enumeration
- Classification errors (e.g., modified reported as added)
- Large diffs cause performance degradation

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - No directly owned gates
  