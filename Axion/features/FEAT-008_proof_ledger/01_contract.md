# FEAT-008 — Proof Ledger: Contract

  ## 1. Purpose

  Append-only proof recording system that stores evidence entries linked to acceptance criteria and work units.

  ## 2. Inputs

  Proof entries (proof_type, acceptance_id, unit_id, evidence data)

  ## 3. Outputs

  Proof log entries, validation results, completion status

  ## 4. Invariants

  - Proof entries are append-only — no deletion or mutation
- Every proof links to an acceptance_id and unit_id
- Proof types are restricted to P-01..P-06 (VER-01)
- Proof is reproducible — includes enough context to rerun or re-check
- Narrative statements are never accepted as proof

  ## 5. Dependencies

  - FEAT-001
- FEAT-003

  ## 6. Source Modules

  - `src/core/proofLedger/index.ts`
- `src/core/proofLedger/ledger.ts`
- `src/core/proofLedger/registry.ts`
- `src/core/proofLedger/types.ts`
- `src/core/proofLedger/validate.ts`

  ## 7. Failure Modes

  - Proof not linked to acceptance_id (un-auditable)
- Proof stored only in chat (lost, non-deterministic)
- Manual proofs replacing objective checks for core items

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - GATE-09 — Execution Gate (Proof & Completion)
  