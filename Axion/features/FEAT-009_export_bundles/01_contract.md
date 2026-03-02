# FEAT-009 — Export Bundles: Contract

  ## 1. Purpose

  Packages pipeline outputs into distributable bundles with manifest, index, and version stamps per the kit layout contract.

  ## 2. Inputs

  Core artifacts, filled documents, kit layout contract (KIT-01)

  ## 3. Outputs

  Agent Kit folder, zipped kit, manifest/index, entrypoint

  ## 4. Invariants

  - Kit structure satisfies the folder contract (KIT-01)
- Manifest and index are present and correct (KIT-02)
- Version stamps are applied (KIT-04)
- N/A files are present where applicable (no silent omissions)
- Entrypoint contract is satisfied (KIT-03)

  ## 5. Dependencies

  - FEAT-001
- FEAT-003
- FEAT-004

  ## 6. Source Modules

  - `src/core/kit/build.ts`
- `src/core/kit/entrypoint.ts`
- `src/core/kit/index.ts`
- `src/core/kit/layout.ts`
- `src/core/kit/manifest.ts`
- `src/core/kit/packager.ts`
- `src/core/kit/schemas.ts`
- `src/core/kit/validate.ts`
- `src/core/kit/versions.ts`
- `src/cli/commands/exportBundle.ts`

  ## 7. Failure Modes

  - Kit missing required artifacts
- Manifest references non-existent files
- Version stamps missing or inconsistent
- Silent omissions without N/A markers

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - GATE-08 — Packaging Gate (Kit Contract)
  