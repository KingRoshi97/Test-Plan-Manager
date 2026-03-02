# FEAT-012 — Secrets & PII Scanner / Quarantine: Contract

  ## 1. Purpose

  Scans artifacts for secrets, credentials, and PII, quarantining flagged content before it enters the pipeline.

  ## 2. Inputs

  Artifact content, scan packs (pattern definitions)

  ## 3. Outputs

  Scan results (findings with severity and location), quarantine entries

  ## 4. Invariants

  - All artifacts are scanned before pipeline progression
- Scan patterns are loaded from versioned scan packs
- Quarantined content is isolated and cannot proceed through pipeline
- Scan results include precise location pointers
- False positives can be marked but original finding is preserved

  ## 5. Dependencies

  - FEAT-001
- FEAT-004

  ## 6. Source Modules

  - `src/core/scanner/packs.ts`
- `src/core/scanner/scan.ts`
- `src/core/scanner/quarantine.ts`

  ## 7. Failure Modes

  - Secrets pass through undetected (scan pack gap)
- False positive blocks legitimate content
- Quarantine bypass without audit trail

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - No directly owned gates
  