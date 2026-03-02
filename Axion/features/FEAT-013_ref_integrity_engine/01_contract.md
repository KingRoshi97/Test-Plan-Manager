# FEAT-013 — Ref Integrity Engine: Contract

  ## 1. Purpose

  Validates referential integrity across all artifacts, building reference graphs and detecting broken links, cycles, and orphans.

  ## 2. Inputs

  Artifact set with embedded references (spec IDs, template refs, unit refs)

  ## 3. Outputs

  Reference graph, integrity report (broken refs, cycles, orphans)

  ## 4. Invariants

  - All references in canonical spec resolve to existing targets
- Reference graph is acyclic for dependency references
- No orphaned artifacts (every artifact is reachable)
- Reference extraction is deterministic

  ## 5. Dependencies

  - FEAT-001
- FEAT-003

  ## 6. Source Modules

  - `src/core/refs/extractor.ts`
- `src/core/refs/resolver.ts`
- `src/core/refs/graph.ts`

  ## 7. Failure Modes

  - Broken references pass through undetected
- Circular dependencies not caught before planning
- Reference extraction misses embedded ref patterns

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - GATE-04 — Spec Gate (Truth Integrity)
- GATE-05 — Planning Gate (Work Breakdown Integrity)
  