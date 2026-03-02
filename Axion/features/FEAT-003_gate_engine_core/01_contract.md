# FEAT-003 — Gate Engine Core: Contract

  ## 1. Purpose

  Deterministic gate evaluation engine that enforces pass/fail checks on artifacts and stage outputs, preventing forward progress without compliance.

  ## 2. Inputs

  Gate declarations (gate_id, target, mode, rules[]), artifact data to evaluate

  ## 3. Outputs

  Gate reports (gate_id, target, status, issues[], executed_at)

  ## 4. Invariants

  - Gate evaluation is deterministic — same input always produces same result
- Only the locked DSL operators are permitted (exists, non_empty, eq, in, count, ref_exists, schema_valid, version_eq, hash_eq, all, any, not)
- Every rule failure includes rule_id, pointer, and remediation
- Hard-stop gates block pipeline progression on failure
- Gate reports follow the standard report contract (ORD-02 Section 7)

  ## 5. Dependencies

  - FEAT-001

  ## 6. Source Modules

  - `src/core/gates/dsl.ts`
- `src/core/gates/index.ts`
- `src/core/gates/registry.ts`
- `src/core/gates/report.ts`
- `src/core/gates/reports.ts`
- `src/core/gates/run.ts`
- `src/core/gates/runner.ts`

  ## 7. Failure Modes

  - Non-deterministic evaluation due to external state
- Rule without rule_id makes compliance un-auditable
- Missing pointer_paths make remediation unclear
- Evaluation against non-authoritative sources introduces drift

  ## 8. Cross-References

  - SYS-03 (End-to-End Architecture)
  - SYS-07 (Compliance & Gate Model)
  - GATE-01 — Schema Gate (Intake Validity)
- GATE-02 — Normalization Gate (Transform Integrity)
- GATE-03 — Standards Gate (Resolved Ruleset Integrity)
- GATE-04 — Spec Gate (Truth Integrity)
- GATE-05 — Planning Gate (Work Breakdown Integrity)
- GATE-06 — Acceptance Gate (Proof Completeness)
- GATE-07 — Template Gate (Filled Doc Completeness)
- GATE-08 — Packaging Gate (Kit Contract)
- GATE-09 — Execution Gate (Proof & Completion)
  