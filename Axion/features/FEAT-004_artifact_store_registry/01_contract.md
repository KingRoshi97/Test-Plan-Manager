# FEAT-004 — Artifact Store & Registry: Contract

  ## 1. Purpose

  Content-addressable storage for all pipeline artifacts with reference tracking and garbage collection.

  ## 2. Inputs

  Artifact content (any serializable data), storage references

  ## 3. Outputs

  Content hashes, storage references, GC reports

  ## 4. Invariants

  - Content-addressable: identical content always produces identical hash
- Stored artifacts are immutable — no in-place mutation
- References are resolvable to stored content
- Garbage collection only removes unreferenced artifacts

  ## 5. Dependencies

  - FEAT-001

  ## 6. Source Modules

  - `src/core/artifactStore/cas.ts`
- `src/core/artifactStore/refs.ts`
- `src/core/artifactStore/gc.ts`

  ## 7. Failure Modes

  - Hash collision (extremely unlikely but must be handled)
- Orphaned references pointing to collected artifacts
- Storage corruption without detection

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - No directly owned gates
  