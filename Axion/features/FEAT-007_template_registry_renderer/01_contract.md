# FEAT-007 — Template Registry & Renderer: Contract

  ## 1. Purpose

  Manages template selection, filling, and completeness validation for all document types in the Axion pipeline.

  ## 2. Inputs

  Template library, selection rules, canonical spec, standards snapshot, plans

  ## 3. Outputs

  Filled document set (templates populated per TMP-04 rules)

  ## 4. Invariants

  - Template selection is deterministic based on input profile
- Filled templates pass completeness gate (TMP-05)
- No content is invented — only spec-derived or UNKNOWN-tagged content
- Cross-references in templates resolve to canonical spec IDs
- Template structure follows the 11-section contract (TMP-02)

  ## 5. Dependencies

  - FEAT-001
- FEAT-003
- FEAT-006

  ## 6. Source Modules

  - `src/core/templates/filler.ts`
- `src/core/templates/selector.ts`
- `src/core/templates/completenessGate.ts`
- `src/core/templates/index.ts`

  ## 7. Failure Modes

  - Template filled with invented content (breaks system guarantees)
- Required fields left empty without UNKNOWN policy
- Cross-references to non-existent spec IDs
- Completeness gate bypassed

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - GATE-07 — Template Gate (Filled Doc Completeness)
  