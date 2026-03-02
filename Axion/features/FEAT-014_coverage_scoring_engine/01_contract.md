# FEAT-014 — Coverage Scoring Engine: Contract

  ## 1. Purpose

  Computes coverage scores across acceptance criteria, proof entries, and work units to measure pipeline completeness.

  ## 2. Inputs

  Acceptance map, proof log, work breakdown, coverage rules

  ## 3. Outputs

  Coverage scores (per-unit, per-category, aggregate)

  ## 4. Invariants

  - Coverage scoring is deterministic for identical inputs
- Score reflects actual proof coverage, not claims
- Coverage rules are configurable and version-tracked
- Zero coverage is reported explicitly (not omitted)

  ## 5. Dependencies

  - FEAT-001
- FEAT-008

  ## 6. Source Modules

  - `src/core/coverage/scorer.ts`
- `src/core/coverage/rules.ts`

  ## 7. Failure Modes

  - Coverage score inflated by invalid proofs
- Missing coverage rules produce misleading scores
- Aggregate score masks per-unit gaps

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - No directly owned gates
  