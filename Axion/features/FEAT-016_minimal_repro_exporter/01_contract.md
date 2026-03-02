# FEAT-016 — Minimal Repro Exporter: Contract

  ## 1. Purpose

  Selects the minimal set of artifacts needed to reproduce a pipeline issue and packages them into a self-contained repro bundle.

  ## 2. Inputs

  Run state, error context, artifact references

  ## 3. Outputs

  Minimal repro bundle (self-contained, reproducible)

  ## 4. Invariants

  - Repro bundle is self-contained — no external dependencies required
- Bundle includes only artifacts relevant to the issue
- Repro is reproducible from the bundle alone
- Sensitive data is redacted or excluded

  ## 5. Dependencies

  - FEAT-001
- FEAT-004

  ## 6. Source Modules

  - `src/core/repro/selector.ts`
- `src/core/repro/builder.ts`
- `src/cli/commands/repro.ts`

  ## 7. Failure Modes

  - Repro bundle missing critical artifacts
- Bundle includes unnecessary artifacts (not minimal)
- Sensitive data included in repro bundle

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - No directly owned gates
  